const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["present", "absent", "late", "excused"],
    required: true,
  },
  remarks: String,
});

const attendanceSchema = new mongoose.Schema(
  {
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
    date: {
      type: Date,
      required: true,
    },
    period: {
      type: Number,
      min: 1,
      max: 10,
    },
    sessionType: {
      type: String,
      enum: ["lecture", "lab", "tutorial", "seminar"],
      default: "lecture",
    },
    records: [attendanceRecordSchema],
    totalPresent: {
      type: Number,
      default: 0,
    },
    totalAbsent: {
      type: Number,
      default: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    academicYear: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
attendanceSchema.index({ subject: 1, date: 1, section: 1 }, { unique: true });
attendanceSchema.index({ faculty: 1, date: 1 });
attendanceSchema.index({ branch: 1, semester: 1, date: 1 });
attendanceSchema.index({ "records.student": 1, date: 1 });

// Calculate totals before saving
attendanceSchema.pre("save", function () {
  this.totalPresent = this.records.filter(r => r.status === "present" || r.status === "late").length;
  this.totalAbsent = this.records.filter(r => r.status === "absent").length;
});

// Static method to get student attendance summary
attendanceSchema.statics.getStudentSummary = async function (studentId, filters = {}) {
  const match = { "records.student": new mongoose.Types.ObjectId(studentId) };
  if (filters.subject) match.subject = new mongoose.Types.ObjectId(filters.subject);
  if (filters.startDate && filters.endDate) {
    match.date = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
  }

  const result = await this.aggregate([
    { $match: match },
    { $unwind: "$records" },
    { $match: { "records.student": new mongoose.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: "$subject",
        totalClasses: { $sum: 1 },
        present: {
          $sum: { $cond: [{ $in: ["$records.status", ["present", "late"]] }, 1, 0] },
        },
        absent: {
          $sum: { $cond: [{ $eq: ["$records.status", "absent"] }, 1, 0] },
        },
        excused: {
          $sum: { $cond: [{ $eq: ["$records.status", "excused"] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "subjects",
        localField: "_id",
        foreignField: "_id",
        as: "subject",
      },
    },
    { $unwind: "$subject" },
    {
      $project: {
        subject: "$subject.name",
        subjectCode: "$subject.code",
        totalClasses: 1,
        present: 1,
        absent: 1,
        excused: 1,
        percentage: {
          $multiply: [{ $divide: ["$present", "$totalClasses"] }, 100],
        },
      },
    },
  ]);

  return result;
};

attendanceSchema.plugin(mongoosePaginate);

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
