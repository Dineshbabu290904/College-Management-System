const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema(
  {
    // Authentication
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin", "superadmin"],
      required: true,
    },

    // Personal Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: 50,
    },
    middleName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    phoneNumber: {
      type: String,
      match: [/^\+?[\d\s-]{10,15}$/, "Please enter a valid phone number"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "India" },
    },

    // Profile
    profileImage: {
      url: String,
      publicId: String,
    },

    // Role-specific IDs
    enrollmentNo: {
      type: String,
      sparse: true,
      unique: true,
    },
    employeeId: {
      type: String,
      sparse: true,
      unique: true,
    },

    // Student specific
    semester: {
      type: Number,
      min: 1,
      max: 8,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    section: String,
    admissionYear: Number,
    batch: String,
    guardianName: String,
    guardianPhone: String,
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    // Faculty specific
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    designation: String,
    experience: Number,
    qualification: String,
    specialization: String,
    subjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    }],

    // Status and Security
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    refreshTokens: [{
      token: String,
      createdAt: { type: Date, default: Date.now },
      expiresAt: Date,
      userAgent: String,
      ipAddress: String,
    }],

    // Preferences
    preferences: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
      language: { type: String, default: "en" },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  const middle = this.middleName ? ` ${this.middleName}` : "";
  return `${this.firstName}${middle} ${this.lastName}`;
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ enrollmentNo: 1 }, { sparse: true });
userSchema.index({ employeeId: 1 }, { sparse: true });
userSchema.index({ branch: 1, semester: 1 });
userSchema.index({ department: 1 });

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function () {
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

  if (this.lockUntil && this.lockUntil < Date.now()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
    return;
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  await this.updateOne(updates);
};

// Add pagination plugin
userSchema.plugin(mongoosePaginate);

const User = mongoose.model("User", userSchema);

module.exports = User;
