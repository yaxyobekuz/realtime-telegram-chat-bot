const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  path: { type: String, required: true },
  chatId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Photo", photoSchema);
