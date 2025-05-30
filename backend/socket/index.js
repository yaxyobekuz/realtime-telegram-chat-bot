const { io } = require("../app");
const bot = require("../../bot/bot");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

io.on("connection", (socket) => {
  socket.on("sendMessage", async (data, callback) => {
    try {
      const text = data.text;
      const chatId = Number(data.chatId);
      const payload = { chatId, text, isAdmin: true };

      // Validate input
      if (!text || !Number.isInteger(chatId) || chatId <= 0) {
        return callback({ success: false, message: "Invalid data" });
      }

      // Reset unanswered message count
      const newMessage = new Message(payload);

      // Send message to bot
      if (chatId !== 1) await bot.sendMessage(chatId, text);

      // Reset unanswered message count
      await Chat.findOneAndUpdate(
        { id: chatId },
        { unansweredMessagesCount: 0 }
      );

      const savedMessage = await newMessage.save();

      // Emit to clients
      socket.emit(`chatMessage:${chatId}`, savedMessage);
      io.emit("unansweredMessagesCount", { count: 0, chatId });

      // Callback success
      callback({ success: true, message: "Xabar yuborildi" });
    } catch (error) {
      console.log("Error in sendMessage:", error);
      callback({ success: false, message: "Xatolik yuz berdi" });
    }
  });
});
