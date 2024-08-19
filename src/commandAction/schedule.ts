import TelegramBot from "node-telegram-bot-api";
import { challenges, programs } from "../data";
import { ProgramType } from "../types";

function formatSchedule(program: ProgramType, activeDay: number, startDate: Date): string {
  return program.schedule.map(({day, exercise}) => {
    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + day - 1);
    const formattedDay = newDate
                        .toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
                        .replace('.', '');

    if (day === activeDay) {
      return `<b>${formattedDay}: ${exercise}</b>`;
    }

    if (day < activeDay) {
      return `<s>${formattedDay}: ${exercise}</s> ✅`;
    }

    return `<b>${formattedDay}</b>: ${exercise}`;
  }).join('\n');
}

export function onSchedule(msg: TelegramBot.Message, bot: TelegramBot) {
  const chatId = msg.chat.id;
  const activeChallenge = challenges[chatId]?.activeChallenge;

  if (activeChallenge && activeChallenge.activeDay && activeChallenge.startDate) {
    const program = programs.find((program) => program.id === activeChallenge.programId);

    if (program) {
      bot.sendMessage(
        chatId,
        formatSchedule(program, activeChallenge.activeDay, activeChallenge.startDate),
        { disable_notification: true, parse_mode: 'HTML' }
      ).then((sentMessage) => {
        setTimeout(() => {
          bot.deleteMessage(chatId, sentMessage.message_id)
        }, 60000);
      });

      return;
    }
  }

  bot.sendMessage(msg.chat.id, "У вас нет активной программы, что бы начать программу введите команду /start");
}
