import TelegramBot from "node-telegram-bot-api";
import crone from "node-cron";
import { ChallengeType, Participant, ProgramType } from "./types";
import { getProgram } from "./helpers";
import { setParticipantOut, setParticipantPenalty } from "./challengeAction";

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
  time: '20:00',
  message: 'Время выполнить упражнение',
  deadline: false,
}

const NotificationSecond: NotificationType = {
  time: '23:00',
  message: 'Ну чего там? Остался час, все ждут!',
  deadline: false,
}

const NotificationLast: NotificationType = {
  time: '00:00',
  message: 'Это фиаско! Записываем тебе в список лузеров, готовьте денежки',
  penaltyMessage: 'Время вышло, штрафной бал тебе! Придется сперва сделать сегодняшнее задание',
  deadline: true,
}

function getDelayUntilTomorrow(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}

function getCroneExpression(time: string) {
  const [hours, minutes] = time.split(':');

  return `${minutes} ${hours} * * *`;
}

function createTask({ bot, participant, challenge, program, notification}: CreateTaskType) {
  const { time, message, penaltyMessage, deadline } = notification;
  const { activeDay, chatId } = challenge;
  const { timezone, penalty, out, winner, username, activeDay: userDay} = participant;
  const lastDay = program.schedule[program.schedule.length - 1].day;

  const task = crone.schedule(getCroneExpression(time), () => {
    if (out || winner || lastDay < activeDay!) {
      task.stop();
      return;
    }

    if (userDay > activeDay!) {
      return;
    }

    const participantDay = activeDay === userDay ? activeDay : userDay;
    const currentDay = program.schedule.find((day) => day.day === participantDay);
    const currentExercise = currentDay?.exercise;

    if (deadline && penaltyMessage && !penalty) {
      setParticipantPenalty(chatId, participant.id);
      bot.sendMessage(
        chatId,
        `@${username}, ${penaltyMessage} \n*${currentExercise}*`,
        { parse_mode: 'Markdown' },
      );

      return;
    }

    if (currentExercise) {
      const exerciseMessage = deadline ? '' : `\n*${currentExercise}*`;

      bot.sendMessage(
        chatId,
        `@${username}, ${message} ${exerciseMessage}`,
        { parse_mode: 'Markdown' },
      );

      if (deadline) {
        setParticipantOut(chatId, participant.id);
        task.stop();
      }
    }
  }, {
    scheduled: true,
    timezone: timezone,
  });
}

export function scheduleNotification(bot: TelegramBot, challenge: ChallengeType) {
  const program = getProgram(challenge.programId);

  if (!program) {
    return;
  }

  const delay = getDelayUntilTomorrow();

  setTimeout(() => {
    challenge.participants.forEach((participant) => {
      createTask({ bot, participant, challenge, program, notification: NotificationFirst });
      createTask({ bot, participant, challenge, program, notification: NotificationSecond });
      createTask({ bot, participant, challenge, program, notification: NotificationLast });
    });
  }, delay);
}
