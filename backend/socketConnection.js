const bot = require("../bot/bot");
const { socket } = require("./app");
const messages = require("./models/messagesModel");

socket.on("connection", (socket) => {
  socket.on("sendMessage", async (data) => {
    const { text, chatId } = data;
    const chatMessages = await messages.findOne({ id: chatId });

    const payload = { text, isAdmin: true, type: "text" };

    await bot.sendMessage(chatId, text);

    chatMessages.messages.push(payload);
    await chatMessages.save();

    socket.emit(`chatMessage:${chatId}`, payload);
  });
});
