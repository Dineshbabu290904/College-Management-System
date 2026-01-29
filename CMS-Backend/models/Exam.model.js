const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

// Exam Schedule Schema
const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Exam name is required"],
      trim: true,
    },
    examType: {
      type: String,
      enum: ["internal", "midterm", "endterm", "practical", "viva", "project", "supplementary"],
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
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
    date: {
      type: Date,
      required: [true, "Exam date is required"],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true, // in minutes
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    passingMarks: {
      type: Number,
      min: 0,
    },
    venue: {
      building: String,
      room: String,
      capacity: Number,
    },
    invigilators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    instructions: [String],
    syllabusUnits: [Number],
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled", "postponed"],
      default: "scheduled",
    },
    postponedTo: Date,
    academicYear: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Exam Result Schema
const examResultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    marksObtained: {
      type: Number,
      min: 0,
    },
    grade: {
      type: String,
      enum: ["O", "A+", "A", "B+", "B", "C", "D", "F", "AB", "WH"],
    },
    gradePoints: {
      type: Number,
      min: 0,
      max: 10,
    },
    status: {
      type: String,
      enum: ["pending", "evaluated", "verified", "published", "withheld"],
      default: "pending",
    },
    isAbsent: {
      type: Boolean,
      default: false,
    },
    isCopyCase: {
      type: Boolean,
      default: false,
    },
    remarks: String,
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    evaluatedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
    revaluationRequested: {
      type: Boolean,
      default: false,
    },
    revaluationDetails: {
      requestedAt: Date,
      reason: String,
      previousMarks: Number,
      newMarks: Number,
      status: {
        type: String,
        enum: ["pending", "in_progress", "completed", "rejected"],
      },
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
examSchema.index({ subject: 1, date: 1 });
examSchema.index({ branch: 1, semester: 1, examType: 1 });
examSchema.index({ date: 1, status: 1 });
examResultSchema.index({ exam: 1, student: 1 }, { unique: true });
examResultSchema.index({ student: 1, status: 1 });

// Calculate grade based on marks
examResultSchema.pre("save", function (next) {
  if (this.marksObtained !== undefined && !this.isAbsent) {
    const percentage = (this.marksObtained / this.maxMarks) * 100;

    if (percentage >= 90) {
      this.grade = "O";
      this.gradePoints = 10;
    } else if (percentage >= 80) {
      this.grade = "A+";
      this.gradePoints = 9;
    } else if (percentage >= 70) {
      this.grade = "A";
      this.gradePoints = 8;
    } else if (percentage >= 60) {
      this.grade = "B+";
      this.gradePoints = 7;
    } else if (percentage >= 50) {
      this.grade = "B";
      this.gradePoints = 6;
    } else if (percentage >= 40) {
      this.grade = "C";
      this.gradePoints = 5;
    } else if (percentage >= 33) {
      this.grade = "D";
      this.gradePoints = 4;
    } else {
      this.grade = "F";
      this.gradePoints = 0;
    }
  } else if (this.isAbsent) {
    this.grade = "AB";
    this.gradePoints = 0;
  }
  next();
});

examSchema.plugin(mongoosePaginate);
examResultSchema.plugin(mongoosePaginate);

const Exam = mongoose.model("Exam", examSchema);
const ExamResult = mongoose.model("ExamResult", examResultSchema);

module.exports = { Exam, ExamResult };
