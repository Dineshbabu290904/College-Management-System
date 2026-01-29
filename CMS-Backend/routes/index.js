const express = require("express");
const router = express.Router();

// Import all route modules
const authRoutes = require("./auth.routes");
const dashboardRoutes = require("./dashboard.routes");
const attendanceRoutes = require("./attendance.routes");
const assignmentRoutes = require("./assignment.routes");

// Legacy route imports (maintaining backward compatibility)
const studentCredentialRoutes = require("./Student Api/credential.route");
const studentDetailsRoutes = require("./Student Api/details.route");
const facultyCredentialRoutes = require("./Faculty Api/credential.route");
const facultyDetailsRoutes = require("./Faculty Api/details.route");
const adminCredentialRoutes = require("./Admin Api/credential.route");
const adminDetailsRoutes = require("./Admin Api/details.route");
const timetableRoutes = require("./Other Api/timetable.route");
const materialRoutes = require("./Other Api/material.route");
const noticeRoutes = require("./Other Api/notice.route");
const subjectRoutes = require("./Other Api/subject.route");
const marksRoutes = require("./Other Api/marks.route");
const branchRoutes = require("./Other Api/branch.route");

// New API v2 routes
router.use("/v2/auth", authRoutes);
router.use("/v2/dashboard", dashboardRoutes);
router.use("/v2/attendance", attendanceRoutes);
router.use("/v2/assignments", assignmentRoutes);

// Legacy API v1 routes (for backward compatibility)
router.use("/student/auth", studentCredentialRoutes);
router.use("/student/details", studentDetailsRoutes);
router.use("/faculty/auth", facultyCredentialRoutes);
router.use("/faculty/details", facultyDetailsRoutes);
router.use("/admin/auth", adminCredentialRoutes);
router.use("/admin/details", adminDetailsRoutes);
router.use("/timetable", timetableRoutes);
router.use("/material", materialRoutes);
router.use("/notice", noticeRoutes);
router.use("/subject", subjectRoutes);
router.use("/marks", marksRoutes);
router.use("/branch", branchRoutes);

module.exports = router;
