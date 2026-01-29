const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, "Department code is required"],
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
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    vision: String,
    mission: String,
    facilities: [String],
    contactEmail: String,
    contactPhone: String,
    location: {
      building: String,
      floor: String,
      room: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    establishedYear: Number,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for branches count
departmentSchema.virtual("branchesCount", {
  ref: "Branch",
  localField: "_id",
  foreignField: "department",
  count: true,
});

// Virtual for faculty count
departmentSchema.virtual("facultyCount", {
  ref: "User",
  localField: "_id",
  foreignField: "department",
  count: true,
  match: { role: "faculty", isActive: true },
});

departmentSchema.plugin(mongoosePaginate);

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
