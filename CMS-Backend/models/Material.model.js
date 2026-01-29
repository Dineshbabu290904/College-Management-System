const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Material title is required"],
      trim: true,
      maxlength: 200,
    },
    description: String,
    type: {
      type: String,
      enum: ["notes", "slides", "video", "document", "link", "assignment", "question_paper", "other"],
      default: "notes",
    },
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
    },
    semester: Number,
    unit: Number,
    topic: String,
    files: [{
      fileName: {
        type: String,
        required: true,
      },
      fileUrl: {
        type: String,
        required: true,
      },
      fileType: String,
      fileSize: Number,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    externalLinks: [{
      title: String,
      url: String,
      description: String,
    }],
    visibility: {
      type: String,
      enum: ["all", "branch", "section", "selected"],
      default: "all",
    },
    selectedStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    tags: [String],
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    viewedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      viewedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    downloadedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      downloadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    academicYear: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
materialSchema.index({ subject: 1, type: 1 });
materialSchema.index({ faculty: 1, status: 1 });
materialSchema.index({ branch: 1, semester: 1 });
materialSchema.index({ tags: 1 });
materialSchema.index({ "$**": "text" }); // Full text search

// Record view
materialSchema.methods.recordView = async function (userId) {
  const alreadyViewed = this.viewedBy.some(v => v.user.toString() === userId.toString());
  if (!alreadyViewed) {
    this.viewedBy.push({ user: userId });
    this.views += 1;
    await this.save();
  }
};

// Record download
materialSchema.methods.recordDownload = async function (userId) {
  this.downloadedBy.push({ user: userId });
  this.downloads += 1;
  await this.save();
};

materialSchema.plugin(mongoosePaginate);

const Material = mongoose.model("Material", materialSchema);

module.exports = Material;
