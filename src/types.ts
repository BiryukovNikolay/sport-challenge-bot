import TelegramBot from "node-telegram-bot-api";

export enum Status {
  Active = 'active',
  Finished = 'finished',
  Vote = 'vote',
  Canceled = 'canceled',
}

export enum CallbackData {
  ChallengeDeclined = 'challenge_declined',
  ChallengeAccepted = 'challenge_accepted',
  StartProgram = 'start_program',
  WaitProgram = 'wait_program',
  ContinueProgram = 'continue_program',
  CancelProgram = 'cancel_program',
  BackToPrograms = 'back_to_programs',
  StartVoting = 'start_voting',
  TimeZone = 'timezone',
  UserDone = 'user_done',
  UserNotDone = 'user_not_done',
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

export type Participant = TelegramBot.User & {
  penalty: number;
  activeDay: number;
  out?: boolean;
  outDateNumber?: number;
  timezone?: string;
  winner?: boolean;
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
  activeDay?: number;
  startDate?: Date;
}

export type ChatType = {
  id: number;
  archive: ChallengeType[];
  activeChallenge?: ChallengeType;
  preselectedProgram?: string;
}


