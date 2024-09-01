import { ChallengeType, Status } from "src/types";
import { errorBoundary } from "./helpers";
import { getKey } from "src/helpers";
import { Challenge } from "database/models/challenge";
import { Participant } from "database/models/participant";
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
