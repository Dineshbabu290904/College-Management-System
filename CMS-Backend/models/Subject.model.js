const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Subject code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
      maxlength: 10,
    },
    description: String,
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    type: {
      type: String,
      enum: ["theory", "practical", "both"],
      default: "theory",
    },
    category: {
      type: String,
      enum: ["core", "elective", "open_elective", "lab", "project"],
      default: "core",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
    },
    faculty: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    lectureHoursPerWeek: {
      type: Number,
      default: 3,
    },
    practicalHoursPerWeek: {
      type: Number,
      default: 0,
    },
    tutorialHoursPerWeek: {
      type: Number,
      default: 0,
    },
    syllabus: [{
      unit: Number,
      title: String,
      topics: [String],
      hours: Number,
    }],
    prerequisites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    }],
    evaluationScheme: {
      internal: { type: Number, default: 30 },
      external: { type: Number, default: 70 },
      practical: { type: Number, default: 0 },
    },
    resources: [{
      title: String,
      author: String,
      type: {
        type: String,
        enum: ["textbook", "reference", "video", "website"],
      },
      url: String,
      isbn: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    academicYear: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total weekly hours
subjectSchema.virtual("totalHoursPerWeek").get(function () {
  return this.lectureHoursPerWeek + this.practicalHoursPerWeek + this.tutorialHoursPerWeek;
});

// Indexes
subjectSchema.index({ code: 1 });
subjectSchema.index({ branch: 1, semester: 1 });
subjectSchema.index({ department: 1, isActive: 1 });
subjectSchema.index({ faculty: 1 });

subjectSchema.plugin(mongoosePaginate);

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
