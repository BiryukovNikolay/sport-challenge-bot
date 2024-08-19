import type TelegramBot from "node-telegram-bot-api";
import type { InlineKeyboardButton } from "node-telegram-bot-api";
import { challenges } from "./data";

export function startConfirmationMessage(bot: TelegramBot, chatId: number) {
  const START_BUTTON = [{text: 'Начинаем', callback_data: 'start_program'}];
  const WAIT_BUTTON = [{text: 'Подождем еще немного', callback_data: 'wait_program'}];
  const START_PROGRAM_KEYBOARD: InlineKeyboardButton[][] = [WAIT_BUTTON];

  const chat = challenges[chatId];

  if (!chat) {
    return;
  }

  const potentialParticipants = chat.activeChallenge?.usersIn;

  let text = 'Пока желающих не нашлось, нет смысла начинать';

  if (potentialParticipants && potentialParticipants.length > 0) {
    START_PROGRAM_KEYBOARD.unshift(START_BUTTON);
    text = `Желающих: ${potentialParticipants.length}${'\n'}Готовы начать программу? Первое упражнение будет назначено на завтра`;
  }

  bot.sendMessage(chatId,
    `Поиск участников в самом разгаре!${'\n'}${text}`,
    {
      disable_notification: true,
      reply_markup: {
        inline_keyboard: START_PROGRAM_KEYBOARD,
        selective: true,
        one_time_keyboard: true,
      }
    }
  );
}
