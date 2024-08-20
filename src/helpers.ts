import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import moment from "moment-timezone";
import { TIME_ZONES } from "./constants";
import { CallbackData } from "./types";
import { programs } from "./data";

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

export function getTimezoneKeyboard(): InlineKeyboardButton[][] {
  return TIME_ZONES.reduce((keyboard, tz, index) => {
    const currentTime = moment().tz(tz).format('HH:mm');
    const button = { text: `${tz} - ${currentTime}`, callback_data: `${CallbackData.TimeZone}_${tz}` };

    if (index % 2 === 0) {
      keyboard.push([button]);
    } else {
      keyboard[keyboard.length - 1].push(button);
    }

    return keyboard;
  }, [] as InlineKeyboardButton[][]);
}

export function getProgram(programId: string) {
  return programs.find((program) => program.id === programId);
}

