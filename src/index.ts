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

// Обрабатываем любое текстовое сообщение
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Вы сказали: ' + msg.text);
});

console.log('Бот запущен 2...');