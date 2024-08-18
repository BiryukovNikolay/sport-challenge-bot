import TelegramBot from "node-telegram-bot-api";

export enum Status {
  Active = 'active',
  Finished = 'finished',
  Vote = 'vote',
  Canceled = 'canceled',
}

export type ScheduleType = {
  day: number,
  exercise: string
}

export type ProgramType = {
  id: string,
  title: string,
  rules: string,
  schedule: ScheduleType[]
}


export enum CallbackData {
  ChallengeDeclined = 'challenge_declined',
  ChallengeAccepted = 'challenge_accepted',
  StartProgram = 'start_program',
  WaitProgram = 'wait_program',
  ContinueProgram = 'continue_program',
  CancelProgram = 'cancel_program',
}

export type Participant = TelegramBot.User & {
  penalty: number;
  activeDay: number;
  out?: boolean;
  outDateNumber?: number;
  timezone?: string;
};

export type ChallengeType = {
  key: string;
  chatId: number;
  programId: string;
  participants: Participant[];
  winners: Participant[];
  losers: Participant[];
  usersIn: TelegramBot.User[];
  userOut: TelegramBot.User[];
  status: Status;
}

export type ChatType = {
  id: number;
  archive: ChallengeType[];
  activeChallenge?: ChallengeType;
}


