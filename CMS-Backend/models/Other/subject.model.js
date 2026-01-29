const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// Check if model exists before creating to avoid OverwriteModelError
module.exports = mongoose.models.Subject || mongoose.model("Subject", subjectSchema);
