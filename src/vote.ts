import TelegramBot from "node-telegram-bot-api";
import { Status } from "./types";
import { getChatById } from "database/controllers/chat";
import { updateChallengeById } from "database/controllers/challenge";

type VoteType = {
  bot: TelegramBot;
  callbackQuery: TelegramBot.CallbackQuery;
  chatId: number;
}

async function getChallenge(chatId: number) {
  const chat = await getChatById(chatId);
  return chat?.activeChallenge;
}

function sendStartedChallengeMessage(bot: TelegramBot, chatId: number, callbackQuery: TelegramBot.CallbackQuery) {
  bot.answerCallbackQuery(callbackQuery.id, { text: 'Поздняк, соревнование уже идет' })
  bot.deleteMessage(chatId!, callbackQuery.message?.message_id!);
}

export async function voteChallengeDeclined({ bot, callbackQuery, chatId }: VoteType) {
  const challenge = await getChallenge(chatId);

  if (!challenge) {
    return;
  }

  if (challenge.status !== Status.Vote) {
    sendStartedChallengeMessage(bot, chatId, callbackQuery);
    return;
  }

  const declinedUser = challenge.userOut.find((user) => user.id === callbackQuery.from.id);
  const acceptedUser = challenge.usersIn.find((user) => user.id === callbackQuery.from.id);

  if (!declinedUser) {
    const newOut = { userOut: [...challenge.userOut, callbackQuery.from] };
    const newIn = { usersIn: challenge.usersIn.filter((user) => user !== acceptedUser) };

    await updateChallengeById(challenge._id, { ...newOut, ...newIn });

    bot.sendMessage(chatId!,
      `@${callbackQuery?.from?.username}  Соскочил!`,
      { disable_notification: true },
    );

    bot.answerCallbackQuery(callbackQuery.id, { text: 'Фууу, слабак!' });

    return;
  }

  bot.answerCallbackQuery(callbackQuery.id, { text: 'Ты уже соскочил!'});
}


export async function voteChallengeAccepted({ bot, callbackQuery, chatId }: VoteType) {
  const challenge = await getChallenge(chatId);

  if (!challenge) {
    return;
  }

  if (challenge.status !== Status.Vote) {
    sendStartedChallengeMessage(bot, chatId, callbackQuery);
    return;
  }

  const activeUser = challenge.usersIn.find((user) => user.id === callbackQuery.from.id);
  const declinedUser = challenge.userOut.find((user) => user.id === callbackQuery.from.id);

  if (!activeUser) {
    const newIn = { usersIn: [...challenge.usersIn, callbackQuery.from] };
    const newOut = { userOut: challenge.userOut.filter((user) => declinedUser !== user) };

    await updateChallengeById(challenge._id, { ...newIn, ...newOut });

    bot.sendMessage(chatId!,
      `@${callbackQuery?.from?.username}  Принял вызов!`,
      { disable_notification: true },
    );

    bot.answerCallbackQuery(callbackQuery.id, { text: 'Супер, Удачи!' });

    return;
  }

  bot.answerCallbackQuery(callbackQuery.id, { text: 'Ты уже в деле!' });
}
