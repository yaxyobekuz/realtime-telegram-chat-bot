const bot = require("../bot");

// Dependencies
const { io } = require("../../backend/app");
const { getFile, downloadAndUploadImage } = require("../utils/helpers");

// Hooks
const useUser = require("../../hooks/useUser");
const useText = require("../../hooks/useText");
const useMessage = require("../../hooks/useMessage");

// Models
const Chat = require("../../backend/models/Chat");
const Photo = require("../../backend/models/Photo");
const Message = require("../../backend/models/Message");

bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;

  // Initialize hooks
  const { t } = useText(chatId);
  const { reply, matches } = useMessage(chatId, text);
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
        // Save message and update chat count in parallel
        const [savedMessage, chat] = await Promise.all([
          message.save(),
          Chat.findOneAndUpdate(
            { id: chatId },
            { $inc: { unansweredMessagesCount: 1 } },
            { new: true }
          ),
        ]);

        // Send notifications
        reply("Xabar muvaffaqiyatli yuborildi!");
        io.emit("unansweredMessagesCount", {
          chatId,
          count: chat.unansweredMessagesCount,
        });

        return savedMessage;
      };

      // Handle text message
      if (text) {
        const newMessage = new Message({ text, chatId });
        const savedMessage = await saveMessage(newMessage);
        return io.emit(`chatMessage:${chatId}`, savedMessage);
      }

      // Handle photo message
      if (msg.photo) {
        const photoFileId = msg.photo[msg.photo.length - 1].file_id;
        const fileData = await getFile(photoFileId);

        if (!fileData) return reply("Rasmni yuklashda xatolik yuz berdi.");

        // Create and save photo
        const photo = new Photo({
          chatId,
          url: fileData.url,
          path: fileData.path,
        });
        const savedPhoto = await photo.save();

        // Create and save message
        const newMessage = new Message({
          chatId,
          type: "photo",
          caption: msg.caption,
          photo: savedPhoto._id,
        });
        const savedMessage = await saveMessage(newMessage);

        // Emit message with photo data
        io.emit(`chatMessage:${chatId}`, {
          ...savedMessage.toObject(),
          photo: savedPhoto,
        });

        // Upload image asynchronously
        downloadAndUploadImage(savedPhoto)
          .then((uploadedPhoto) => {
            if (uploadedPhoto) {
              savedPhoto.url = uploadedPhoto.url;
              savedPhoto.path = uploadedPhoto.path;
              return savedPhoto.save();
            }
          })
          .catch((err) => console.log("Image upload error: ", err));

        return;
      }
    } catch (err) {
      console.log("Message saving error: ", err);
      reply("Xabarni saqlab bo'lmadi.");
    }
  }
});
