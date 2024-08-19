import TelegramBot from "node-telegram-bot-api";
import { Participant, Status } from "./types";
import { programs, challenges } from "./data";
import { getKey } from "./helpers";

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

export function startChallenge(chatId: number, bot: TelegramBot) {
  const currentChallenge = challenges[chatId]?.activeChallenge;
    const currentProgram = programs.find((program) => program.id === currentChallenge?.programId);

    if (currentChallenge && currentProgram) {
      currentChallenge.status = Status.Active;
      currentChallenge.participants = currentChallenge.usersIn.map((user) => ({...user, penalty: 0, activeDay: 1}));

      bot.sendMessage(chatId, `*Соревнование началось!*\n
      Приветсвуйте смельчаков: ${currentChallenge.participants.map((user) => `@${user.username}`).join('\n')}\n
      Завтра первый день и задание будет такое: ${currentProgram.schedule[0].exercise}`, {
        parse_mode: 'Markdown',
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

