// User & Authentication
const User = require("./User.model");

// Academic
const Subject = require("./Subject.model");
const Course = require("./Course.model");
const Branch = require("./Branch.model");
const Department = require("./Department.model");
const Timetable = require("./Timetable.model");

// Attendance & Assignments
const Attendance = require("./Attendance.model");
const Assignment = require("./Assignment.model");

// Exams & Results
const { Exam, ExamResult } = require("./Exam.model");

// Fee Management
const { FeeStructure, FeePayment } = require("./Fee.model");

// Leave Management
const Leave = require("./Leave.model");

// Materials & Notices
const Material = require("./Material.model");
const Notice = require("./Notice.model");

// Library
const { Book, BookIssue, BookRequest } = require("./Library.model");

// Notifications & Logs
const Notification = require("./Notification.model");
const ActivityLog = require("./ActivityLog.model");

module.exports = {
  // User
  User,

  // Academic
  Subject,
  Course,
  Branch,
  Department,
  Timetable,

  // Attendance & Assignments
  Attendance,
  Assignment,

  // Exams
  Exam,
  ExamResult,

  // Fee
  FeeStructure,
  FeePayment,

  // Leave
  Leave,

  // Materials & Notices
  Material,
  Notice,

  // Library
  Book,
  BookIssue,
  BookRequest,

  // System
  Notification,
  ActivityLog,
};
