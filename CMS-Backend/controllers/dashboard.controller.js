const User = require("../models/User.model");
const Attendance = require("../models/Attendance.model");
const Assignment = require("../models/Assignment.model");
const Notice = require("../models/Notice.model");
const { Exam, ExamResult } = require("../models/Exam.model");
const { FeePayment } = require("../models/Fee.model");
const Leave = require("../models/Leave.model");
const Branch = require("../models/Branch.model");
const Subject = require("../models/Subject.model");
const { asyncHandler } = require("../middlewares/errorHandler.middleware");

// @desc    Get student dashboard data
// @route   GET /api/dashboard/student
// @access  Student
const getStudentDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Get attendance summary
  const attendanceSummary = await Attendance.getStudentSummary(studentId);
  const overallAttendance = attendanceSummary.reduce(
    (acc, s) => ({
      totalClasses: acc.totalClasses + s.totalClasses,
      present: acc.present + s.present,
    }),
    { totalClasses: 0, present: 0 }
  );
  overallAttendance.percentage = overallAttendance.totalClasses > 0
    ? ((overallAttendance.present / overallAttendance.totalClasses) * 100).toFixed(2)
    : 0;

  // Get pending assignments
  const pendingAssignments = await Assignment.find({
    branch: req.user.branch,
    semester: req.user.semester,
    status: "published",
    dueDate: { $gte: new Date() },
    "submissions.student": { $ne: studentId },
  })
    .populate("subject", "name code")
    .limit(5)
    .sort({ dueDate: 1 });

  // Get recent results
  const recentResults = await ExamResult.find({ student: studentId })
    .populate({
      path: "exam",
      select: "name examType maxMarks",
      populate: { path: "subject", select: "name code" },
    })
    .sort({ createdAt: -1 })
    .limit(5);

  // Get fee status
  const feeStatus = await FeePayment.aggregate([
    { $match: { student: studentId } },
    {
      $group: {
        _id: "$status",
        total: { $sum: "$totalAmount" },
        paid: { $sum: "$paidAmount" },
        due: { $sum: "$dueAmount" },
      },
    },
  ]);

  // Get recent notices
  const recentNotices = await Notice.find({
    status: "published",
    $or: [
      { "targetAudience.type": "all" },
      { "targetAudience.type": "students" },
      { "targetAudience.branches": req.user.branch },
    ],
  })
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(5);

  // Get leave balance
  const leaveBalance = await Leave.getLeaveBalance(studentId, getAcademicYear());

  // Calculate CGPA from results
  const allResults = await ExamResult.find({ student: studentId, status: "published" })
    .populate("exam", "subject");

  let totalCredits = 0;
  let totalGradePoints = 0;
  const subjectGrades = {};

  for (const result of allResults) {
    if (result.gradePoints !== undefined) {
      const subject = await Subject.findById(result.exam.subject);
      if (subject && !subjectGrades[subject._id]) {
        subjectGrades[subject._id] = {
          gradePoints: result.gradePoints,
          credits: subject.credits,
        };
        totalCredits += subject.credits;
        totalGradePoints += result.gradePoints * subject.credits;
      }
    }
  }

  const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

  res.status(200).json({
    success: true,
    data: {
      attendance: {
        subjects: attendanceSummary,
        overall: overallAttendance,
      },
      pendingAssignments,
      recentResults,
      feeStatus,
      recentNotices,
      leaveBalance,
      cgpa,
      quickStats: {
        totalSubjects: attendanceSummary.length,
        pendingAssignmentsCount: pendingAssignments.length,
        attendancePercentage: overallAttendance.percentage,
      },
    },
  });
});

// @desc    Get faculty dashboard data
// @route   GET /api/dashboard/faculty
// @access  Faculty
const getFacultyDashboard = asyncHandler(async (req, res) => {
  const facultyId = req.user._id;

  // Get subjects assigned
  const subjects = await Subject.find({ faculty: facultyId }).select("name code branch semester");

  // Get today's classes (from timetable)
  const today = new Date();
  const dayOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][today.getDay()];

  // Get recent attendance marked
  const recentAttendance = await Attendance.find({ faculty: facultyId })
    .populate("subject", "name code")
    .populate("branch", "name")
    .sort({ date: -1 })
    .limit(5);

  // Get assignments stats
  const assignmentStats = await Assignment.aggregate([
    { $match: { faculty: facultyId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Get pending submissions to grade
  const pendingGrading = await Assignment.find({
    faculty: facultyId,
    status: "published",
    "submissions.status": { $in: ["submitted", "late"] },
  })
    .select("title subject dueDate submissions")
    .populate("subject", "name code");

  const pendingGradingCount = pendingGrading.reduce(
    (acc, a) => acc + a.submissions.filter((s) => s.status !== "graded").length,
    0
  );

  // Get leave requests to approve (if department head)
  const pendingLeaves = await Leave.find({
    applicantType: "student",
    status: "pending",
  })
    .populate("applicant", "firstName lastName enrollmentNo")
    .limit(5);

  // Get recent notices
  const recentNotices = await Notice.find({ status: "published" })
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(5);

  // Get total students in assigned classes
  const branchSemesters = [...new Set(subjects.map((s) => `${s.branch}-${s.semester}`))];
  let totalStudents = 0;
  for (const bs of branchSemesters) {
    const [branch, semester] = bs.split("-");
    const count = await User.countDocuments({
      role: "student",
      branch,
      semester: parseInt(semester),
      isActive: true,
    });
    totalStudents += count;
  }

  res.status(200).json({
    success: true,
    data: {
      subjects,
      recentAttendance,
      assignmentStats: assignmentStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      pendingGradingCount,
      pendingLeaves,
      recentNotices,
      quickStats: {
        totalSubjects: subjects.length,
        totalStudents,
        pendingGradingCount,
        pendingLeavesCount: pendingLeaves.length,
      },
    },
  });
});

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
// @access  Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  // User counts
  const userCounts = await User.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  // Branch-wise student distribution
  const branchDistribution = await User.aggregate([
    { $match: { role: "student", isActive: true } },
    { $group: { _id: "$branch", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "branches",
        localField: "_id",
        foreignField: "_id",
        as: "branch",
      },
    },
    { $unwind: "$branch" },
    { $project: { branch: "$branch.name", count: 1 } },
  ]);

  // Semester-wise distribution
  const semesterDistribution = await User.aggregate([
    { $match: { role: "student", isActive: true } },
    { $group: { _id: "$semester", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Fee collection stats
  const feeStats = await FeePayment.aggregate([
    {
      $group: {
        _id: "$status",
        total: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Recent registrations
  const recentRegistrations = await User.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select("firstName lastName email role createdAt");

  // Pending approvals
  const pendingLeaves = await Leave.countDocuments({ status: "pending" });

  // System stats
  const totalBranches = await Branch.countDocuments({ isActive: true });
  const totalSubjects = await Subject.countDocuments({ isActive: true });
  const totalAssignments = await Assignment.countDocuments({ status: "published" });
  const totalNotices = await Notice.countDocuments({ status: "published" });

  // Attendance overview (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const attendanceOverview = await Attendance.aggregate([
    { $match: { date: { $gte: sevenDaysAgo } } },
    { $unwind: "$records" },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        present: {
          $sum: { $cond: [{ $in: ["$records.status", ["present", "late"]] }, 1, 0] },
        },
        absent: {
          $sum: { $cond: [{ $eq: ["$records.status", "absent"] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      userCounts: userCounts.reduce((acc, u) => ({ ...acc, [u._id]: u.count }), {}),
      branchDistribution,
      semesterDistribution,
      feeStats: feeStats.reduce((acc, f) => ({ ...acc, [f._id]: { total: f.total, count: f.count } }), {}),
      recentRegistrations,
      pendingApprovals: {
        leaves: pendingLeaves,
      },
      systemStats: {
        totalBranches,
        totalSubjects,
        totalAssignments,
        totalNotices,
      },
      attendanceOverview,
    },
  });
});

// @desc    Get analytics data
// @route   GET /api/dashboard/analytics
// @access  Admin
const getAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, type = "overview" } = req.query;

  const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = endDate ? new Date(endDate) : new Date();

  let data = {};

  if (type === "overview" || type === "users") {
    // User registration trends
    data.userTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);
  }

  if (type === "overview" || type === "attendance") {
    // Attendance trends
    data.attendanceTrends = await Attendance.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $unwind: "$records" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $in: ["$records.status", ["present", "late"]] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          date: "$_id",
          total: 1,
          present: 1,
          percentage: { $multiply: [{ $divide: ["$present", "$total"] }, 100] },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  if (type === "overview" || type === "fees") {
    // Fee collection trends
    data.feeTrends = await FeePayment.aggregate([
      {
        $match: {
          "paymentHistory.paidAt": { $gte: start, $lte: end },
        },
      },
      { $unwind: "$paymentHistory" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentHistory.paidAt" } },
          collected: { $sum: "$paymentHistory.amount" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  if (type === "overview" || type === "results") {
    // Results distribution
    data.resultsDistribution = await ExamResult.aggregate([
      { $match: { status: "published" } },
      {
        $group: {
          _id: "$grade",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  res.status(200).json({
    success: true,
    data,
  });
});

// Helper function
function getAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

module.exports = {
  getStudentDashboard,
  getFacultyDashboard,
  getAdminDashboard,
  getAnalytics,
};
