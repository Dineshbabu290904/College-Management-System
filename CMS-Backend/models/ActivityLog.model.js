const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout",
        "password_change",
        "password_reset",
        "profile_update",
        "create",
        "read",
        "update",
        "delete",
        "upload",
        "download",
        "export",
        "import",
        "approve",
        "reject",
        "submit",
        "grade",
        "attendance_mark",
        "fee_payment",
        "email_sent",
        "notification_sent",
        "system_config",
      ],
    },
    entity: {
      type: {
        type: String,
        enum: [
          "User",
          "Student",
          "Faculty",
          "Admin",
          "Assignment",
          "Attendance",
          "Exam",
          "Result",
          "Fee",
          "Leave",
          "Material",
          "Notice",
          "Timetable",
          "Subject",
          "Branch",
          "Department",
          "Course",
          "Book",
          "Notification",
          "System",
        ],
      },
      id: mongoose.Schema.Types.ObjectId,
      name: String,
    },
    description: {
      type: String,
      required: true,
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      browser: String,
      os: String,
      device: String,
      location: {
        country: String,
        city: String,
      },
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "success",
    },
    errorMessage: String,
    duration: Number, // in milliseconds
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ "entity.type": 1, "entity.id": 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ status: 1 });

// TTL index to auto-delete logs older than 90 days (optional)
// activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Static method to log activity
activityLogSchema.statics.logActivity = async function (data) {
  try {
    return await this.create(data);
  } catch (error) {
    console.error("Failed to log activity:", error);
    return null;
  }
};

// Static method to get user activity summary
activityLogSchema.statics.getUserActivitySummary = async function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
        lastActivity: { $max: "$createdAt" },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

// Static method to get system activity stats
activityLogSchema.statics.getSystemStats = async function (days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          action: "$action",
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.date",
        actions: {
          $push: {
            action: "$_id.action",
            count: "$count",
          },
        },
        total: { $sum: "$count" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
};

activityLogSchema.plugin(mongoosePaginate);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;
