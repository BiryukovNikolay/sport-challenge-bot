import type TelegramBot from 'node-telegram-bot-api';
import mongoose, { Schema } from 'mongoose';
import { Status } from 'src/types';
import { Participant } from './participant';

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
  participants: [{ type: Schema.Types.ObjectId, ref: 'Participant' }],
  winners: [{ type: Schema.Types.ObjectId, ref: 'Participant' }],
  losers: [{ type: Schema.Types.ObjectId, ref: 'Participant' }],
  usersIn: [{ type: Object }],
  userOut: [{ type: Object }],
  status: { type: String, required: true },
  activeDay: { type: Number },
  startDate: { type: Date },
});

export const Challenge = mongoose.model<ChallengeType & Document>('Challenge', ChallengeSchema);
