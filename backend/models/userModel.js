const mongoose = require("mongoose");

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
  status: {
    type: String,
    default: "default",
    enum: ["default", "awaitingMessage"],
  },
  photo: profilePhotoSchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("user", userSchema);
