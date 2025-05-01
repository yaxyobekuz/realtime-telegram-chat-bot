const bot = require("../bot");
const useUser = require("../../hooks/useUser");
const useText = require("../../hooks/useText");
const { socket } = require("../../backend/app");
const useMessage = require("../../hooks/useMessage");
const chats = require("../../backend/models/chatModel");
const messages = require("../../backend/models/messagesModel");

bot.on("message", async (msg) => {
  const message = msg.text;
  const chatId = msg.chat.id;

  const { t } = useText(chatId);
  const { reply, matches } = useMessage(chatId, message);
  const { findUserById, registerUser, isUserInState } = useUser(chatId);
  const user = await findUserById(); // Get user data from data base

  // Create user
  if (!user) {
    try {
      await registerUser(msg.from);
      return reply(t("userGreeting"));
    } catch {
      return reply(t("userGreeting"));
    }
  }

  const isUserReadyForMessage = isUserInState(user, "awaitingMessage");

  // Create chat with admin
  if (matches("/chat") && !isUserReadyForMessage) {
    try {
      const existingChat = await chats.findOne({ id: chatId });

      // Check if chat already exists
      if (!existingChat) {
        const chat = await chats.create({ user, id: chatId });
        socket.emit("receiveChat", chat); // Send new chat data to chat app
      }

      const existingChatMessages = await messages.findOne({ id: chatId });

      // Check if chat messages exist
      if (!existingChatMessages) {
        await messages.create({ user, id: chatId });
      }

      user.status = "awaitingMessage";
      await user.save(); // Update user status in the database

      reply("😊 Chat boshlandi! Iltimos, xabar yuboring: ");

      return;
    } catch (err) {
      console.log("Chat yaratishda xatolik:", err);
      reply("Chat yaratishda xatolik yuz berdi.");
    }
  }

  // Send messages to admin
  if (isUserReadyForMessage) {
    if (!message) return; // Check if message is not empty

    try {
      const chatMessages = await messages.findOne({ id: chatId });

      // Check if chat exists
      if (!chatMessages) {
        reply("Chat topilmadi. Iltimos, /chat buyrug'ini yuboring.");

        user.status = "default"; // Reset user status
        await user.save(); // Update user status in the database
        return;
      }

      chatMessages.messages.push({ text: message });
      await chatMessages.save();
      reply("Xabar muvaffaqiyatli yuborildi!");

      // Send new message data to chat app
      socket.emit(`chatMessage:${chatId}`, { text: message, type: "text" });
    } catch (err) {
      console.log("Xabar saqlashda xatolik: ", err);
      reply("Xabarni saqlab bo'lmadi.");
    }
  }
});
