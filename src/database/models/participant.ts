import mongoose, { Schema, Document } from 'mongoose';
import type TelegramBot from 'node-telegram-bot-api';

export type Participant = TelegramBot.User & {
  penalty: number;
  activeDay: number;
  out?: boolean;
  outDateNumber?: number;
  timezone?: string;
  winner?: boolean;
};

const ParticipantSchema: Schema = new Schema({
  id: { type: Number, required: true },
  is_bot: { type: Boolean, required: true },
  first_name: { type: String},
  last_name: { type: String },
  username: { type: String },
  language_code: { type: String },
  penalty: { type: Number, required: true },
  activeDay: { type: Number, required: true },
  out: { type: Boolean, default: false },
  outDateNumber: { type: Number },
  timezone: { type: String, required: true },
  winner: { type: Boolean, default: false },
});

export const Participant = mongoose.model<Participant & Document>('Participant', ParticipantSchema);
