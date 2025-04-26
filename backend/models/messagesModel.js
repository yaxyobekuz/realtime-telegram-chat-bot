const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    default: null,
  },
  firstName: {
    type: String,
    default: "Mavjud emas!",
  },
  photo: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const messageSchema = new mongoose.Schema({
  text: String,
  type: {
    type: String,
    default: "text",
    enum: ["text", "image", "video", "audio", "document"],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const messagesSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    required: true,
  },
  user: userSchema,
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("messages", messagesSchema);
