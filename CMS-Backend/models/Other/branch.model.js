const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// Check if model exists before creating to avoid OverwriteModelError
module.exports = mongoose.models.Branch || mongoose.model("Branch", branchSchema);
