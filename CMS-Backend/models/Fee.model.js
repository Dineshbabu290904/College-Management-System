const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

// Fee Structure Schema
const feeStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    semester: Number,
    category: {
      type: String,
      enum: ["tuition", "exam", "library", "lab", "hostel", "transport", "miscellaneous"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: Date,
    lateFee: {
      type: Number,
      default: 0,
    },
    lateFeePerDay: {
      type: Number,
      default: 0,
    },
    isOptional: {
      type: Boolean,
      default: false,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Fee Payment Schema
const feePaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    feeStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    semester: Number,
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    lateFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    scholarship: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "cheque", "online", "card", "upi", "bank_transfer", "scholarship"],
    },
    transactionId: String,
    transactionDate: Date,
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue", "waived", "refunded"],
      default: "pending",
    },
    paymentHistory: [{
      amount: Number,
      method: String,
      transactionId: String,
      paidAt: { type: Date, default: Date.now },
      receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      remarks: String,
    }],
    remarks: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    refundDetails: {
      amount: Number,
      reason: String,
      refundedAt: Date,
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
feeStructureSchema.index({ academicYear: 1, branch: 1, category: 1 });
feePaymentSchema.index({ student: 1, academicYear: 1 });
feePaymentSchema.index({ status: 1 });
feePaymentSchema.index({ receiptNumber: 1 });

// Calculate due amount before saving
feePaymentSchema.pre("save", function (next) {
  this.totalAmount = this.amount + this.lateFee - this.discount - this.scholarship;
  this.dueAmount = this.totalAmount - this.paidAmount;

  if (this.dueAmount <= 0) {
    this.status = "paid";
    this.dueAmount = 0;
  } else if (this.paidAmount > 0) {
    this.status = "partial";
  }

  next();
});

// Generate receipt number
feePaymentSchema.pre("save", async function (next) {
  if (this.isNew && this.status === "paid") {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      receiptNumber: { $regex: `^RCP${year}` },
    });
    this.receiptNumber = `RCP${year}${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

// Static method to get student fee summary
feePaymentSchema.statics.getStudentFeeSummary = async function (studentId, academicYear) {
  const result = await this.aggregate([
    {
      $match: {
        student: new mongoose.Types.ObjectId(studentId),
        academicYear,
      },
    },
    {
      $group: {
        _id: "$status",
        total: { $sum: "$totalAmount" },
        paid: { $sum: "$paidAmount" },
        due: { $sum: "$dueAmount" },
        count: { $sum: 1 },
      },
    },
  ]);

  return result;
};

const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);
const FeePayment = mongoose.model("FeePayment", feePaymentSchema);

feeStructureSchema.plugin(mongoosePaginate);
feePaymentSchema.plugin(mongoosePaginate);

module.exports = { FeeStructure, FeePayment };
