import type TelegramBot from 'node-telegram-bot-api';
import mongoose, { Schema } from 'mongoose';
import { Status } from 'src/types';
import { Participant } from 'database/schemas/participant';
import { ParticipantSchema } from 'database/schemas/participant';

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
};

const ChallengeSchema: Schema = new Schema({
  key: { type: String, required: true },
  chatId: { type: Number, required: true },
  programId: { type: String, required: true },
  participants: [ParticipantSchema],
  winners: [ParticipantSchema],
  losers: [ParticipantSchema],
  usersIn: [{ type: Object }],
  userOut: [{ type: Object }],
  status: { type: String, required: true },
  activeDay: { type: Number },
  startDate: { type: Date },
});

export const Challenge = mongoose.model<ChallengeType & Document>('Challenge', ChallengeSchema);
