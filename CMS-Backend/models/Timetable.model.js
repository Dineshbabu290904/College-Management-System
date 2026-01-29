const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const periodSchema = new mongoose.Schema({
  periodNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  room: String,
  type: {
    type: String,
    enum: ["lecture", "lab", "tutorial", "break", "lunch", "free"],
    default: "lecture",
  },
  isBreak: {
    type: Boolean,
    default: false,
  },
});

const timetableSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    section: String,
    academicYear: {
      type: String,
      required: true,
    },
    effectiveFrom: {
      type: Date,
      required: true,
    },
    effectiveTo: Date,
    schedule: {
      monday: [periodSchema],
      tuesday: [periodSchema],
      wednesday: [periodSchema],
      thursday: [periodSchema],
      friday: [periodSchema],
      saturday: [periodSchema],
    },
    periodTimings: [{
      periodNumber: Number,
      startTime: String,
      endTime: String,
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    version: {
      type: Number,
      default: 1,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
timetableSchema.index({ branch: 1, semester: 1, section: 1, academicYear: 1 }, { unique: true });
timetableSchema.index({ status: 1, effectiveFrom: 1 });

// Static method to get faculty timetable
timetableSchema.statics.getFacultyTimetable = async function (facultyId, academicYear) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const result = {};

  for (const day of days) {
    result[day] = [];
  }

  const timetables = await this.find({
    status: "active",
    academicYear,
    $or: days.map(day => ({ [`schedule.${day}.faculty`]: facultyId })),
  }).populate("branch", "name code");

  for (const tt of timetables) {
    for (const day of days) {
      const periods = tt.schedule[day].filter(
        p => p.faculty && p.faculty.toString() === facultyId.toString()
      );
      for (const period of periods) {
        result[day].push({
          ...period.toObject(),
          branch: tt.branch,
          semester: tt.semester,
          section: tt.section,
        });
      }
    }
  }

  return result;
};

timetableSchema.plugin(mongoosePaginate);

const Timetable = mongoose.model("Timetable", timetableSchema);

module.exports = Timetable;
