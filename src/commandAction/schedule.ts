import TelegramBot from "node-telegram-bot-api";
import { ProgramType } from "../types";
import { getProgram, sendTemporaryMessage } from "../helpers";
import { getChatById } from "database/controllers/chat";

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

export async function onSchedule(msg: TelegramBot.Message, bot: TelegramBot) {
  const chatId = msg.chat.id;
  const chat = await getChatById(chatId);
  const challenge = chat?.activeChallenge;

  if (challenge && challenge.activeDay && challenge.startDate) {
    const program = getProgram(challenge.programId);

    if (program) {
      sendTemporaryMessage({
        bot,
        chatId,
        text: formatSchedule(program, challenge.activeDay, challenge.startDate),
        delay: 60000,
        options: { parse_mode: 'HTML' }
      });

      return;
    }
  }

  bot.sendMessage(msg.chat.id, "У вас нет активной программы, что бы начать программу введите команду /start");
}
