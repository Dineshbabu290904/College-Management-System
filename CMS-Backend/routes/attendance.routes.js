const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getClassAttendance,
  getStudentAttendance,
  getAttendanceReport,
  lockAttendance,
  getDefaulters,
} = require("../controllers/attendance.controller");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");
const { validationRules, validate } = require("../middlewares/validate.middleware");

// All routes require authentication
router.use(verifyToken);

// Faculty routes
router.post("/mark", authorize("faculty", "admin"), validationRules.markAttendance, validate, markAttendance);
router.get("/class", authorize("faculty", "admin"), getClassAttendance);
router.get("/report", authorize("faculty", "admin"), getAttendanceReport);
router.get("/defaulters", authorize("faculty", "admin"), getDefaulters);

// Admin only
router.put("/:id/lock", authorize("admin"), lockAttendance);

// Student can view own attendance
router.get("/student/:studentId", getStudentAttendance);

module.exports = router;
