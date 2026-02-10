const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
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
      enum: ["core", "elective", "open_elective", "lab", "project", "internship"],
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
    },
    prerequisites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    }],
    syllabus: [{
      unit: Number,
      title: String,
      topics: [String],
      hours: Number,
    }],
    lectureHours: {
      type: Number,
      default: 0,
    },
    tutorialHours: {
      type: Number,
      default: 0,
    },
    practicalHours: {
      type: Number,
      default: 0,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    maxIntakeForElective: {
      type: Number,
      default: 0,
    },
    faculty: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    resources: [{
      title: String,
      type: { type: String, enum: ["textbook", "reference", "video", "link"] },
      url: String,
      author: String,
    }],
    outcomes: [String],
    evaluationScheme: {
      internalMarks: { type: Number, default: 30 },
      externalMarks: { type: Number, default: 70 },
      practicalMarks: { type: Number, default: 0 },
      assignmentMarks: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    academicYear: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
courseSchema.index({ code: 1 });
courseSchema.index({ department: 1, semester: 1 });
courseSchema.index({ type: 1, isActive: 1 });

// Calculate total hours before saving
courseSchema.pre("save", function () {
  this.totalHours = this.lectureHours + this.tutorialHours + this.practicalHours;
});

courseSchema.plugin(mongoosePaginate);

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
