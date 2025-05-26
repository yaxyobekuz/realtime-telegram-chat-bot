const express = require("express");
const router = express.Router();
const chats = require("../models/chatModel");
const messages = require("../models/messagesModel");

router.get("/", async (req, res) => {
  try {
    const chatsData = await chats.find();
    res.send(chatsData);
  } catch {
    res.status(500).send("Ichki xatolik");
  }
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
    return res.status(400).json({ message: "Chat ID raqami mavjud emas" });
  }

  const messagesData = await messages.findOne({ id: Number(id) });

  if (!messagesData) {
    return res.status(404).json({ message: "Xabarlar topilmadi" });
  }

  res.send(messagesData);
});

router.put("/chat/:id/status", async (req, res) => {
  const { id } = req.params;
  const newStatus = req.body.status;

  if (!id || !newStatus) {
    return res
      .status(400)
      .json({ message: "Chat ID raqami yoki Holat qiymati mavjud emas" });
  }

  try {
    const chat = await chats.findOne({ id: Number(id) });

    if (!chat) {
      return res.status(404).json({ message: "Chat topilmadi" });
    }

    chat.status = newStatus;
    await chat.save();

    res.send({
      id,
      ok: true,
      status: 200,
      updatedStatus: newStatus,
      message: `${id} raqamli chat holati muvaffaqiyatli ${newStatus} ga o'zgartirildi`,
    });
  } catch {
    res.status(500).send("Ichki xatolik");
  }
});

module.exports = router;
