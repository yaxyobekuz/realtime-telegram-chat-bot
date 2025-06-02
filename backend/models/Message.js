const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text: { type: String },
  caption: { type: String },
  chatId: { type: Number, required: true },
  adminId: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  photo: { type: mongoose.Schema.Types.ObjectId, ref: "Photo" },
  type: {
    type: String,
    default: "text",
    enum: ["text", "photo", "video", "audio", "document"],
  },
});

module.exports = mongoose.model("Message", messageSchema);
