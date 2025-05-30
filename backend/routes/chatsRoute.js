const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const Message = require("../models/Message");

router.get("/", async (req, res) => {
  try {
    const chats = await Chat.find();
    res.send(chats);
  } catch {
    res.status(500).send("Ichki xatolik");
  }
});

router.get("/chat/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Chat ID raqami mavjud emas" });
  }
  const chat = await Chat.findOne({ id: Number(id) });

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

  const messages = await Message.find({ chatId: Number(id) });
  res.send({ id, messages });
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
    const chat = await Chat.findOne({ id: Number(id) });

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

router.put("/chat/:id/update/:fieldName", async (req, res) => {
  const { id, fieldName } = req.params;
  const updatedMessageId = req.body?.id;

  if (!id) {
    return res.status(400).json({ message: "Chat ID raqami mavjud emas" });
  }

  if (!updatedMessageId) {
    return res
      .status(400)
      .json({ message: "Yangi xabar ID raqami mavjud emas" });
  }

  if (!fieldName || (fieldName !== "passportId" && fieldName !== "paymentId")) {
    return res.status(400).json({
      message:
        "Maydon nomi noto'g'ri. Faqat passportId yoki paymentId bo'lishi mumkin",
    });
  }

  try {
    const chat = await Chat.findOneAndUpdate(
      { id },
      { [fieldName]: updatedMessageId }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat topilmadi" });
    }

    res.send({
      ok: true,
      fieldName,
      status: 200,
      updatedId: updatedMessageId,
      message: `${fieldName} muvaffaqiyatli ${updatedMessageId} ga o'zgartirildi`,
    });
  } catch {
    res.status(500).send({ message: "Ichki server xatoligi" });
  }
});

module.exports = router;
