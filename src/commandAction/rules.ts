import TelegramBot from "node-telegram-bot-api";
import { challenges } from "../data";
import { getProgram, sendTemporaryMessage } from "../helpers";

export function onRules(msg: TelegramBot.Message, bot: TelegramBot) {
  const chatId = msg.chat.id;
  const activeChallenge = challenges[chatId]?.activeChallenge;

  if (activeChallenge) {
    const currentProgram = getProgram(activeChallenge.programId);

    if (currentProgram) {
      sendTemporaryMessage({
        bot,
        chatId,
        text: currentProgram.rules,
        delay: 60000
      })

      return;
    }
  }

  bot.sendMessage(msg.chat.id, "У вас нет активной программы, что бы начать программу введите команду /start");
}
