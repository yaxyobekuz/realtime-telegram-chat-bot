const { io } = require("../app");
const bot = require("../../bot/bot");
const chats = require("../models/chatModel");
const messages = require("../models/messagesModel");

io.on("connection", (socket) => {
  socket.on("sendMessage", async (data, callback) => {
    try {
      const text = data.text;
      const chatId = Number(data.chatId);
      const payload = { text, isAdmin: true, type: "text" };

      // Validate input
      if (!text || !Number.isInteger(chatId) || chatId <= 0) {
        return callback({ success: false, message: "Invalid data" });
      }

      // Reset unanswered message count
      const chatMessages = await messages.findOneAndUpdate(
        { id: chatId },
        { $push: { messages: payload } },
        { new: true }
      );

      if (!chatMessages) {
        return callback({ success: false, message: "Chat not found" });
      }

      // Send message to bot
      if (chatId !== 1) await bot.sendMessage(chatId, text);

      // Reset unanswered message count
      await chats.findOneAndUpdate(
        { id: chatId },
        { unansweredMessagesCount: 0 }
      );

      const newMessageData = chatMessages.messages.at(-1);

      // Emit to clients
      socket.emit(`chatMessage:${chatId}`, newMessageData);
      io.emit("unansweredMessagesCount", { count: 0, chatId });

      // Callback success
      callback({ success: true, message: "Xabar yuborildi" });
    } catch (error) {
      console.log("Error in sendMessage:", error);
      callback({ success: false, message: "Xatolik yuz berdi" });
    }
  });
});
