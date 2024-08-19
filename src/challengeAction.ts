import TelegramBot from "node-telegram-bot-api";
import { CallbackData, Participant, Status } from "./types";
import { programs, challenges } from "./data";
import { getKey } from "./helpers";
import moment from "moment-timezone";
import { TIME_ZONES } from "./constants";

type CreateChallengeType = {
  chatId: number;
  status: Status;
  participants: Participant[];
}

const INITIAL_CHALLENGE = {
  usersIn: [],
  userOut: [],
  winners: [],
  losers: [],
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

export async function startChallenge(chatId: number, bot: TelegramBot) {
  const currentChallenge = challenges[chatId]?.activeChallenge;
    const currentProgram = programs.find((program) => program.id === currentChallenge?.programId);

    if (currentChallenge && currentProgram) {
      currentChallenge.status = Status.Active;
      currentChallenge.participants = currentChallenge.usersIn.map((user) => ({...user, penalty: 0, activeDay: 1}));
      currentChallenge.activeDay = 1;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1)
      currentChallenge.startDate = tomorrow;

      await bot.sendMessage(chatId, `*Почти готово!*\n
      Приветсвуйте смельчаков: ${currentChallenge.participants.map((user) => `@${user.username}`).join('\n')}\n`,
      {
        parse_mode: 'Markdown',
      });

      const keyboard = TIME_ZONES.map((tz) => {
        const currentTime = moment().tz(tz).format('HH:mm');
        return [{ text: `${tz} - ${currentTime}`, callback_data: `${CallbackData.TimeZone}_${tz}` }];
      });

      bot.sendMessage(chatId, 'Каждый выберите свою временную зону:', {
        reply_markup: {
          inline_keyboard: keyboard,
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      });
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

type SetParticipantTimeZoneType = {
  chatId: number;
  callbackQuery: TelegramBot.CallbackQuery;
  bot: TelegramBot;
}

export async function setParticipantTimeZone({ chatId, callbackQuery, bot }: SetParticipantTimeZoneType) {
  const userId = callbackQuery.from.id;
  const timezone = callbackQuery.data?.replace(`${CallbackData.TimeZone}_`, '');
  const challenge = challenges[chatId]?.activeChallenge;
  const program = programs.find((program) => program.id === challenge?.programId);

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
    bot.sendMessage(chatId!,
      `Все выбрали часовой пояс, соревнование началось!
      Завтра первый день и задание будет такое: ${program.schedule[0].exercise}`,
      { disable_notification: true },
    );

    bot.deleteMessage(chatId, callbackQuery.message?.message_id!);
  }
}

