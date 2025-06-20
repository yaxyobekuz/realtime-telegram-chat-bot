const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  chatId: { type: Number, required: true },
  messageId: { type: String, required: true },
  description: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  photo: { type: mongoose.Schema.Types.ObjectId, ref: "Photo", required: true },
});

module.exports = mongoose.model("Payment", paymentSchema);
