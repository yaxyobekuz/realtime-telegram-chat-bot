const bot = require("../bot");

// Dependencies
const { io } = require("../../backend/app");
const { getFile } = require("../utils/helpers");

// Hooks
const useUser = require("../../hooks/useUser");
const useText = require("../../hooks/useText");
const useMessage = require("../../hooks/useMessage");

// Models
const Chat = require("../../backend/models/Chat");
const Message = require("../../backend/models/Message");

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
      const existingChat = await Chat.findOne({ id: chatId });

      // Create a new chat if not found
      if (!existingChat) {
        const newChat = await Chat.create({ user, id: chatId });
        io.emit("receiveChat", newChat); // Notify chat app
      }

      // Update user status to 'awaitingMessage'
      user.status = "awaitingMessage";
      await user.save();

      return reply("😊 Chat boshlandi! Iltimos, xabar yuboring:");
    } catch (error) {
      console.error("Chat creation error: ", error);
      return reply("Chat yaratishda xatolik yuz berdi.");
    }
  }

  // Handle incoming messages
  if (isWaitingForMessage) {
    try {
      // Helper function to save chat and notify
      const saveMessage = async (message) => {
        reply("Xabar muvaffaqiyatli yuborildi!");

        const chat = await Chat.findOne({ id: chatId });
        chat.unansweredMessagesCount += 1;
        await chat.save();

        io.emit("unansweredMessagesCount", {
          count: chat.unansweredMessagesCount,
          chatId,
        });

        return await message.save();
      };

      // Handle text message
      if (textMessage) {
        const newMessage = new Message({ text: textMessage, chatId });
        const savedMessage = await saveMessage(newMessage);

        return io.emit(`chatMessage:${chatId}`, savedMessage);
      }

      // Handle photo message
      else if (msg.photo) {
        const photoArray = msg.photo;
        const photoFileId = photoArray[photoArray.length - 1].file_id;

        const fileData = await getFile(photoFileId);
        if (!fileData) return null;

        const photoMessage = {
          chatId,
          type: "photo",
          caption: msg.caption,
          photo: { url: fileData.url, path: fileData.path },
        };

        const newMessage = new Message(photoMessage);
        const savedMessage = await saveMessage(newMessage);

        return io.emit(`chatMessage:${chatId}`, savedMessage);
      }
    } catch (error) {
      console.error("Message saving error: ", error);
      reply("Xabarni saqlab bo'lmadi.");
    }
  }
});
