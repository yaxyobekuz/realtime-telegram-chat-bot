const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  url: { type: String, default: null },
  path: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  photo: photoSchema,
  text: { type: String },
  caption: { type: String },
  chatId: { type: Number, required: true },
  adminId: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  type: {
    type: String,
    default: "text",
    enum: ["text", "photo", "video", "audio", "document"],
  },
});

module.exports = mongoose.model("Message", messageSchema);
