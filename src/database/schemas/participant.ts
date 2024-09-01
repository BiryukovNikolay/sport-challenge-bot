import { Schema, Types } from "mongoose";
import TelegramBot from "node-telegram-bot-api";

export type Participant = TelegramBot.User & {
  id: number;
  _id: Types.ObjectId;
  language_code?: string;
  penalty: number;
  activeDay: number;
  out?: boolean;
  outDateNumber?: number;
  timezone?: string;
  winner?: boolean;
  notificationIds?: number[];
};

export const ParticipantSchema: Schema = new Schema({
  id: { type: Number, required: true },
  _id: { type: Types.ObjectId, required: true },
  is_bot: { type: Boolean, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String },
  username: { type: String },
  language_code: { type: String },
  penalty: { type: Number, required: true },
  activeDay: { type: Number, required: true },
  out: { type: Boolean },
  outDateNumber: { type: Number },
  timezone: { type: String },
  winner: { type: Boolean },
  notificationIds: [{ type: Number }],
});
