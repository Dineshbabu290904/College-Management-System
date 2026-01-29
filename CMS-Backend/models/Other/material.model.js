const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  faculty: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// Check if model exists before creating to avoid OverwriteModelError
module.exports = mongoose.models.Material || mongoose.model("Material", materialSchema);
