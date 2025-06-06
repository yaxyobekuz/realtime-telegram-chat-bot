const mongoose = require("mongoose");
const statuses = require("../../data/statuses");

const profilePhotoSchema = new mongoose.Schema({
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
  photo: profilePhotoSchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  id: {
    unique: true,
    type: Number,
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
  unansweredMessagesCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "new",
    enum: statuses.map(({ value }) => value),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: userSchema,
});

module.exports = mongoose.model("Chat", chatSchema);
