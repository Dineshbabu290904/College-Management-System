const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  link: {
    type: String,
  }
}, { timestamps: true });

// Check if model exists before creating to avoid OverwriteModelError
module.exports = mongoose.models.Notice || mongoose.model("Notice", noticeSchema);
