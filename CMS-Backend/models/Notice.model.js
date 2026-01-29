const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice title is required"],
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      required: [true, "Notice description is required"],
    },
    type: {
      type: String,
      enum: [
        "general",
        "academic",
        "exam",
        "event",
        "holiday",
        "placement",
        "sports",
        "cultural",
        "emergency",
        "maintenance",
      ],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetAudience: {
      type: {
        type: String,
        enum: ["all", "students", "faculty", "staff", "branch", "semester", "department"],
        default: "all",
      },
      branches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
      }],
      semesters: [Number],
      departments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      }],
    },
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number,
    }],
    eventDetails: {
      date: Date,
      time: String,
      venue: String,
      registrationLink: String,
      registrationDeadline: Date,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: Date,
    isPinned: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    views: {
      type: Number,
      default: 0,
    },
    acknowledgements: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      acknowledgedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    requiresAcknowledgement: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
noticeSchema.index({ type: 1, status: 1, publishDate: -1 });
noticeSchema.index({ isPinned: -1, publishDate: -1 });
noticeSchema.index({ "targetAudience.type": 1 });
noticeSchema.index({ expiryDate: 1 });
noticeSchema.index({ "$**": "text" }); // Full text search

// Check if notice is expired
noticeSchema.virtual("isExpired").get(function () {
  return this.expiryDate && this.expiryDate < new Date();
});

// Static method to get active notices
noticeSchema.statics.getActiveNotices = async function (filters = {}) {
  const query = {
    status: "published",
    $or: [
      { expiryDate: { $gte: new Date() } },
      { expiryDate: null },
    ],
  };

  if (filters.type) query.type = filters.type;
  if (filters.priority) query.priority = filters.priority;

  return this.find(query)
    .sort({ isPinned: -1, priority: -1, publishDate: -1 })
    .populate("createdBy", "firstName lastName role");
};

noticeSchema.plugin(mongoosePaginate);

const NoticeV2 = mongoose.model("NoticeV2", noticeSchema);

module.exports = NoticeV2;
