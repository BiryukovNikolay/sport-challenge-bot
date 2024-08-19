import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import { programs, challenges } from "../data";
import { Status } from "../types";
import { startConfirmationMessage } from "../sendMessage";

const PROGRESS_PROGRAM_KEYBOARD: InlineKeyboardButton[][] = [
  [{text: 'Отменить программу', callback_data: 'cancel_program'}],
  [{text: 'Продолжаем', callback_data: 'continue_program'}]
];

const PROGRAMS_KEYBOARD: InlineKeyboardButton[][] = programs.map(
  (program) => [{ text: program.title, callback_data: `chosen_program_${program.id}` }]
);

export function onStart(msg: TelegramBot.Message, bot: TelegramBot) {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const challenge = challenges[chatId]?.activeChallenge;

  if (challenge) {
    const { status } = challenge;

    if (status === Status.Vote) {
      startConfirmationMessage(bot, chatId);
      return;
    }

    if (status === Status.Active) {
      bot.sendMessage(chatId, 'У вас уже есть активное соревнование!', {
        reply_markup: {
          inline_keyboard: PROGRESS_PROGRAM_KEYBOARD,
          selective: true,
          one_time_keyboard: true,
        },
        disable_notification: true,
      });

      return;
    }
  }

  bot.sendMessage(chatId, 'Выберите программу:', {
    reply_markup: {
      inline_keyboard: PROGRAMS_KEYBOARD,
      selective: true,
    },
    disable_notification: true,
  });
}
