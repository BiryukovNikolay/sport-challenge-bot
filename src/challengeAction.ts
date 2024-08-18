import TelegramBot from "node-telegram-bot-api";
import { ChallengeType, Participant, Status } from "./types";
import { programs, challenges } from "./data";
import { getKey } from "./helpers";

type CreateChallengeType = {
  programId: string;
  chatId: number;
  status: Status;
  participants: Participant[];
}

export function createChallenge({programId, chatId, status, participants}: CreateChallengeType) {
  const program = programs.find((program) => program.id === programId);

  if (!program) {
    return;
  }

  const challenge: ChallengeType = {
    key: getKey(),
    programId: program.id,
    chatId,
    participants: participants,
    status: status,
    usersIn: [],
    userOut: [],
    winners: [],
    losers: [],
  };

  if (challenges[chatId]) {
    challenges[chatId].activeChallenge = challenge;
  } else {
    challenges[chatId] = {
      id: chatId,
      archive: [],
      activeChallenge: challenge,
    };
  }
}

export function startChallenge(chatId: number, bot: TelegramBot) {
  const currentChallenge = challenges[chatId]?.activeChallenge;
    const currentProgram = programs.find((program) => program.id === currentChallenge?.programId);

    if (currentChallenge && currentProgram) {
      currentChallenge.status = Status.Active;
      currentChallenge.participants = currentChallenge.usersIn.map((user) => ({...user, penalty: 0, activeDay: 1}));

      bot.sendMessage(chatId, `Соревнование началось!
      Приветсвуйте смельчаков: ${currentChallenge.participants.map((user) => `@${user.username}`).join(', ')}

      Завтра первый день и задание будет такое: ${currentProgram.schedule[0].exercise}`);
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

