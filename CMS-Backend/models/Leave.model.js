const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const leaveSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicantType: {
      type: String,
      enum: ["student", "faculty"],
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["sick", "casual", "medical", "emergency", "academic", "personal", "maternity", "paternity", "study"],
      required: true,
    },
    reason: {
      type: String,
      required: [true, "Leave reason is required"],
      maxlength: 500,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    totalDays: {
      type: Number,
      default: 1,
    },
    isHalfDay: {
      type: Boolean,
      default: false,
    },
    halfDayType: {
      type: String,
      enum: ["first_half", "second_half"],
    },
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileType: String,
    }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "forwarded"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    rejectionReason: String,
    forwardedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    alternateContact: {
      name: String,
      phone: String,
      email: String,
    },
    classesCovered: [{
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
      coveredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      date: Date,
    }],
    academicYear: String,
  },
  {
    timestamps: true,
  }
);

// Calculate total days before saving
leaveSchema.pre("save", function (next) {
  if (this.isHalfDay) {
    this.totalDays = 0.5;
  } else {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

// Indexes
leaveSchema.index({ applicant: 1, status: 1 });
leaveSchema.index({ applicantType: 1, status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ approvedBy: 1 });

// Static method to get leave balance
leaveSchema.statics.getLeaveBalance = async function (userId, academicYear) {
  const leaveTypes = {
    sick: 12,
    casual: 8,
    medical: 15,
    academic: 10,
    personal: 5,
  };

  const usedLeaves = await this.aggregate([
    {
      $match: {
        applicant: new mongoose.Types.ObjectId(userId),
        status: "approved",
        academicYear,
      },
    },
    {
      $group: {
        _id: "$leaveType",
        totalDays: { $sum: "$totalDays" },
      },
    },
  ]);

  const balance = {};
  for (const [type, total] of Object.entries(leaveTypes)) {
    const used = usedLeaves.find(l => l._id === type);
    balance[type] = {
      total,
      used: used ? used.totalDays : 0,
      remaining: total - (used ? used.totalDays : 0),
    };
  }

  return balance;
};

leaveSchema.plugin(mongoosePaginate);

const Leave = mongoose.model("Leave", leaveSchema);

module.exports = Leave;
