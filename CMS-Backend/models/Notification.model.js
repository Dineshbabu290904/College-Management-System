const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
    },
    type: {
      type: String,
      enum: [
        "announcement",
        "assignment",
        "attendance",
        "exam",
        "result",
        "fee",
        "leave",
        "event",
        "timetable",
        "material",
        "message",
        "system",
        "reminder",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    recipients: {
      type: {
        type: String,
        enum: ["all", "role", "branch", "semester", "section", "individual", "custom"],
        required: true,
      },
      roles: [{
        type: String,
        enum: ["student", "faculty", "admin"],
      }],
      branches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
      }],
      semesters: [Number],
      sections: [String],
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }],
    },
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    }],
    link: {
      type: String,
    },
    linkType: {
      type: String,
      enum: ["internal", "external"],
    },
    reference: {
      model: {
        type: String,
        enum: ["Assignment", "Exam", "Leave", "Fee", "Notice", "Material", "Attendance"],
      },
      id: mongoose.Schema.Types.ObjectId,
    },
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileType: String,
    }],
    scheduledFor: Date,
    expiresAt: Date,
    status: {
      type: String,
      enum: ["draft", "scheduled", "sent", "cancelled"],
      default: "sent",
    },
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    smsSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ "recipients.users": 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });
notificationSchema.index({ "readBy.user": 1 });

// Check if user has read notification
notificationSchema.methods.isReadBy = function (userId) {
  return this.readBy.some(r => r.user.toString() === userId.toString());
};

// Mark as read
notificationSchema.methods.markAsRead = async function (userId) {
  if (!this.isReadBy(userId)) {
    this.readBy.push({ user: userId, readAt: new Date() });
    await this.save();
  }
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function (userId, role) {
  const query = {
    status: "sent",
    $or: [
      { "recipients.type": "all" },
      { "recipients.users": userId },
      { "recipients.roles": role },
    ],
    "readBy.user": { $ne: userId },
  };

  return await this.countDocuments(query);
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = async function (userId, role, options = {}) {
  const { page = 1, limit = 20, unreadOnly = false } = options;

  const query = {
    status: "sent",
    $or: [
      { "recipients.type": "all" },
      { "recipients.users": userId },
      { "recipients.roles": role },
    ],
  };

  if (unreadOnly) {
    query["readBy.user"] = { $ne: userId };
  }

  return await this.paginate(query, {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: { path: "sender", select: "firstName lastName role profileImage" },
  });
};

notificationSchema.plugin(mongoosePaginate);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
