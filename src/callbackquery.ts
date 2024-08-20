import TelegramBot from "node-telegram-bot-api";
import { CallbackData } from "./types";
import { voteChallengeAccepted, voteChallengeDeclined } from "./vote";
import { programs, challenges } from "./data";
import {
  cancelChallenge,
  getProgramInfo,
  setFirstProgram,
  setParticipantTimeZone,
  startChallenge
} from "./challengeAction";

export function setCallbackQueryListener(bot: TelegramBot) {
  bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message?.chat.id;
    const challenge =  chatId && challenges[chatId]?.activeChallenge;

    if (callbackQuery.data?.startsWith('chosen_program_')) {
      const programId = callbackQuery.data.replace('chosen_program_', '');
      getProgramInfo({ programId, messageId: message?.message_id, bot, chatId: chatId! });
    }

    if (callbackQuery.data === CallbackData.BackToPrograms) {
      bot.editMessageText('Выберите программу:', {
        message_id: message?.message_id!,
        chat_id: chatId!,
        reply_markup: {
          inline_keyboard: programs.map(
            (program) => [{ text: program.title, callback_data: `chosen_program_${program.id}` }]
          ),
        }
      });
    }

    if (callbackQuery.data === CallbackData.StartVoting) {
      setFirstProgram({ chatId: chatId!, bot });
      bot.deleteMessage(chatId!, message?.message_id!);
    }

    if (callbackQuery.data === CallbackData.ChallengeAccepted) {
      if (challenge && chatId) {
        voteChallengeAccepted({ bot, challenge, callbackQuery, chatId });
        return;
      }
    }

    if (callbackQuery.data === CallbackData.ChallengeDeclined) {
      if (challenge && chatId) {
        voteChallengeDeclined({ bot, challenge, callbackQuery, chatId });
      }
    }

    if (callbackQuery.data === CallbackData.StartProgram) {
      startChallenge(chatId!, bot);
      bot.deleteMessage(chatId!, message?.message_id!);
    }

    if (callbackQuery.data === CallbackData.CancelProgram) {
      bot.sendMessage(chatId!,
        `Программу отменил @${callbackQuery.from.username}`,
      );
      cancelChallenge(chatId!);
      bot.deleteMessage(chatId!, message?.message_id!);
    }

    if (callbackQuery.data === CallbackData.WaitProgram) {
      bot.answerCallbackQuery(callbackQuery.id,
        { text: `Подождем еще немного`},
      );
      bot.deleteMessage(chatId!, message?.message_id!);
    }

    if (callbackQuery.data === CallbackData.ContinueProgram) {
      bot.answerCallbackQuery(callbackQuery.id,
        { text: `Продолжаем!`},
      );
      bot.deleteMessage(chatId!, message?.message_id!);
    }

    if (callbackQuery.data?.startsWith(CallbackData.TimeZone)) {
      setParticipantTimeZone({ chatId: chatId!, callbackQuery, bot });
    }

    bot.answerCallbackQuery(callbackQuery.id);

  });
}
