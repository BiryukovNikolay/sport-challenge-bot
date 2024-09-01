import { Status } from "src/types";
import { errorBoundary } from "./helpers";
import { getKey } from "src/helpers";
import { Challenge, ChallengeType } from "database/models/challenge";
import { Participant } from "database/schemas/participant";
import { Types } from "mongoose";

const INITIAL_CHALLENGE = {
  usersIn: [],
  userOut: [],
  winners: [],
  losers: [],
}

type CreateChallengeType = {
  chatId: number;
  status: Status;
  programId: string;
  participants?: Participant[];
}

type CrateChallengeResultType = ChallengeType & {_id: Types.ObjectId; } & Document;

export async function createChallenge({
  chatId,
  status,
  programId,
  participants = [],
}: CreateChallengeType): Promise<CrateChallengeResultType | null> {
  return errorBoundary(async () => {
    const data = {
      key: getKey(),
      programId,
      chatId,
      participants,
      status,
      ...INITIAL_CHALLENGE
    };
    const challenge = new Challenge(data);
    await challenge.save();
    return challenge;
  });
}

export async function updateChallengeById(
  challengeId: Types.ObjectId,
  updateData: Partial<ChallengeType>
): Promise<ChallengeType | null> {
  return errorBoundary(async () => {
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      challengeId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedChallenge) {
      return null;
    }

    return updatedChallenge;
  });
}

export async function updateParticipant(
  challengeId: Types.ObjectId,
  userId: Types.ObjectId,
  updateData: Partial<Participant>
): Promise<ChallengeType | null> {
  return errorBoundary(async () => {
    const setFields: Record<string, any> = {};
    if ('timezone' in updateData) setFields['participants.$.timezone'] = updateData.timezone;
    if ('activeDay'in updateData) setFields['participants.$.activeDay'] = updateData.activeDay;
    if ('penalty' in updateData) setFields['participants.$.penalty'] = updateData.penalty;
    if ('out' in updateData) setFields['participants.$.out'] = updateData.out;
    if ('outDateNumber' in updateData) setFields['participants.$.outDateNumber'] = updateData.outDateNumber;
    if ('winner' in updateData) setFields['participants.$.winner'] = updateData.winner;

    const updatedChallenge = await Challenge.findOneAndUpdate(
      { _id: challengeId, 'participants._id': userId },
      { $set: setFields },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedChallenge) {
      return null;
    }

    return updatedChallenge;
  });
}
