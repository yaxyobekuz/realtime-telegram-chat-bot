const express = require("express");
const router = express.Router();
const Chat = require("../models/chatModel");
const messages = require("../models/messagesModel");

router.get("/", async (req, res) => {
  const chats = await Chat.find();
  res.send(chats);
});

router.get("/chat/:chatId", async (req, res) => {
  const { chatId } = req.params;

  const chat = await messages.findOne({ chatId });

  if (!chat) {
    return res.status(404).json({ message: "Chat topilmadi" });
  }

  res.send(chat);
});

router.get("/chat/:id/messages", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Chat ID raqami mavjud emas!" });
  }

  const messagesData = await messages.findOne({ id: Number(id) });

  if (!messagesData) {
    return res.status(404).json({ message: "Xabarlar topilmadi!" });
  }

  res.send(messagesData);
});

module.exports = router;
