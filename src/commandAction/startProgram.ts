import TelegramBot from "node-telegram-bot-api";
import { startConfirmationMessage } from "../sendMessage";

export function onStartProgram(msg: TelegramBot.Message, bot: TelegramBot) {
  startConfirmationMessage(bot, msg.chat.id);
}
