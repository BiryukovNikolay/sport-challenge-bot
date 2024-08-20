import TelegramBot from "node-telegram-bot-api";
import crone from "node-cron";
import { ChallengeType, Participant, ProgramType } from "./types";
import { getProgram } from "./helpers";

type NotificationType = {
  time: string;
  message: string;
  penaltyMessage?: string;
  deadline: boolean;
}

type CreateTaskType = {
  bot: TelegramBot;
  participant: Participant;
  challenge: ChallengeType;
  program: ProgramType;
  notification: NotificationType;
}

const NotificationFirst: NotificationType = {
  time: '22:15',
  message: 'Время выполнить упражнение',
  deadline: false,
}

const NotificationSecond: NotificationType = {
  time: '22:18',
  message: 'Ну чего там? Остался час, все ждут!',
  deadline: false,
}

const NotificationLast: NotificationType = {
  time: '22:20',
  message: 'Это фиаско! Записываем тебе в список лузеров, готовьте денежки',
  penaltyMessage: 'Время вышло, штрафной бал тебе! Придется сперва сделать сегодняшнее задание',
  deadline: true,
}

function getCroneExpression(time: string) {
  const [hours, minutes] = time.split(':');

  return `${minutes} ${hours} * * *`;
}

function createTask({ bot, participant, challenge, program, notification}: CreateTaskType) {
  const { time, message, penaltyMessage, deadline } = notification;
  const { activeDay, chatId } = challenge;
  const lastDay = program.schedule[program.schedule.length - 1].day;

  const task = crone.schedule(getCroneExpression(time), () => {
    if (participant.out || participant.winner || lastDay < activeDay!) {
      task.stop();
      return;
    }

    if (participant.activeDay > activeDay!) {
      return;
    }

    const participantDay = activeDay === participant.activeDay ? activeDay : participant.activeDay;
    const currentDay = program.schedule.find((day) => day.day === participantDay);
    const currentExercise = currentDay?.exercise;

    if (penaltyMessage && !participant.penalty) {
      participant.penalty = 1;
      bot.sendMessage(chatId,
        `@${participant.username}, ${penaltyMessage} \n*${currentExercise}*`,
        { parse_mode: 'Markdown' },
      );

      return;
    }

    if (currentExercise) {
      const exerciseMessage = deadline ? '' : `\n*${currentExercise}*`;

      bot.sendMessage(chatId,
        `@${participant.username}, ${message} ${exerciseMessage}`,
        { parse_mode: 'Markdown' },
      );

      if (deadline) {
        participant.out = true;
        participant.winner = false;
        participant.outDateNumber = participant.activeDay;

        task.stop();
      }
    }
  }, {
    scheduled: true,
    timezone: participant.timezone,
  });
}

export function scheduleNotification(bot: TelegramBot, challenge: ChallengeType) {
  const program = getProgram(challenge.programId);

  if (!program) {
    return;
  }

  // TODO add delay before next day
  challenge.participants.forEach((participant) => {
    createTask({ bot, participant, challenge, program, notification: NotificationFirst });
    createTask({ bot, participant, challenge, program, notification: NotificationSecond });
    createTask({ bot, participant, challenge, program, notification: NotificationLast });
  });
}
