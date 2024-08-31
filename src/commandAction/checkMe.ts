import { Participant } from './../types';
import TelegramBot from "node-telegram-bot-api";
import { challenges } from "../data";
import { getProgram, sendTemporaryMessage } from "../helpers";
import { CallbackData } from "../types";

function getKeyboard(userId: number) {
  return [
    [{ text: 'Засчитано', callback_data: `${CallbackData.UserDone}_${userId}` }],
    [{ text: 'Надо переделать', callback_data: `${CallbackData.UserNotDone}_${userId}` }],
  ];
}

export function onCheckMe(msg: TelegramBot.Message, bot: TelegramBot) {
  const chatId = msg.chat.id;
  const username = msg.from?.username;
  const userId = msg.from?.id;
  const activeChallenge = challenges[chatId]?.activeChallenge;

  if (activeChallenge) {
    const participant = activeChallenge.participants.find((user: Participant) => user.id === userId);

    if (!participant) {
      sendTemporaryMessage({
        bot,
        chatId,
        text: `@${username} Ты не участвуешь в соревновании.`
      });

      return;
    }

    if (participant?.out) {
      sendTemporaryMessage({
        bot,
        chatId,
        text: `@${username} Ты выбыл из соревнования. Ho хорошая попытка!`
      });

      return;
    }

    if (participant?.winner) {
      sendTemporaryMessage({
        bot,
        chatId,
        text: `@${username} Ты уже выйграл, отдыхай!`
      });

      return;
    }

    const isFalseStart = activeChallenge.startDate!.getDate() > new Date().getDate();

    if (isFalseStart) {
      sendTemporaryMessage({
        bot,
        chatId,
        text: `@${username} Соревнование еще не началось. Приходи завтра!`
      });

      return
    }

    const isDayDone = participant && participant.activeDay! > activeChallenge.activeDay!;

    if (isDayDone) {
      sendTemporaryMessage({
        bot,
        chatId,
        text: `@${username} Ты уже выполнил задание на сегодня. Готовься к завтрашнему заданию!`
      });

      return
    }

    const currentProgram = getProgram(activeChallenge.programId);

    if (currentProgram && username) {
      bot.sendMessage(chatId, `@${username} Готов сдавать свою попытку. Ну что принимаем?`,
        { disable_notification: true,
            reply_markup: {
            inline_keyboard: getKeyboard(msg.from?.id!),
            selective: true,
            one_time_keyboard: true,
          }
        });

      return;
    }
  }

  bot.sendMessage(chatId, "У вас нет активной программы, что бы начать программу введите команду /start");
}
