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

const chatSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    required: true,
  },
  unansweredMessagesCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "Yangi",
    enum: ["Yangi", "Bloklangan", "Aktiv", "Mijoz"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: userSchema,
});

module.exports = mongoose.model("chat", chatSchema);
