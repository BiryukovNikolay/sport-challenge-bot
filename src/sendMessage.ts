import type TelegramBot from "node-telegram-bot-api";
import type { InlineKeyboardButton } from "node-telegram-bot-api";
import { challenges } from "./data";

function getMainText(potentialParticipants?: number) {
  if (potentialParticipants && potentialParticipants > 0) {
    return `Желающих: ${potentialParticipants}${'\n'}Готовы начать программу? Первое упражнение будет назначено на завтра`;
  }

  return 'Пока желающих не нашлось, нет смысла начинать';
}

function getKeyboard(potentialParticipants?: number) {
  const START_BUTTON = [{text: 'Начинаем', callback_data: 'start_program'}];
  const WAIT_BUTTON = [{text: 'Подождем еще немного', callback_data: 'wait_program'}];
  const START_PROGRAM_KEYBOARD: InlineKeyboardButton[][] = [WAIT_BUTTON];

  if (potentialParticipants && potentialParticipants > 0) {
    START_PROGRAM_KEYBOARD.unshift(START_BUTTON);
  }

  return START_PROGRAM_KEYBOARD;
}

export function startConfirmationMessage(bot: TelegramBot, chatId: number) {
  const chat = challenges[chatId];

  if (!chat) {
    return;
  }

  const potentialParticipants = chat.activeChallenge?.usersIn;
  const mainText = getMainText(potentialParticipants?.length);
  const keyBoard = getKeyboard(potentialParticipants?.length);

  bot.sendMessage(chatId,
    `Поиск участников в самом разгаре!${'\n'}${mainText}`,
    {
      disable_notification: true,
      reply_markup: {
        inline_keyboard: keyBoard,
        selective: true,
        one_time_keyboard: true,
      }
    }
  );
}
