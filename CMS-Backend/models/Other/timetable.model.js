const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  link: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

// Check if model exists before creating to avoid OverwriteModelError
module.exports = mongoose.models.Timetable || mongoose.model("Timetable", timetableSchema);
