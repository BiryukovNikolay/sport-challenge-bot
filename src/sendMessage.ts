import type TelegramBot from "node-telegram-bot-api";
import type { InlineKeyboardButton } from "node-telegram-bot-api";

const START_PROGRAM_KEYBOARD: InlineKeyboardButton[][] = [
  [{text: 'Начинаем', callback_data: 'start_program'}],
  [{text: 'Подождем еще немного', callback_data: 'wait_program'}]
];

export function startConfirmationMessage(bot: TelegramBot, chatId: number) {
  bot.sendMessage(chatId, `Поиск участников в самом разгаре!
    Готовы начать программу? Первое упражнение будет назначено на завтра`, {
    reply_markup: {
      inline_keyboard: START_PROGRAM_KEYBOARD,
      selective: true,
      one_time_keyboard: true,
    }
  });
}
