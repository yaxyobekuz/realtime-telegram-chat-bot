const express = require("express");
const router = express.Router();

// Models
const User = require("../models/User");
const Photo = require("../models/Photo");
const Payment = require("../models/Payment");
const Message = require("../models/Message");

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

    res.send({ ok: true, data: payment });
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

    const newPayment = await Payment.create({
      amount,
      chatId,
      messageId,
      description,
      user: user._id,
      photo: photo._id,
    });

    await Message.findByIdAndUpdate(messageId, { paymentId: newPayment._id });

    const populatedPayment = await Payment.findById(newPayment._id)
      .populate("user")
      .populate("photo");

    res.status(201).send({
      ok: true,
      data: populatedPayment,
      message: "To'lov muvaffaqiyatli yaratildi",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Ichki xatolik");
  }
});

// Update payment information
router.put("/payment/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, description, photoId } = req.body;

  if (!id) {
    return res.status(400).json({ message: "To'lov ID raqami mavjud emas" });
  }

  try {
    // Check if payment exists
    const existingPayment = await Payment.findById(id);

    if (!existingPayment) {
      return res.status(404).json({ message: "To'lov ma'lumotlari topilmadi" });
    }

    // Prepare update data
    const updateData = {};

    if (amount !== undefined) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;

    // If new photo is provided, validate it
    if (photoId) {
      const photo = await Photo.findById(photoId);
      if (!photo) {
        return res.status(404).json({ message: "Yangi rasm topilmadi" });
      }
      updateData.photo = photoId;
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    // Update the payment
    const updatedPayment = await Payment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user")
      .populate("photo");

    res.send({
      ok: true,
      data: updatedPayment,
      message: "To'lov ma'lumotlari muvaffaqiyatli yangilandi",
    });
  } catch (error) {
    console.log(error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Ma'lumotlar noto'g'ri formatda",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).send("Ichki xatolik");
  }
});

// Delete payment
router.delete("/payment/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "To'lov ID raqami mavjud emas" });
  }

  try {
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ message: "To'lov ma'lumotlari topilmadi" });
    }

    // Remove payment reference from message
    if (payment.messageId) {
      await Message.findByIdAndUpdate(payment.messageId, {
        $unset: { paymentId: 1 },
      });
    }

    // Delete the payment
    await Payment.findByIdAndDelete(id);

    res.send({
      ok: true,
      message: "To'lov ma'lumotlari muvaffaqiyatli o'chirildi",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Ichki xatolik");
  }
});

module.exports = router;
