// User & Authentication
const User = require("./User.model");

// Academic (V2 versions to avoid conflicts with legacy models)
const SubjectV2 = require("./Subject.model");
const Course = require("./Course.model");
const BranchV2 = require("./Branch.model");
const Department = require("./Department.model");
const TimetableV2 = require("./Timetable.model");

// Attendance & Assignments
const Attendance = require("./Attendance.model");
const Assignment = require("./Assignment.model");

// Exams & Results
const { Exam, ExamResult } = require("./Exam.model");

// Fee Management
const { FeeStructure, FeePayment } = require("./Fee.model");

// Leave Management
const Leave = require("./Leave.model");

// Materials & Notices (V2 versions)
const MaterialV2 = require("./Material.model");
const NoticeV2 = require("./Notice.model");

// Library
const { Book, BookIssue, BookRequest } = require("./Library.model");

// Notifications & Logs
const Notification = require("./Notification.model");
const ActivityLog = require("./ActivityLog.model");

module.exports = {
  // User
  User,

  // Academic (V2)
  Subject: SubjectV2,
  SubjectV2,
  Course,
  Branch: BranchV2,
  BranchV2,
  Department,
  Timetable: TimetableV2,
  TimetableV2,

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

  // Materials & Notices (V2)
  Material: MaterialV2,
  MaterialV2,
  Notice: NoticeV2,
  NoticeV2,

  // Library
  Book,
  BookIssue,
  BookRequest,

  // System
  Notification,
  ActivityLog,
};
