const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  chatId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  description: { type: String, required: true },
  user: {
    ref: "User",
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  },
  passport: {
    required: true,
    ref: "Passport",
    type: mongoose.Schema.Types.ObjectId,
  },
  payment: {
    required: true,
    ref: "Payment",
    type: mongoose.Schema.Types.ObjectId,
  },
});

module.exports = mongoose.model("Ticket", ticketSchema);  
