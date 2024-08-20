import TelegramBot from "node-telegram-bot-api";
import { challenges } from "../data";
import { getProgram } from "../helpers";

export function onRules(msg: TelegramBot.Message, bot: TelegramBot) {
  const chatId = msg.chat.id;
  const activeChallenge = challenges[chatId]?.activeChallenge;

  if (activeChallenge) {
    const currentProgram = getProgram(activeChallenge.programId);

    if (currentProgram) {
      bot.sendMessage(chatId, currentProgram.rules, { disable_notification: true });

      return;
    }
  }

  bot.sendMessage(msg.chat.id, "У вас нет активной программы, что бы начать программу введите команду /start");
}
