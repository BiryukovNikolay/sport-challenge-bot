import TelegramBot from "node-telegram-bot-api";
import { CallbackData, ChallengeType } from "./types";
import { setDayDone, setNewDay } from "./challengeAction";
import { challenges } from "./data";

type DoneActionType = {
  type: CallbackData.UserDone | CallbackData.UserNotDone;
  bot: TelegramBot;
  callbackQuery: TelegramBot.CallbackQuery;
}

type GetMessageType = {
  type: CallbackData.UserDone | CallbackData.UserNotDone;
  refereeName: string;
  participantName: string;
}

function getMessageText({ type, refereeName, participantName }: GetMessageType) {
  if (type === CallbackData.UserDone) {
    return `@${refereeName} засчитал этот подход. @${participantName} выполнил сегодняшнее задание, Машина!`;
  }

  return `@${refereeName} забраковал этот подход. @${participantName} придется повторить сегодняшнее задание, Соберись!`;
}

export function checkAction({ bot, callbackQuery, type }: DoneActionType) {
  const message = callbackQuery.message;
  const chatId = message?.chat.id;
  const challenge =  (chatId && challenges[chatId]?.activeChallenge) as ChallengeType;
  const participantId = callbackQuery.data?.replace(`${type}_`, '');
  const referee = callbackQuery.from;

  if (referee.id.toString() === participantId) {
    bot.answerCallbackQuery(callbackQuery.id, { text: 'Нельзя засчитать свою попытку' });

    return;
  }

  const isValidReferee = challenge?.participants.some((user) => user.id.toString() === referee.id.toString());

  if (!isValidReferee) {
    bot.answerCallbackQuery(callbackQuery.id, { text: 'Только участники могут оценивать попытки' });

    return;
  }

  const participant = challenge?.participants.find((user) => user.id.toString() === participantId);

  if (participant) {
    const text = getMessageText({ participantName: participant.username!, refereeName: referee.username!, type });

    bot.editMessageText(
      text,
      {
        message_id: message?.message_id!,
        chat_id: chatId!,
      }
    );

    if (type === CallbackData.UserDone) {
      setDayDone(chatId!, participant.id!);
      const isEveryOneDone = challenge?.participants.every((user) => user.activeDay! > challenge.activeDay!);

      if (isEveryOneDone) {
        const nextExercise = setNewDay(chatId!);

        bot.sendMessage(
          chatId!,
          `Все участники выполнили задание. Переходим к следующему дню!\nЗадание на завтра: \n${nextExercise}`,
          { disable_notification: true }
        );
      }
    }
  }

  bot.answerCallbackQuery(callbackQuery.id);
}
