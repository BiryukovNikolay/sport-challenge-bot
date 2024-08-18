import TelegramBot from "node-telegram-bot-api";

export function getKey() {
  return Math.random().toString(36).substring(7);
}

export function setCommandListener(
  bot: TelegramBot,
  command: RegExp,
  callback: (msg: TelegramBot.Message, bot: TelegramBot) => void
) {
  bot.onText(command, (msg) => {
    callback(msg, bot);
  });
}

