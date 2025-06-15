const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text: { type: String },
  caption: { type: String },
  chatId: { type: Number, required: true },
  adminId: { type: String, default: null },
  paymentId: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
  passportId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  file: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
  photo: { type: mongoose.Schema.Types.ObjectId, ref: "Photo" },
  type: {
    type: String,
    default: "text",
    enum: ["text", "photo", "video", "audio", "file"],
  },
});

module.exports = mongoose.model("Message", messageSchema);
