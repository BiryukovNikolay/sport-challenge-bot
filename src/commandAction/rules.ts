import TelegramBot from "node-telegram-bot-api";
import { programs, challenges } from "../data";

export function onRules(msg: TelegramBot.Message, bot: TelegramBot) {
  const chatId = msg.chat.id;
  const activeChallenge = challenges[chatId]?.activeChallenge;

  if (activeChallenge) {
    const currentProgram = programs.find((program) => program.id === activeChallenge.programId);

    if (currentProgram) {
      bot.sendMessage(chatId, currentProgram.rules, { disable_notification: true });

      return;
    }
  }

  bot.sendMessage(msg.chat.id, "У вас нет активной программы, что бы начать программу введите команду /start");
}
