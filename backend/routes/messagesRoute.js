const express = require("express");
const router = express.Router();
const messages = require("../models/messagesModel");

router.put("/:messageGroupId/:fieldName", async (req, res) => {
  const updatedMessageId = req.body?.id;
  const { messageGroupId, fieldName } = req.params;

  if (!messageGroupId) {
    return res
      .status(400)
      .json({ message: "Xabarlar guruhi ID raqami mavjud emas" });
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
    const existingMessageGroup = await messages.findOne({
      id: messageGroupId,
    });

    if (!existingMessageGroup) {
      return res.status(404).json({ message: "Xabar guruhi topilmadi" });
    }

    existingMessageGroup[fieldName] = updatedMessageId;

    await existingMessageGroup.save();

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
