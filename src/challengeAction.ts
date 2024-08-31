import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import { CallbackData, Participant, Status } from "./types";
import { challenges } from "./data";
import { getKey, getProgram, getTimezoneKeyboard } from "./helpers";
import { scheduleNotification } from "./reminder";

type CreateChallengeType = {
  chatId: number;
  status: Status;
  participants: Participant[];
}

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

export function getProgramInfo({ programId, chatId, bot, messageId}: SetProgramType) {
  const program = getProgram(programId);

  if (program && messageId) {
    preselectProgram(chatId!, programId);

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

export function createChallenge({chatId, status, participants}: CreateChallengeType) {
  const chat = challenges[chatId];

  if (chat && chat.preselectedProgram) {
    chat.activeChallenge = {
      key: getKey(),
      programId: chat.preselectedProgram,
      chatId,
      participants: participants,
      status,
      ...INITIAL_CHALLENGE
    };
    chat.preselectedProgram = undefined;
  }
}

export function setFirstProgram({ chatId, bot}: SetFirstProgram) {
  const chat = challenges[chatId];
  const program = chat && chat.preselectedProgram && getProgram(chat.preselectedProgram);

  if (program) {
    createChallenge({
      chatId: chatId!,
      status: Status.Vote,
      participants: [],
    })

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
  const currentChallenge = challenges[chatId]?.activeChallenge;
  const currentProgram = currentChallenge && getProgram(currentChallenge.programId);

  if (currentChallenge && currentProgram) {
    currentChallenge.status = Status.Active;
    currentChallenge.participants = currentChallenge.usersIn.map((user) => ({...user, penalty: 0, activeDay: 1}));
    currentChallenge.activeDay = 1;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1)
    currentChallenge.startDate = tomorrow;

    await bot.sendMessage(
      chatId,
      `*Почти готово!* \nПриветсвуйте смельчаков: \n${currentChallenge.participants.map((user) => `@${user.username}`).join('\n')}\n`,
      { parse_mode: 'Markdown' }
    );

    chooseTimeZone(bot, chatId);
  }
}

export function cancelChallenge(chatId: number) {
  const active = challenges[chatId]?.activeChallenge;

  if (active) {
    active.status = Status.Canceled;
    challenges[chatId].archive.push(active);
    challenges[chatId].activeChallenge = undefined;
  }
}

export function preselectProgram(chatId: number, programId: string) {
  const chat = challenges[chatId];

  if (chat) {
    chat.preselectedProgram = programId;
  } else {
    challenges[chatId] = {
      id: chatId,
      archive: [],
      preselectedProgram: programId,
    };
  }
}

export async function setParticipantTimeZone({ chatId, callbackQuery, bot }: SetParticipantTimeZoneType) {
  const userId = callbackQuery.from.id;
  const timezone = callbackQuery.data?.replace(`${CallbackData.TimeZone}_`, '');
  const challenge = challenges[chatId]?.activeChallenge;
  const program = challenge && getProgram(challenge.programId);

  if (challenge) {
    const participant = challenge.participants.find((user) => user.id === userId);

    if (participant) {
      participant.timezone = timezone;

      await bot.sendMessage(chatId!,
        `@${callbackQuery?.from?.username}  Выбрал часовой пояс! - ${callbackQuery.data?.replace(`${CallbackData.TimeZone}_`, '')}`,
        { disable_notification: true },
      );
    }
  }

  if (program && challenge && challenge.participants.every((user) => user.timezone)) {
    await bot.sendMessage(chatId!,
      `Все выбрали часовой пояс, соревнование началось!
      Завтра первый день и задание будет такое: ${program.schedule[0].exercise}`,
      { disable_notification: true },
    );

    scheduleNotification(bot, challenge);
    bot.deleteMessage(chatId, callbackQuery.message?.message_id!);
  }
}

export function setDayDone(chatId: number, userId: number) {
  const currentChallenge = challenges[chatId]?.activeChallenge;
  const currentProgram = currentChallenge && getProgram(currentChallenge.programId);

  if (currentProgram) {
    const user = currentChallenge.participants.find((user) => user.id === userId);

    if (user) {
      if (currentProgram.schedule.at(-1)?.day === user?.activeDay) {
        user.activeDay = user.activeDay! + 1;
        user.winner = true;
        user.out = false;
        user.outDateNumber = user.activeDay;
        user.penalty = 0;

        currentChallenge.winners.push(user);
        currentChallenge.losers = currentChallenge.losers.filter((loser) => loser.id !== user.id);

        return;
      }

      user.activeDay = user.activeDay! + 1;
    }
  }
}

export function setNewDay(chatId: number): string | undefined {
  const currentChallenge = challenges[chatId]?.activeChallenge;
  const currentProgram = currentChallenge && getProgram(currentChallenge.programId);

  if (currentChallenge) {
    currentChallenge.activeDay = currentChallenge.activeDay! + 1;

    if (currentProgram) {
      const nextExercise = currentProgram.schedule[currentChallenge.activeDay].exercise;

      return nextExercise;
    }
  }
}

export function setParticipantPenalty(chatId: number, userId: number) {
  const currentChallenge = challenges[chatId]?.activeChallenge;

  if (currentChallenge) {
    const user = currentChallenge.participants.find((user) => user.id === userId);

    if (user) {
      user.penalty = 1;
    }
  }
}

export function setParticipantOut(chatId: number, userId: number) {
  const currentChallenge = challenges[chatId]?.activeChallenge;

  if (currentChallenge) {
    const user = currentChallenge.participants.find((user) => user.id === userId);

    if (user) {
      user.out = true;
      user.winner = false;
      user.outDateNumber = user.activeDay;
    }
  }
}

