import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import { Types } from "mongoose";
import { CallbackData, Status } from "./types";
import { getProgram, getTimezoneKeyboard } from "./helpers";
import { scheduleNotification, stopAllNotification } from "./reminder";
import { createChat, getChatById, updateChatById } from "database/controllers/chat";
import { createChallenge, updateChallengeById, updateParticipant } from "database/controllers/challenge";

type SetFirstProgram = {
  chatId: number;
  bot: TelegramBot;
}

type SetParticipantTimeZoneType = {
  chatId: number;
  callbackQuery: TelegramBot.CallbackQuery;
  bot: TelegramBot;
}

type SetProgramType = {
  bot: TelegramBot;
  programId: string;
  chatId: number;
  title: string;
  messageId?: number;
}

const INITIAL_CHALLENGE = {
  usersIn: [],
  userOut: [],
  winners: [],
  losers: [],
}

const START_PROGRAM_KEYBOARD: InlineKeyboardButton[][] = [
  [{ text: 'Я участвую', callback_data: CallbackData.ChallengeAccepted, }],
  [{ text: 'Не участвую', callback_data: CallbackData.ChallengeDeclined, }],
];

const programInfoKeyboard: InlineKeyboardButton[][] = [
  [{ text: 'Стартуем', callback_data: CallbackData.StartVoting, }],
  [{ text: 'Назад', callback_data: CallbackData.BackToPrograms, }],
];

function convertUserToParticipant(user: TelegramBot.User) {
  return ({
    ...user,
    _id: new Types.ObjectId(),
    penalty: 0,
    activeDay: 1
  });
}

export function getProgramInfo({ programId, chatId, bot, messageId, title }: SetProgramType) {
  const program = getProgram(programId);

  if (program && messageId) {
    preselectProgram(chatId!, programId, title);

    bot.editMessageText(
      `${program.title}
       ${'\n'}${program.schedule.map((day) => `*День ${day.day}:* ${day.exercise}`).join('\n')}`,
      {
        message_id: messageId,
        chat_id: chatId,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: programInfoKeyboard,
        }
      }
    );
  }
}

export async function setFirstProgram({ chatId, bot}: SetFirstProgram) {
  const chat = await getChatById(chatId);
  const program = chat && chat.preselectedProgram && getProgram(chat.preselectedProgram);

  if (program) {
    const challenge = await createChallenge({
      chatId,
      status: Status.Vote,
      programId: program.id
    });

    if (challenge) {
      const updatedChat = await updateChatById(chatId, {
        preselectedProgram: undefined,
        activeChallenge: challenge._id
      });

      if(updatedChat) {
        bot.sendMessage(chatId!,
          `Вы выбрали программу: *${program.title}!*\nКто готов учавствовать?\nКак только все участники проголосуют, введите команду /startprogram`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: START_PROGRAM_KEYBOARD,
              selective: true,
            }
          }
        );
      }
    }

  }
}

export function chooseTimeZone(bot: TelegramBot, chatId: number) {
  bot.sendMessage(chatId, 'Каждый выберите свою временную зону:', {
    reply_markup: {
      inline_keyboard: getTimezoneKeyboard(),
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  });
}

export async function startChallenge(chatId: number, bot: TelegramBot) {
  const chat = await getChatById(chatId);
  const challenge = chat?.activeChallenge;
  const program = challenge && getProgram(challenge.programId);

  if (challenge && program) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const challengeData = {
      status: Status.Active,
      participants: challenge.usersIn.map(convertUserToParticipant),
      activeDay: 1,
      startDate: tomorrow,
      usersIn: [],
    }

    const activeChallenge =  await updateChallengeById(challenge._id, challengeData);

    if (activeChallenge) {
      await bot.sendMessage(
        chatId,
        `*Почти готово!* \nПриветсвуйте смельчаков: \n${activeChallenge.participants.map((user) => `@${user.username}`).join('\n')}\n`,
        { parse_mode: 'Markdown' }
      );

      chooseTimeZone(bot, chatId);
    }
  }
}

export async function cancelChallenge(chatId: number) {
  const chat = await getChatById(chatId);
  const challenge = chat?.activeChallenge;

  console.log('cancelChallenge', challenge);


  if (challenge) {
    await updateChallengeById(challenge._id, {
      status: Status.Canceled,
    });

    await updateChatById(chatId, {
      activeChallenge: undefined,
      archive: [...chat.archive, challenge],
    });

    stopAllNotification(challenge);
  }
}

export async function preselectProgram(
  chatId: number,
  programId: string,
  title: string = ''
) {
  const chat = await getChatById(chatId);

  if (chat) {
    await updateChatById(chatId, { preselectedProgram: programId});
  } else {
    await createChat({ chatId, programId, title });
  }
}

export async function setParticipantTimeZone({ chatId, callbackQuery, bot }: SetParticipantTimeZoneType) {
  const userId = callbackQuery.from.id;
  const timezone = callbackQuery.data?.replace(`${CallbackData.TimeZone}_`, '');
  const chat = await getChatById(chatId);
  const challenge = chat?.activeChallenge;

  if (challenge) {
    const participant = challenge.participants.find((user) => user.id === userId);

    if (participant) {
      const updated = await updateParticipant(challenge._id, participant._id, { timezone: timezone });

      await bot.sendMessage(chatId!,
        `@${callbackQuery?.from?.username}  Выбрал часовой пояс! - ${callbackQuery.data?.replace(`${CallbackData.TimeZone}_`, '')}`,
        { disable_notification: true },
      );



      if (updated && updated.participants.every((user) => user.timezone)) {
        const program = challenge && getProgram(challenge.programId);

        await bot.sendMessage(chatId!,
          `Все выбрали часовой пояс, соревнование началось!
          Завтра первый день и задание будет такое: ${program?.schedule[0].exercise}`,
          { disable_notification: true },
        );

        scheduleNotification(bot, updated);
        bot.deleteMessage(chatId, callbackQuery.message?.message_id!);
      }
    }
  }
}

export async function setDayDone(chatId: number, userId: number) {
  const chat = await getChatById(chatId);
  const challenge = chat?.activeChallenge;
  const currentProgram = challenge && getProgram(challenge.programId);

  if (currentProgram) {
    const user = challenge.participants.find((user) => user.id === userId);

    if (user) {
      if (currentProgram.schedule.at(-1)?.day === user?.activeDay) {
        const updatedUser = {
          activeDay: user.activeDay! + 1,
          winner: true,
          out: false,
          outDateNumber: user.activeDay,
          penalty: 0,
        }

        await updateParticipant(challenge._id, user._id, updatedUser);

        const updated = await updateChallengeById(challenge._id, {
          winners: [...challenge.winners, user],
          losers: challenge.losers.filter((loser) => loser.id !== user.id),
        });

        return updated;
      }

      const updated = await updateParticipant(challenge._id, user._id, { activeDay: user.activeDay! + 1 });

      return updated;
    }
  }
}

export async function setNewDay(chatId: number): Promise<string | undefined> {
  const chat = await getChatById(chatId);
  const challenge = chat?.activeChallenge;
  const program = challenge && getProgram(challenge.programId);

  if (challenge) {
    const newDay = challenge.activeDay! + 1;

    await updateChallengeById(challenge._id, { activeDay: newDay });

    if (program) {
      return program.schedule[newDay].exercise;
    }
  }
}

export async function setParticipantPenalty(chatId: number, userId: number) {
  const chat = await getChatById(chatId);
  const challenge = chat?.activeChallenge;

  if (challenge) {
    const user = challenge.participants.find((user) => user.id === userId);

    if (user) {
      await updateParticipant(challenge._id, user._id, { penalty: 1 });
    }
  }
}

export async function setParticipantOut(chatId: number, userId: number) {
  const chat = await getChatById(chatId);
  const challenge = chat?.activeChallenge;

  if (challenge) {
    const user = challenge.participants.find((user) => user.id === userId);

    if (user) {
      await updateParticipant(challenge._id, user._id, {
         out: true,
         winner: false,
         outDateNumber: user.activeDay
      });
    }
  }
}

