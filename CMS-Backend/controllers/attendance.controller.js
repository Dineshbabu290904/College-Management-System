const Attendance = require("../models/Attendance.model");
const User = require("../models/User.model");
const ActivityLog = require("../models/ActivityLog.model");
const emailService = require("../services/email.service");
const { asyncHandler, ApiError } = require("../middlewares/errorHandler.middleware");

// @desc    Mark attendance for a class
// @route   POST /api/attendance/mark
// @access  Faculty
const markAttendance = asyncHandler(async (req, res) => {
  const { subject, branch, semester, section, date, period, sessionType, records } = req.body;

  // Check if attendance already exists for this class/date
  const existingAttendance = await Attendance.findOne({
    subject,
    branch,
    semester,
    section,
    date: new Date(date),
  });

  if (existingAttendance && !existingAttendance.isLocked) {
    // Update existing attendance
    existingAttendance.records = records;
    existingAttendance.period = period;
    existingAttendance.sessionType = sessionType;
    await existingAttendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: existingAttendance,
    });
  }

  if (existingAttendance && existingAttendance.isLocked) {
    throw new ApiError(400, "Attendance for this date is locked and cannot be modified");
  }

  // Create new attendance
  const attendance = await Attendance.create({
    subject,
    faculty: req.user._id,
    branch,
    semester,
    section,
    date: new Date(date),
    period,
    sessionType,
    records,
    academicYear: getAcademicYear(),
  });

  // Check for low attendance and send alerts
  await checkAndSendAttendanceAlerts(subject, semester, branch);

  await ActivityLog.logActivity({
    user: req.user._id,
    action: "attendance_mark",
    entity: { type: "Attendance", id: attendance._id },
    description: `Attendance marked for ${records.length} students`,
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  res.status(201).json({
    success: true,
    message: "Attendance marked successfully",
    data: attendance,
  });
});

// @desc    Get attendance for a class
// @route   GET /api/attendance/class
// @access  Faculty, Admin
const getClassAttendance = asyncHandler(async (req, res) => {
  const { subject, branch, semester, section, startDate, endDate } = req.query;

  const query = {};
  if (subject) query.subject = subject;
  if (branch) query.branch = branch;
  if (semester) query.semester = parseInt(semester);
  if (section) query.section = section;
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const attendance = await Attendance.find(query)
    .populate("subject", "name code")
    .populate("faculty", "firstName lastName")
    .populate("records.student", "firstName lastName enrollmentNo")
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance,
  });
});

// @desc    Get student attendance summary
// @route   GET /api/attendance/student/:studentId
// @access  Student (own), Faculty, Admin
const getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { subject, startDate, endDate } = req.query;

  // Check authorization
  if (req.user.role === "student" && req.user._id.toString() !== studentId) {
    throw new ApiError(403, "You can only view your own attendance");
  }

  const filters = {};
  if (subject) filters.subject = subject;
  if (startDate && endDate) {
    filters.startDate = startDate;
    filters.endDate = endDate;
  }

  const summary = await Attendance.getStudentSummary(studentId, filters);

  // Calculate overall percentage
  const overall = summary.reduce(
    (acc, s) => ({
      totalClasses: acc.totalClasses + s.totalClasses,
      present: acc.present + s.present,
    }),
    { totalClasses: 0, present: 0 }
  );

  overall.percentage = overall.totalClasses > 0
    ? ((overall.present / overall.totalClasses) * 100).toFixed(2)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      subjects: summary,
      overall,
    },
  });
});

// @desc    Get attendance report
// @route   GET /api/attendance/report
// @access  Faculty, Admin
const getAttendanceReport = asyncHandler(async (req, res) => {
  const { branch, semester, section, subject, month, year } = req.query;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const query = {
    date: { $gte: startDate, $lte: endDate },
  };
  if (branch) query.branch = branch;
  if (semester) query.semester = parseInt(semester);
  if (section) query.section = section;
  if (subject) query.subject = subject;

  // Get all students
  const studentQuery = { role: "student", isActive: true };
  if (branch) studentQuery.branch = branch;
  if (semester) studentQuery.semester = parseInt(semester);
  if (section) studentQuery.section = section;

  const students = await User.find(studentQuery).select("firstName lastName enrollmentNo");

  // Get attendance records
  const attendanceRecords = await Attendance.find(query);

  // Build report
  const report = students.map((student) => {
    let totalClasses = 0;
    let present = 0;
    let absent = 0;
    let late = 0;

    attendanceRecords.forEach((att) => {
      const record = att.records.find(
        (r) => r.student.toString() === student._id.toString()
      );
      if (record) {
        totalClasses++;
        if (record.status === "present") present++;
        else if (record.status === "absent") absent++;
        else if (record.status === "late") {
          present++;
          late++;
        }
      }
    });

    return {
      student: {
        _id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        enrollmentNo: student.enrollmentNo,
      },
      totalClasses,
      present,
      absent,
      late,
      percentage: totalClasses > 0 ? ((present / totalClasses) * 100).toFixed(2) : 0,
    };
  });

  // Sort by percentage (ascending to show defaulters first)
  report.sort((a, b) => a.percentage - b.percentage);

  res.status(200).json({
    success: true,
    data: {
      period: { month, year },
      report,
      defaulters: report.filter((r) => r.percentage < 75),
    },
  });
});

// @desc    Lock attendance
// @route   PUT /api/attendance/:id/lock
// @access  Admin
const lockAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findByIdAndUpdate(
    req.params.id,
    { isLocked: true },
    { new: true }
  );

  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  res.status(200).json({
    success: true,
    message: "Attendance locked successfully",
    data: attendance,
  });
});

// @desc    Get defaulters list
// @route   GET /api/attendance/defaulters
// @access  Faculty, Admin
const getDefaulters = asyncHandler(async (req, res) => {
  const { branch, semester, subject, threshold = 75 } = req.query;

  const studentQuery = { role: "student", isActive: true };
  if (branch) studentQuery.branch = branch;
  if (semester) studentQuery.semester = parseInt(semester);

  const students = await User.find(studentQuery).select("firstName lastName enrollmentNo email");

  const defaulters = [];

  for (const student of students) {
    const summary = await Attendance.getStudentSummary(student._id, { subject });

    for (const sub of summary) {
      if (sub.percentage < threshold) {
        defaulters.push({
          student: {
            _id: student._id,
            name: `${student.firstName} ${student.lastName}`,
            enrollmentNo: student.enrollmentNo,
            email: student.email,
          },
          subject: sub.subject,
          subjectCode: sub.subjectCode,
          totalClasses: sub.totalClasses,
          present: sub.present,
          percentage: sub.percentage.toFixed(2),
          shortfall: Math.ceil((threshold * sub.totalClasses / 100) - sub.present),
        });
      }
    }
  }

  res.status(200).json({
    success: true,
    count: defaulters.length,
    data: defaulters,
  });
});

// Helper functions
function getAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

async function checkAndSendAttendanceAlerts(subject, semester, branch) {
  const students = await User.find({
    role: "student",
    semester,
    branch,
    isActive: true,
  });

  for (const student of students) {
    const summary = await Attendance.getStudentSummary(student._id, { subject });
    const subjectSummary = summary[0];

    if (subjectSummary && subjectSummary.percentage < 75) {
      // Send alert email
      await emailService.sendAttendanceAlert(
        student,
        subjectSummary.subject,
        subjectSummary.percentage
      );
    }
  }
}

module.exports = {
  markAttendance,
  getClassAttendance,
  getStudentAttendance,
  getAttendanceReport,
  lockAttendance,
  getDefaulters,
};
