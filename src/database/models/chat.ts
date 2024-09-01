import mongoose, { Types, Schema } from 'mongoose';

export type ChatType = {
  id: number;
  title: string;
  archive: Types.ObjectId[];
  activeChallenge?: Types.ObjectId;
  preselectedProgram?: string;
};

const ChatSchema: Schema = new Schema({
  id: { type: Number, required: true },
  title: { type: String },
  archive: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
  activeChallenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
  preselectedProgram: { type: String },
});

export const Chat = mongoose.model<ChatType & Document>('Chat', ChatSchema);
