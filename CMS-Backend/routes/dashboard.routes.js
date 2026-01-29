const express = require("express");
const router = express.Router();
const {
  getStudentDashboard,
  getFacultyDashboard,
  getAdminDashboard,
  getAnalytics,
} = require("../controllers/dashboard.controller");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(verifyToken);

// Role-specific dashboards
router.get("/student", authorize("student"), getStudentDashboard);
router.get("/faculty", authorize("faculty"), getFacultyDashboard);
router.get("/admin", authorize("admin", "superadmin"), getAdminDashboard);

// Analytics (admin only)
router.get("/analytics", authorize("admin", "superadmin"), getAnalytics);

module.exports = router;
