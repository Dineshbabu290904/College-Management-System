const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Branch code is required"],
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
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    totalSemesters: {
      type: Number,
      default: 8,
      min: 1,
      max: 12,
    },
    totalSeats: {
      type: Number,
      default: 60,
    },
    sections: [{
      name: String,
      capacity: Number,
      classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    }],
    fees: {
      tuitionPerSemester: Number,
      labFee: Number,
      otherCharges: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    establishedYear: Number,
  },
  {
    timestamps: true,
  }
);

// Indexes
branchSchema.index({ code: 1 });
branchSchema.index({ department: 1, isActive: 1 });

branchSchema.plugin(mongoosePaginate);

const Branch = mongoose.model("Branch", branchSchema);

module.exports = Branch;
