const bot = require("../bot");
const { socket } = require("../../backend/app");
const chats = require("../../backend/models/chatModel");
const users = require("../../backend/models/userModel");
const messages = require("../../backend/models/messagesModel");
const userPhoto = require("../../backend/models/userPhotoModel");
const { getUserProfilePhotoBuffer } = require("../utils/helpers");

bot.on("message", async (msg) => {
  const message = msg.text;
  const chatId = msg.chat.id;

  const user = await users.findOne({ id: chatId });

  // Create user
  if (!user) {
    const newUser = await formatUserData(msg.from);
    return await users.create(newUser); // Add new user to the database
  }

  // Create chat with admin
  if (message === "/chat" && user.status !== "awaitingMessage") {
    try {
      const existingChat = await chats.findOne({ id: chatId });

      // Check if chat already exists
      if (!existingChat) {
        const chat = await chats.create({ user, id: chatId });
        socket.emit("receiveChat", chat); // Send new chat data to chat app
        console.log("Chat yaratildi:", chat);
      }

      const existingChatMessages = await messages.findOne({ id: chatId });

      // Check if chat messages exist
      if (!existingChatMessages) {
        await messages.create({ user, id: chatId });
      }

      user.status = "awaitingMessage";
      await user.save(); // Update user status in the database

      bot.sendMessage(chatId, "😊 Chat boshlandi! Iltimos, xabar yuboring: ");

      return;
    } catch (err) {
      console.log("Chat yaratishda xatolik:", err);
      bot.sendMessage(chatId, "Chat yaratishda xatolik yuz berdi.");
    }
  }

  // Send messages to admin
  if (user.status === "awaitingMessage") {
    if (!message) return; // Check if message is not empty

    try {
      const chatMessages = await messages.findOne({ id: chatId });

      // Check if chat exists
      if (!chatMessages) {
        bot.sendMessage(
          chatId,
          "Chat topilmadi. Iltimos, /chat buyrug'ini yuboring."
        );

        user.status = "default"; // Reset user status
        await user.save(); // Update user status in the database
        return;
      }

      chatMessages.messages.push({ text: message });
      await chatMessages.save();
      bot.sendMessage(chatId, "Xabar muvaffaqiyatli yuborildi!");

      // Send new message data to chat app
      socket.emit(`chatMessage:${chatId}`, { text: message, type: "text" });
    } catch (err) {
      console.error("Xabar saqlashda xatolik:", err);
      bot.sendMessage(chatId, "Xabarni saqlab bo'lmadi.");
    }
  }
});

async function formatUserData(user) {
  let photoUrl = null;
  const photo = await getUserProfilePhotoBuffer(user.id);

  if (photo) {
    await userPhoto
      .create({
        id: user.id,
        data: photo.buffer,
        contentType: photo.contentType,
      })
      .then(() => {
        photoUrl = `/api/profile-photo/${user.id}`;
      });
  }

  return {
    id: user.id,
    photo: photoUrl,
    username: user.username,
    firstName: user.first_name || null,
  };
}
