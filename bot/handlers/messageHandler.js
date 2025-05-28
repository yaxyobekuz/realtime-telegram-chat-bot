const bot = require("../bot");

// Dependencies
const { io } = require("../../backend/app");
const { getFile } = require("../utils/helpers");

// Hooks
const useUser = require("../../hooks/useUser");
const useText = require("../../hooks/useText");
const useMessage = require("../../hooks/useMessage");

// Models
const ChatModel = require("../../backend/models/chatModel");
const MessageModel = require("../../backend/models/messagesModel");

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const textMessage = msg.text;

  // Initialize hooks
  const { t } = useText(chatId);
  const { reply, matches } = useMessage(chatId, textMessage);
  const { findUserById, registerUser, isUserInStatus } = useUser(chatId);

  const user = await findUserById();

  // Register user if not found
  if (!user) {
    try {
      await registerUser(msg.from);
      return reply(t("userGreeting"));
    } catch {
      return reply(t("userGreeting"));
    }
  }

  const isWaitingForMessage = isUserInStatus(user, "awaitingMessage");

  // Handle /chat command
  if (matches("/chat") && !isWaitingForMessage) {
    try {
      const existingChat = await ChatModel.findOne({ id: chatId });

      // Create a new chat if not found
      if (!existingChat) {
        const newChat = await ChatModel.create({ user, id: chatId });
        io.emit("receiveChat", newChat); // Notify chat app
      }

      const chatMessages = await MessageModel.findOne({ id: chatId });

      // Create message document if not found
      if (!chatMessages) {
        await MessageModel.create({ user, id: chatId });
      }

      // Update user status to 'awaitingMessage'
      user.status = "awaitingMessage";
      await user.save();

      return reply("😊 Chat boshlandi! Iltimos, xabar yuboring:");
    } catch (error) {
      console.error("Chat creation error:", error);
      return reply("Chat yaratishda xatolik yuz berdi.");
    }
  }

  // Handle incoming messages
  if (isWaitingForMessage) {
    try {
      const chatMessages = await MessageModel.findOne({ id: chatId });

      if (!chatMessages) {
        reply("Chat topilmadi. Iltimos, /chat buyrug'ini yuboring.");

        // Reset user status
        user.status = "default";
        await user.save();
        return;
      }

      // Helper function to save chat and notify
      const saveMessage = async () => {
        reply("Xabar muvaffaqiyatli yuborildi!");

        const chat = await ChatModel.findOne({ id: chatId });
        chat.unansweredMessagesCount += 1;
        await chat.save();

        io.emit("unansweredMessagesCount", {
          count: chat.unansweredMessagesCount,
          chatId,
        });

        return await chatMessages.save();
      };

      // Handle text message
      if (textMessage) {
        const createdAt = Date.now();
        const newMessage = { text: textMessage, createdAt };
        chatMessages.messages.push(newMessage);
        const saved = await saveMessage();
        const savedMessage = saved.messages.find(
          (m) => m.createdAt === createdAt
        );

        return io.emit(`chatMessage:${chatId}`, savedMessage);
      }

      // Handle photo message
      else if (msg.photo) {
        const photoArray = msg.photo;
        const photoFileId = photoArray[photoArray.length - 1].file_id;

        const fileData = await getFile(photoFileId);
        if (!fileData) return null;

        const createdAt = Date.now();
        const photoMessage = {
          createdAt,
          type: "photo",
          caption: msg.caption,
          photo: { url: fileData.url, path: fileData.path },
        };

        chatMessages.messages.push(photoMessage);
        const saved = await saveMessage();
        const savedMessage = saved.messages.find(
          (m) => m.createdAt === createdAt
        );

        return io.emit(`chatMessage:${chatId}`, savedMessage);
      }
    } catch (error) {
      console.error("Message saving error:", error);
      reply("Xabarni saqlab bo'lmadi.");
    }
  }
});
