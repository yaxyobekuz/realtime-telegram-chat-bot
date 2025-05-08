const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  url: {
    type: String,
    default: null,
  },
  path: {
    type: String,
    default: null,
  },
});

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
  photo: photoSchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const messageSchema = new mongoose.Schema({
  text: String,
  caption: String,
  type: {
    type: String,
    default: "text",
    enum: ["text", "photo", "video", "audio", "document"],
  },
  photo: photoSchema,
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
  passportId: {
    type: String,
    default: null,
  },
  paymentId: {
    type: String,
    default: null,
  },
  user: userSchema,
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("messages", messagesSchema);
