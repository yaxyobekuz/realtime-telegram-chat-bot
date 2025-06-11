const express = require("express");
const router = express.Router();

// Models
const User = require("../models/User");
const Photo = require("../models/Photo");
const Message = require("../models/Message");
const Passport = require("../models/Passport");

// Get all passports
router.get("/", async (req, res) => {
  try {
    const passports = await Passport.find().populate("user").populate("photo");
    res.send({ ok: true, count: passports.length, data: passports });
  } catch (error) {
    res.status(500).send("Ichki xatolik");
  }
});

// Get all user passports
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res
      .status(400)
      .json({ message: "Foydalanuvchi ID raqami mavjud emas" });
  }

  try {
    const passports = await Passport.find({ user: userId })
      .populate("user")
      .populate("photo");

    res.send({ ok: true, count: passports.length, data: passports });
  } catch (error) {
    res.status(500).send("Ichki xatolik");
  }
});

// Get single passport
router.get("/passport/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Pasport ID raqami mavjud emas" });
  }

  try {
    const passport = await Passport.findById(id)
      .populate("user")
      .populate("photo");

    if (!passport) {
      return res
        .status(404)
        .json({ message: "Pasport ma'lumotlari topilmadi" });
    }

    res.send(passport);
  } catch (error) {
    res.status(500).send("Ichki xatolik");
  }
});

// Create a new passport
router.post("/new", async (req, res) => {
  const { chatId, messageId, description, userId, photoId } = req.body;

  if (!chatId || !messageId || !userId || !photoId) {
    return res
      .status(400)
      .json({ message: "Talab qilingan ma'lumotlar to'liq emas" });
  }

  try {
    const existingPassport = await Passport.findOne({ messageId });

    if (existingPassport) {
      return res.status(400).json({
        message: "Xabar allaqachon Pasport ma'lumotlari sifatida saqlangan",
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

    const newPassport = await Passport.insertOne({
      chatId,
      messageId,
      description,
      user: user._id,
      photo: photo._id,
    });

    await Message.findByIdAndUpdate(
      { _id: messageId },
      { passportId: newPassport._id }
    );

    res.status(201).send({
      ok: true,
      data: newPassport,
      message: "Pasport muvaffaqiyatli yaratildi",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Ichki xatolik");
  }
});

module.exports = router;
