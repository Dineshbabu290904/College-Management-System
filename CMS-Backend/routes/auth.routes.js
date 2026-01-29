const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/auth.controller");
const { verifyToken, verifyRefreshToken, authorize } = require("../middlewares/auth.middleware");
const { authLimiter, passwordResetLimiter } = require("../middlewares/rateLimiter.middleware");
const { validationRules, validate } = require("../middlewares/validate.middleware");

// Public routes
router.post("/register", validationRules.register, validate, register);
router.post("/login", authLimiter, validationRules.login, validate, login);
router.post("/refresh-token", verifyRefreshToken, refreshAccessToken);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-email/:token", verifyEmail);

// Protected routes
router.use(verifyToken);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);
router.get("/me", getMe);
router.put("/profile", validationRules.updateProfile, validate, updateProfile);
router.put("/change-password", validationRules.changePassword, validate, changePassword);

module.exports = router;
