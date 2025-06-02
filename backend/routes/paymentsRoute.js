const express = require("express");
const router = express.Router();

// Models
const User = require("../models/User");
const Photo = require("../models/Photo");
const Payment = require("../models/Payment");

// Get all payments
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find().populate("user").populate("photo");
    res.send(payments);
  } catch (error) {
    res.status(500).send("Ichki xatolik");
  }
});

// Get single payment
router.get("/payment/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "To'lov ID raqami mavjud emas" });
  }

  try {
    const payment = await Payment.findById(id)
      .populate("user")
      .populate("photo");

    if (!payment) {
      return res.status(404).json({ message: "To'lov ma'lumotlari topilmadi" });
    }

    res.send(payment);
  } catch (error) {
    res.status(500).send("Ichki xatolik");
  }
});

// Create a new payment
router.post("/new", async (req, res) => {
  const { amount, chatId, messageId, description, userId, photoId } = req.body;

  if (!amount || !chatId || !messageId || !userId || !photoId) {
    return res
      .status(400)
      .json({ message: "Talab qilingan ma'lumotlar to'liq emas" });
  }

  try {
    const existingPayment = await Payment.findOne({ messageId });

    if (existingPayment) {
      return res.status(400).json({
        message: "Xabar allaqachon to'lov ma'lumotlari sifatida saqlangan",
      });
    }

    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    const photo = await Photo.findOne({ _id: photoId });

    if (!photo) {
      return res.status(404).json({ message: "Rasm topilmadi" });
    }

    const newPayment = new Payment({
      amount,
      chatId,
      messageId,
      description,
      user: user._id,
      photo: photo._id,
    });

    await newPayment.save();

    res.status(201).send({
      ok: true,
      data: newPayment,
      message: "To'lov muvaffaqiyatli yaratildi",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Ichki xatolik");
  }
});

module.exports = router;
