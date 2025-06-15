const bot = require("../bot/bot");

/**
 * Creates a message utility for a specific chat.
 * @param {number|string} chatId - The Telegram chat ID.
 * @param {string} targetMessage - The reference message to compare with.
 * @returns {{ reply: Function, matches: Function }}
 */

const useMessage = (chatId, targetMessage) => {
  const reply = async (text, options = {}) => {
    await bot.sendMessage(chatId, text, {
      parse_mode: "HTML",
      ...options,
    });
  };

  const sendFile = async (fileUrl, caption) => {
    await bot.sendDocument(chatId, fileUrl, {
      caption,
      parse_mode: "HTML",
    });
  };

  const matches = (input) => {
    if (!input?.trim() || !targetMessage?.trim()) return false;
    return input.trim().toLowerCase() === targetMessage.trim().toLowerCase();
  };

  return { reply, matches, sendFile };
};

module.exports = useMessage;
