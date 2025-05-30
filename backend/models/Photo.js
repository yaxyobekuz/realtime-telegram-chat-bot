const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  data: {
    type: Buffer,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Photo", photoSchema);
