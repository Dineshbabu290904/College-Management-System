const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  files: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
  }],
  content: String,
  status: {
    type: String,
    enum: ["submitted", "late", "graded", "resubmission_requested"],
    default: "submitted",
  },
  marks: {
    type: Number,
    min: 0,
  },
  feedback: String,
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  gradedAt: Date,
  isLate: {
    type: Boolean,
    default: false,
  },
  plagiarismScore: Number,
});

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Assignment description is required"],
    },
    instructions: String,
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    assignmentType: {
      type: String,
      enum: ["homework", "project", "lab", "quiz", "presentation", "research"],
      default: "homework",
    },
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number,
    }],
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    publishDate: {
      type: Date,
      default: Date.now,
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
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    lateSubmissionDeadline: Date,
    latePenalty: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    allowedFileTypes: [{
      type: String,
    }],
    maxFileSize: {
      type: Number,
      default: 10485760, // 10MB
    },
    maxFiles: {
      type: Number,
      default: 5,
    },
    submissions: [submissionSchema],
    status: {
      type: String,
      enum: ["draft", "published", "closed", "archived"],
      default: "draft",
    },
    visibility: {
      type: String,
      enum: ["all", "section", "selected"],
      default: "all",
    },
    selectedStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    academicYear: String,
    rubric: [{
      criteria: String,
      maxMarks: Number,
      description: String,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
assignmentSchema.virtual("isOverdue").get(function () {
  return new Date() > this.dueDate && this.status === "published";
});

assignmentSchema.virtual("submissionCount").get(function () {
  return this.submissions.length;
});

assignmentSchema.virtual("gradedCount").get(function () {
  return this.submissions.filter(s => s.status === "graded").length;
});

// Indexes
assignmentSchema.index({ subject: 1, dueDate: -1 });
assignmentSchema.index({ faculty: 1, status: 1 });
assignmentSchema.index({ branch: 1, semester: 1, status: 1 });
assignmentSchema.index({ "submissions.student": 1 });

// Check if student has submitted
assignmentSchema.methods.hasStudentSubmitted = function (studentId) {
  return this.submissions.some(s => s.student.toString() === studentId.toString());
};

// Get student submission
assignmentSchema.methods.getStudentSubmission = function (studentId) {
  return this.submissions.find(s => s.student.toString() === studentId.toString());
};

assignmentSchema.plugin(mongoosePaginate);

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;
