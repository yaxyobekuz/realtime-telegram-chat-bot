const bot = require("../bot/bot");
const { socket: io } = require("./app");
const chats = require("./models/chatModel");
const messages = require("./models/messagesModel");

io.on("connection", (socket) => {
  socket.on("sendMessage", async (data, callback) => {
    try {
      const { text, chatId } = data;

      console.log("salom: kaylam", text);

      // Validate input
      if (!text || !chatId) {
        return callback({ success: false, message: "Invalid data" });
      }

      const chatMessages = await messages.findOne({ id: chatId });
      if (!chatMessages) {
        return callback({ success: false, message: "Chat not found" });
      }

      const payload = { text, isAdmin: true, type: "text" };

      // Send message to bot
      await bot.sendMessage(chatId, text);

      // Reset unanswered message count
      await chats.findOneAndUpdate(
        { id: chatId },
        { unansweredMessagesCount: 0 }
      );

      // Save message to database
      chatMessages.messages.push(payload);
      await chatMessages.save();

      // Emit to clients
      socket.emit(`chatMessage:${chatId}`, payload);
      io.emit("unansweredMessagesCount", { count: 0, chatId });

      // Callback success
      callback({ success: true, message: "Xabar yuborildi" });
    } catch (error) {
      console.error("Error in sendMessage:", error);
      callback({ success: false, message: "Xatolik yuz berdi" });
    }
  });
});
