const express = require("express");
const router = express.Router();

// Models
const User = require("../models/User");
const Ticket = require("../models/Ticket");
const Payment = require("../models/Payment");
const Passport = require("../models/Passport");

// Get all tickets
router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.find().populate("user");
    res.send({ ok: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).send("Ichki xatolik");
  }
});

// Get all user tickets
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res
      .status(400)
      .json({ message: "Foydalanuvchi ID raqami mavjud emas" });
  }

  try {
    const tickets = await Ticket.find({ user: userId })
      .populate("Payment")
      .populate("passport");

    const user = await User.findById(userId);
    res.send({ ok: true, count: tickets.length, data: tickets, user });
  } catch (error) {
    res.status(500).send("Ichki xatolik");
  }
});

// Get single ticket
router.get("/ticket/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Chipta ID raqami mavjud emas" });
  }

  try {
    const ticket = await Ticket.findById(id)
      .populate("user")
      .populate("Payment")
      .populate("passport");

    if (!ticket) {
      return res.status(404).json({ message: "Chipta ma'lumotlari topilmadi" });
    }

    res.send(ticket);
  } catch (error) {
    res.status(500).send("Ichki xatolik");
  }
});

// Create a new ticket
router.post("/new", async (req, res) => {
  const { chatId, description, paymentId, passportId, name, userId } = req.body;

  if (
    !name ||
    !userId ||
    !chatId ||
    !paymentId ||
    !passportId ||
    !description
  ) {
    return res
      .status(400)
      .json({ message: "Talab qilingan ma'lumotlar to'liq emas" });
  }

  try {
    // User
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    // Payment
    const payment = await Payment.findOne({ _id: paymentId });
    if (!payment) {
      return res.status(404).json({ message: "To'lov topilmadi" });
    }

    // Passport
    const passport = await Passport.findOne({ _id: passportId });
    if (!passport) {
      return res.status(404).json({ message: "Pasport topilmadi" });
    }

    // Create a new ticket
    const newTicket = await Ticket.insertOne({
      name,
      chatId,
      description,
      user: userId,
      payment: paymentId,
      passport: passportId,
    });

    payment.ticket = newTicket._id;
    passport.ticket = newTicket._id;
    await payment.save();
    await passport.save();

    // Send
    res.status(201).send({
      ok: true,
      data: newTicket,
      message: "Chipta muvaffaqiyatli yaratildi",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Ichki xatolik");
  }
});

module.exports = router;
