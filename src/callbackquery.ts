import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import { CallbackData, Status } from "./types";
import { voteChallengeAccepted, voteChallengeDeclined } from "./vote";
import { programs, challenges } from "./data";
import { cancelChallenge, createChallenge, startChallenge } from "./challengeAction";

type SetProgramType = {
  bot: TelegramBot;
  programId: string;
  chatId: number;
}

const startChallengeKeyboard: InlineKeyboardButton[][] = [
  [{ text: 'Я участвую', callback_data: CallbackData.ChallengeAccepted, }],
  [{ text: 'Не участвую', callback_data: CallbackData.ChallengeDeclined, }],
];

function setFirstProgram({ programId, chatId, bot}: SetProgramType) {
  const program = programs.find((program) => program.id === programId);

    if (program) {
      createChallenge({
        programId: program.id,
        chatId: chatId!,
        status: Status.Vote,
        participants: [],
      })

      bot.sendMessage(chatId!,
        `Вы выбрали программу: ${program.title}!
         кто готов учавствовать?
         как только все участники проголосуют, введите команду /startprogram`,
        {
          reply_markup: {
            inline_keyboard: startChallengeKeyboard,
            selective: true,
          }
        }
      );
    }
}

export function setCallbackQueryListener(bot: TelegramBot) {
  bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message?.chat.id;
    const challenge =  chatId && challenges[chatId]?.activeChallenge;

    if (callbackQuery.data?.startsWith('chosen_program_')) {
      const programId = callbackQuery.data.replace('chosen_program_', '');
      setFirstProgram({ programId, chatId: chatId!, bot });
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
        return;
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

    bot.answerCallbackQuery(callbackQuery.id);

  });
}
