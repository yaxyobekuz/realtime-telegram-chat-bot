const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fileSize: { type: Number },
  mimeType: { type: String },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  originalName: { type: String, required: true },
  ticket: { ref: "Ticket", type: mongoose.Schema.Types.ObjectId },
});

module.exports = mongoose.model("File", fileSchema);
