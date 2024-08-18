import TelegramBot from "node-telegram-bot-api";
import { ChallengeType } from "./types";

type VoteType = {
  bot: TelegramBot;
  challenge: ChallengeType;
  callbackQuery: TelegramBot.CallbackQuery;
  chatId: number;
}

export function voteChallengeDeclined({ bot, challenge, callbackQuery, chatId }: VoteType) {
  const declinedUser = challenge.userOut.find((user) => user.id === callbackQuery.from.id);
  const index = challenge.usersIn.findIndex((user) => user.id === callbackQuery.from.id);

  if (!declinedUser) {
    challenge.userOut.push(callbackQuery.from);

    bot.sendMessage(chatId!,
      `@${callbackQuery?.from?.username}  Соскочил!`,
    );

    if (index !== -1) {
      challenge.usersIn.splice(index, 1);
    }

    bot.answerCallbackQuery(callbackQuery.id, { text: 'Фууу, слабак!' });

    return;
  }

  bot.answerCallbackQuery(callbackQuery.id, { text: 'Ты уже соскочил!'});
}


export function voteChallengeAccepted({ bot, challenge, callbackQuery, chatId }: VoteType) {
  const activeUser = challenge.usersIn.find((user) => user.id === callbackQuery.from.id);
  const declinedUserIndex = challenge.userOut.findIndex((user) => user.id === callbackQuery.from.id);

  if (!activeUser) {
    challenge.usersIn.push(callbackQuery.from);

    bot.sendMessage(chatId!,
      `@${callbackQuery?.from?.username}  Принял вызов!`,
    );

    if (declinedUserIndex !== -1) {
      challenge.userOut.splice(declinedUserIndex, 1);
    }

    bot.answerCallbackQuery(callbackQuery.id, { text: 'Супер, Удачи!' });

    return;
  }

  bot.answerCallbackQuery(callbackQuery.id, { text: 'Ты уже в деле!' });
}
