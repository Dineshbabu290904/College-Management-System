const crypto = require("crypto");
const User = require("../models/User.model");
const ActivityLog = require("../models/ActivityLog.model");
const emailService = require("../services/email.service");
const { generateTokens } = require("../middlewares/auth.middleware");
const { asyncHandler, ApiError } = require("../middlewares/errorHandler.middleware");
const logger = require("../utils/logger");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public / Admin
const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role, ...rest } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    ...rest,
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });
  await user.save({ validateBeforeSave: false });

  // Send welcome email
  await emailService.sendWelcomeEmail(user);

  // Log activity
  await ActivityLog.logActivity({
    user: user._id,
    action: "create",
    entity: { type: "User", id: user._id, name: user.fullName },
    description: `New ${role} account created`,
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  // Remove sensitive data
  user.password = undefined;
  user.refreshTokens = undefined;

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check if account is locked
  if (user.isLocked()) {
    const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw new ApiError(423, `Account is locked. Try again in ${lockTime} minutes`);
  }

  // Check if account is active
  if (!user.isActive) {
    throw new ApiError(401, "Account is deactivated. Please contact admin");
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    await user.incLoginAttempts();
    throw new ApiError(401, "Invalid email or password");
  }

  // Reset login attempts on successful login
  await User.updateOne(
    { _id: user._id },
    { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } }
  );

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token (keep max 5 sessions)
  if (user.refreshTokens.length >= 5) {
    user.refreshTokens.shift();
  }
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Log activity
  await ActivityLog.logActivity({
    user: user._id,
    action: "login",
    entity: { type: "User", id: user._id, name: user.fullName },
    description: "User logged in",
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  // Remove sensitive data
  user.password = undefined;
  user.refreshTokens = undefined;

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  // Remove refresh token
  await User.updateOne(
    { _id: req.user._id },
    { $pull: { refreshTokens: { token: refreshToken } } }
  );

  // Log activity
  await ActivityLog.logActivity({
    user: req.user._id,
    action: "logout",
    entity: { type: "User", id: req.user._id, name: req.user.fullName },
    description: "User logged out",
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
const logoutAll = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $set: { refreshTokens: [] } });

  await ActivityLog.logActivity({
    user: req.user._id,
    action: "logout",
    entity: { type: "User", id: req.user._id, name: req.user.fullName },
    description: "User logged out from all devices",
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  res.status(200).json({
    success: true,
    message: "Logged out from all devices",
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshAccessToken = asyncHandler(async (req, res) => {
  const user = req.user; // Set by verifyRefreshToken middleware

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

  // Replace old refresh token with new one
  await User.updateOne(
    { _id: user._id, "refreshTokens.token": req.refreshToken },
    {
      $set: {
        "refreshTokens.$.token": newRefreshToken,
        "refreshTokens.$.createdAt": new Date(),
        "refreshTokens.$.expiresAt": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }
  );

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("branch", "name code")
    .populate("department", "name code")
    .populate("subjects", "name code");

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "middleName",
    "phoneNumber",
    "dateOfBirth",
    "gender",
    "address",
    "preferences",
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  await ActivityLog.logActivity({
    user: req.user._id,
    action: "profile_update",
    entity: { type: "User", id: req.user._id, name: user.fullName },
    description: "Profile updated",
    changes: { after: updates },
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  user.refreshTokens = []; // Invalidate all sessions
  await user.save();

  // Generate new tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save new refresh token
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });
  await user.save({ validateBeforeSave: false });

  await ActivityLog.logActivity({
    user: req.user._id,
    action: "password_change",
    entity: { type: "User", id: req.user._id, name: user.fullName },
    description: "Password changed",
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
    data: { accessToken, refreshToken },
  });
});

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists
    return res.status(200).json({
      success: true,
      message: "If an account exists, a reset link has been sent",
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  // Send reset email
  await emailService.sendPasswordResetEmail(user, resetToken);

  await ActivityLog.logActivity({
    user: user._id,
    action: "password_reset",
    entity: { type: "User", id: user._id, name: user.fullName },
    description: "Password reset requested",
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  res.status(200).json({
    success: true,
    message: "If an account exists, a reset link has been sent",
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  // Update password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // Invalidate all sessions
  await user.save();

  await ActivityLog.logActivity({
    user: user._id,
    action: "password_reset",
    entity: { type: "User", id: user._id, name: user.fullName },
    description: "Password reset completed",
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  res.status(200).json({
    success: true,
    message: "Password reset successful. Please login with your new password.",
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  refreshAccessToken,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
