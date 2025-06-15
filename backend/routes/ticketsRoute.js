const path = require("path");
const express = require("express");
const router = express.Router();

// Socket
const { io } = require("../app");

// Multer
const multer = require("multer");
const storage = multer.memoryStorage();

// Helpers
const {
  generateFileName,
  uploadFileToObjectDB,
  deleteFileFromObjectDB,
} = require("../../bot/utils/helpers");

// Models
const User = require("../models/User");
const File = require("../models/File");
const Ticket = require("../models/Ticket");
const Message = require("../models/Message");
const Payment = require("../models/Payment");
const Passport = require("../models/Passport");
const useMessage = require("../../hooks/useMessage");

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /pdf|doc|docx/;
    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = allowedTypes.test(file.mimetype);

    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb(new Error("Fayl turi qo'llab-quvvatlanmaydi"));
    }
  },
});

// Get all tickets
router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.find().populate("user").populate("payment");
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
      .populate("user")
      .populate("payment");

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
      .populate("file")
      .populate({ path: "payment", populate: "photo" })
      .populate({ path: "passport", populate: "photo" });

    if (!ticket) {
      return res.status(404).json({ message: "Chipta ma'lumotlari topilmadi" });
    }

    res.send({ ok: true, data: ticket });
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

    // Create new ticket
    const newTicket = await Ticket.create({
      name,
      chatId,
      description,
      user: userId,
      payment: paymentId,
      passport: passportId,
    });

    // Update related documents
    payment.ticket = newTicket._id;
    passport.ticket = newTicket._id;
    await Promise.all([payment.save(), passport.save()]);

    // Prepare response with populated data
    const ticketResponse = {
      ...newTicket.toObject(),
      user,
      payment,
    };

    res.status(201).json({
      ok: true,
      data: ticketResponse,
      message: "Chipta muvaffaqiyatli yaratildi",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Ichki xatolik");
  }
});

// Upload file to ticket
router.put("/upload/:ticketId", upload.single("file"), async (req, res) => {
  const { ticketId } = req.params;

  if (!ticketId) {
    return res.status(400).json({ message: "Chipta ID raqami mavjud emas" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Fayl yuklash talab qilinadi" });
  }

  try {
    // Check if ticket exists
    const ticket = await Ticket.findById(ticketId).populate("file");
    if (!ticket) {
      return res.status(404).json({ message: "Chipta topilmadi" });
    }

    // If file already exists, delete it
    if (ticket.file) {
      try {
        await Ticket.findByIdAndDelete(ticket.file._id);
        await deleteFileFromObjectDB(ticket.file.fileName);
      } catch {
        console.log("Ticket deletion error. File id: ", ticket.file?._id);
      }
    }

    const { originalname, buffer, mimetype, size } = req.file;

    // Generate unique file name
    const fileName = generateFileName(originalname);

    // Upload file to object storage
    const uploadResult = await uploadFileToObjectDB(buffer, fileName, mimetype);

    if (!uploadResult) {
      return res
        .status(500)
        .json({ message: "Fayl yuklashda xatolik yuz berdi" });
    }

    // Create file record in database
    const newFile = await File.create({
      fileSize: size,
      ticket: ticketId,
      mimeType: mimetype,
      fileName: fileName,
      fileUrl: uploadResult.url,
      originalName: originalname,
      filePath: uploadResult.path,
    });

    // Update ticket file id & status
    ticket.file = newFile._id;
    if (ticket.status === "new") {
      ticket.status = "readyToSend";
    }
    await ticket.save();

    res.status(201).json({
      ok: true,
      data: newFile,
      message: "Fayl muvaffaqiyatli yuklandi",
    });
  } catch (error) {
    console.error("Fayl yuklashda xatolik:", error);
    res.status(500).json({ message: "Ichki xatolik" });
  }
});

// Delete file from ticket
router.delete("/file/:fileId", async (req, res) => {
  const { fileId } = req.params;

  if (!fileId) {
    return res.status(400).json({ message: "Fayl ID raqami mavjud emas" });
  }

  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "Fayl topilmadi" });
    }

    // Remove file from ticket
    const ticket = await Ticket.findById(file.ticket);
    ticket.file = null;
    if (ticket.status === "readyToSend") {
      ticket.status = "new";
    }
    await ticket.save();

    // Delete file record
    if (ticket.status !== "sent") {
      await File.findByIdAndDelete(fileId);
    }

    res.json({
      ok: true,
      message: "Fayl muvaffaqiyatli o'chirildi",
    });
  } catch (error) {
    console.error("Fayl o'chirishda xatolik:", error);
    res.status(500).json({ message: "Ichki xatolik" });
  }
});

// Send ticket to user
router.post("/send/:ticketId", async (req, res) => {
  const { ticketId } = req.params;
  let { caption } = req.body || {};

  if (!ticketId || typeof ticketId !== "string") {
    return res.status(400).json({ message: "Chipta ID raqami mavjud emas" });
  }

  try {
    // Check if ticket exists
    const ticket = await Ticket.findById(ticketId).populate("file");
    if (!ticket) {
      return res.status(404).json({ message: "Chipta topilmadi" });
    }

    if (!ticket.file) {
      return res.status(400).json({ message: "Chipta fayli mavjud emas" });
    }

    const { chatId } = ticket;
    caption = `<b>Chiptangiz tayyor ✅</b>\n\n<b>👤 Foydalanuvchi: </b>${
      ticket.name
    }\n<b>💬 Qo'shimcha: </b>${caption || ""}`;

    // Create file record in database
    const newMessage = await Message.create({
      chatId,
      caption,
      type: "file",
      isAdmin: true,
      file: ticket.file._id,
    });

    // Update ticket file id & status
    ticket.status = "sent";
    await ticket.save();

    // Send message to user
    const { sendFile } = useMessage(chatId);

    await sendFile(ticket.file.fileUrl, caption);

    io.emit(`chatMessage:${chatId}`, {
      ...newMessage.toObject(),
      file: ticket.file,
    });

    res.status(201).json({
      ok: true,
      data: { ticket, message: newMessage },
      message: "Chipta muvaffaqiyatli yuborildi",
    });
  } catch (error) {
    console.log("Chipta yuborishda xatolik: ", error);
    res.status(500).json({ message: "Ichki xatolik" });
  }
});

module.exports = router;
