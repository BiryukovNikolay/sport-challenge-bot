import TelegramBot from "node-telegram-bot-api";
import { getProgram, sendTemporaryMessage } from "../helpers";
import { getChatById } from "database/controllers/chat";

export async function onRules(msg: TelegramBot.Message, bot: TelegramBot) {
  const chatId = msg.chat.id;
  const chat = await getChatById(chatId);
  const challenge = chat?.activeChallenge;

  if (challenge) {
    const program = getProgram(challenge.programId);

    if (program) {
      sendTemporaryMessage({
        bot,
        chatId,
        text: program.rules,
        delay: 60000
      })

      return;
    }
  }

  bot.sendMessage(chatId, "У вас нет активной программы, что бы начать программу введите команду /start");
}
