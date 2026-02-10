const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

// Book Schema
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },
    author: [{
      type: String,
      required: true,
    }],
    isbn: {
      type: String,
      unique: true,
      sparse: true,
    },
    publisher: String,
    publishYear: Number,
    edition: String,
    category: {
      type: String,
      enum: [
        "textbook",
        "reference",
        "fiction",
        "non_fiction",
        "journal",
        "magazine",
        "thesis",
        "project",
      ],
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    description: String,
    coverImage: String,
    totalCopies: {
      type: Number,
      required: true,
      min: 1,
    },
    availableCopies: {
      type: Number,
      default: function() {
        return this.totalCopies;
      },
    },
    location: {
      shelf: String,
      row: String,
      section: String,
    },
    price: Number,
    tags: [String],
    language: {
      type: String,
      default: "English",
    },
    pages: Number,
    isReferenceOnly: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["available", "low_stock", "out_of_stock", "removed"],
      default: "available",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Book Issue Schema
const bookIssueSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrowerType: {
      type: String,
      enum: ["student", "faculty", "staff"],
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: Date,
    status: {
      type: String,
      enum: ["issued", "returned", "overdue", "lost", "renewed"],
      default: "issued",
    },
    renewCount: {
      type: Number,
      default: 0,
    },
    maxRenewals: {
      type: Number,
      default: 2,
    },
    fine: {
      amount: { type: Number, default: 0 },
      paid: { type: Boolean, default: false },
      paidAt: Date,
      reason: String,
    },
    remarks: String,
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    returnedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Book Request Schema
const bookRequestSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "fulfilled", "cancelled"],
      default: "pending",
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: Date,
    remarks: String,
    notifyWhenAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookSchema.index({ title: "text", author: "text", isbn: "text" });
bookSchema.index({ category: 1, status: 1 });
bookSchema.index({ department: 1, subject: 1 });
bookIssueSchema.index({ borrower: 1, status: 1 });
bookIssueSchema.index({ book: 1, status: 1 });
bookIssueSchema.index({ dueDate: 1, status: 1 });
bookRequestSchema.index({ requestedBy: 1, status: 1 });

// Update book status based on availability
bookSchema.pre("save", function () {
  if (this.availableCopies === 0) {
    this.status = "out_of_stock";
  } else if (this.availableCopies <= 2) {
    this.status = "low_stock";
  } else {
    this.status = "available";
  }
});

// Calculate fine for overdue books
bookIssueSchema.methods.calculateFine = function (finePerDay = 5) {
  if (this.status === "returned" || !this.dueDate) return 0;

  const today = new Date();
  const dueDate = new Date(this.dueDate);

  if (today <= dueDate) return 0;

  const diffTime = Math.abs(today - dueDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays * finePerDay;
};

bookSchema.plugin(mongoosePaginate);
bookIssueSchema.plugin(mongoosePaginate);
bookRequestSchema.plugin(mongoosePaginate);

const Book = mongoose.model("Book", bookSchema);
const BookIssue = mongoose.model("BookIssue", bookIssueSchema);
const BookRequest = mongoose.model("BookRequest", bookRequestSchema);

module.exports = { Book, BookIssue, BookRequest };
