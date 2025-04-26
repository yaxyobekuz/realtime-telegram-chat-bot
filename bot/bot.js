const { botToken } = require("../config");
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(botToken, { polling: true });

module.exports = bot;
