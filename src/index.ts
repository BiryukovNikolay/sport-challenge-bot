import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

// Загрузка переменных окружения из .env файла
dotenv.config();

// Получаем токен из переменной окружения
const token: string = process.env.TELEGRAM_TOKEN as string;

// Создаем бота
const bot = new TelegramBot(token, { polling: true });


// Обрабатываем команду /start
bot.onText(/\/start/, (msg) => {  
  bot.sendMessage(msg.chat.id, "Привет! Я тестовый бот на TypeScript, и я работаю!");
});

bot.onText(/\/rules/, (msg) => {
  bot.sendMessage(msg.chat.id, `Основные правила:
  Делаем необходимое количество отжиманий согласно графика. 
  Отдых между повторами 1-2 минуты.
  Каждый подход фиксируется на видео и отправляется в чат.
  Если до 12 вечера видео не загружено, это штрафной балл. 
  За всю программу разрешен только один штрафной. Два нарушения - дисквалификация. 
  По итогу должны быть закрыты все даты по календарю. Если день пропустили, то закрываем сначала пропуск, потом продолжаем. 
  Требования к отжиманиям:
  Тело ровно, жопу не выпячивать, руки сгибаем в локтях до 90 градусов.`);
});

// Обрабатываем любое текстовое сообщение
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Вы сказали опять: ' + msg.text);
});

console.log('Бот запущен 2...');