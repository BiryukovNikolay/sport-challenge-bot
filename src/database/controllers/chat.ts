import { ChallengeType } from './../../types';
import { Chat, ChatType } from "database/models/chat";
import { errorBoundary } from "./helpers";
import { ObjectId, Types } from 'mongoose';

type CreateChatType = {
  chatId: number;
  title: string;
  programId: string;
};

type GetChatResultType = ChatType & {activeChallenge?: (ChallengeType & {_id: Types.ObjectId})}

export async function createChat({
  chatId,
  title,
  programId
}: CreateChatType): Promise<ChatType | null> {
  return errorBoundary(async () => {
    const data = {
      id: chatId.toString(),
      title,
      archive: [],
      preselectedProgram: programId,
    };

    const chat = new Chat(data);
    await chat.save();
    return chat;
  });
}

export async function getChatById(chatId: number): Promise<GetChatResultType | null> {
  return errorBoundary(async () => {
    const chat = await Chat.findOne({ id: chatId }).populate('activeChallenge').exec();

    if (!chat) {
      return null;
    }

    return chat as GetChatResultType;
  });
}

export async function updateChatById(
  chatId: number,
  updateData: Partial<ChatType>
): Promise<ChatType | null> {
  return errorBoundary(async () => {
    const updatedChat = await Chat.findOneAndUpdate(
      { id: chatId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedChat) {
      return null;
    }

    return updatedChat;
  });
}
