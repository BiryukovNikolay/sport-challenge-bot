import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";
import { CallbackData, Status } from "./types";
import { voteChallengeAccepted, voteChallengeDeclined } from "./vote";
import { programs, challenges } from "./data";
import { cancelChallenge, createChallenge, preselectProgram, startChallenge } from "./challengeAction";

type SetProgramType = {
  bot: TelegramBot;
  programId: string;
  chatId: number;
  messageId?: number;
}

const startChallengeKeyboard: InlineKeyboardButton[][] = [
  [{ text: 'Я участвую', callback_data: CallbackData.ChallengeAccepted, }],
  [{ text: 'Не участвую', callback_data: CallbackData.ChallengeDeclined, }],
];

type SetFirstProgram = {
  chatId: number;
  bot: TelegramBot;
}

function setFirstProgram({ chatId, bot}: SetProgramType) {
    const chat = challenges[chatId];
    const program = chat && programs.find((program) => program.id === chat.preselectedProgram);

    if (program) {
      createChallenge({
        chatId: chatId!,
        status: Status.Vote,
        participants: [],
      })

      bot.sendMessage(chatId!,
        `Вы выбрали программу: *${program.title}!*\nКто готов учавствовать?\nКак только все участники проголосуют, введите команду /startprogram`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: startChallengeKeyboard,
            selective: true,
          }
        }
      );
    }
}

const programInfoKeyboard: InlineKeyboardButton[][] = [
  [{ text: 'Стартуем', callback_data: CallbackData.StartVoting, }],
  [{ text: 'Назад', callback_data: CallbackData.BackToPrograms, }],
];


export function programInfo({ programId, chatId, bot, messageId}: SetProgramType) {
  const program = programs.find((program) => program.id === programId);

  if (program && messageId) {
    preselectProgram(chatId!, programId);

    bot.editMessageText(
      `${program.title}
       ${'\n'}${program.schedule.map((day) => `*День ${day.day}:* ${day.exercise}`).join('\n')}`,
      {
        message_id: messageId,
        chat_id: chatId,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: programInfoKeyboard,
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
      programInfo({ programId, messageId: message?.message_id, bot, chatId: chatId! });
      // setFirstProgram({ programId, chatId: chatId!, bot });
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
      setFirstProgram({ programId: challenges[chatId!].preselectedProgram!, chatId: chatId!, bot });
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

    bot.answerCallbackQuery(callbackQuery.id);

  });
}
