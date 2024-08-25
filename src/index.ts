import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { setCallbackQueryListener } from './callbackquery';
import { setCommandListener } from './helpers';
import { COMMAND } from './constants';
import {
  onRules,
  onStart,
  onStartProgram,
  onCheckMe,
  onSchedule
} from './commandAction';

dotenv.config();

const token = process.env.TELEGRAM_TOKEN as string;
const bot = new TelegramBot(token, { polling: true });

setCommandListener(bot, COMMAND.START, onStart);
setCommandListener(bot, COMMAND.START_PROGRAM, onStartProgram);
setCommandListener(bot, COMMAND.RULES, onRules);
setCommandListener(bot, COMMAND.SCHEDULE, onSchedule);
setCommandListener(bot, COMMAND.CHECK_ME, onCheckMe);

setCallbackQueryListener(bot);

console.log('Бот запущен...');
