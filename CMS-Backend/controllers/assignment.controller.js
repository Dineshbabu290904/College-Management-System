const Assignment = require("../models/Assignment.model");
const User = require("../models/User.model");
const Notification = require("../models/Notification.model");
const ActivityLog = require("../models/ActivityLog.model");
const githubStorage = require("../services/github.service");
const emailService = require("../services/email.service");
const { asyncHandler, ApiError } = require("../middlewares/errorHandler.middleware");

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Faculty
const createAssignment = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    instructions,
    subject,
    branch,
    semester,
    section,
    assignmentType,
    dueDate,
    publishDate,
    maxMarks,
    passingMarks,
    allowLateSubmission,
    lateSubmissionDeadline,
    latePenalty,
    allowedFileTypes,
    maxFileSize,
    maxFiles,
    rubric,
    status,
  } = req.body;

  // Handle file uploads
  let attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await githubStorage.uploadFile(
        file.buffer,
        file.originalname,
        "assignments"
      );
      attachments.push({
        fileName: file.originalname,
        fileUrl: result.url,
        fileType: file.mimetype,
        fileSize: file.size,
      });
    }
  }

  const assignment = await Assignment.create({
    title,
    description,
    instructions,
    subject,
    faculty: req.user._id,
    branch,
    semester,
    section,
    assignmentType,
    dueDate,
    publishDate: publishDate || new Date(),
    maxMarks,
    passingMarks,
    allowLateSubmission,
    lateSubmissionDeadline,
    latePenalty,
    allowedFileTypes: allowedFileTypes || ["application/pdf", "application/msword"],
    maxFileSize,
    maxFiles,
    attachments,
    rubric,
    status: status || "published",
    academicYear: getAcademicYear(),
  });

  // Send notifications to students
  if (assignment.status === "published") {
    await sendAssignmentNotifications(assignment, branch, semester, section);
  }

  await ActivityLog.logActivity({
    user: req.user._id,
    action: "create",
    entity: { type: "Assignment", id: assignment._id, name: title },
    description: `Created assignment: ${title}`,
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  res.status(201).json({
    success: true,
    message: "Assignment created successfully",
    data: assignment,
  });
});

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Faculty, Student
const getAssignments = asyncHandler(async (req, res) => {
  const { subject, branch, semester, status, page = 1, limit = 10 } = req.query;

  const query = {};

  if (req.user.role === "student") {
    query.branch = req.user.branch;
    query.semester = req.user.semester;
    query.status = "published";
    if (req.user.section) {
      query.$or = [{ section: req.user.section }, { section: null }];
    }
  } else if (req.user.role === "faculty") {
    query.faculty = req.user._id;
  }

  if (subject) query.subject = subject;
  if (branch && req.user.role !== "student") query.branch = branch;
  if (semester && req.user.role !== "student") query.semester = parseInt(semester);
  if (status && req.user.role !== "student") query.status = status;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { dueDate: 1, createdAt: -1 },
    populate: [
      { path: "subject", select: "name code" },
      { path: "faculty", select: "firstName lastName" },
      { path: "branch", select: "name code" },
    ],
  };

  const assignments = await Assignment.paginate(query, options);

  // Add submission status for students
  if (req.user.role === "student") {
    assignments.docs = assignments.docs.map((a) => {
      const submission = a.getStudentSubmission(req.user._id);
      return {
        ...a.toObject(),
        hasSubmitted: !!submission,
        submissionStatus: submission?.status,
        submissionMarks: submission?.marks,
      };
    });
  }

  res.status(200).json({
    success: true,
    data: assignments,
  });
});

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Faculty, Student
const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate("subject", "name code")
    .populate("faculty", "firstName lastName email")
    .populate("branch", "name code")
    .populate("submissions.student", "firstName lastName enrollmentNo email")
    .populate("submissions.gradedBy", "firstName lastName");

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  // Check authorization
  if (req.user.role === "student") {
    if (
      assignment.branch.toString() !== req.user.branch.toString() ||
      assignment.semester !== req.user.semester ||
      assignment.status !== "published"
    ) {
      throw new ApiError(403, "You do not have access to this assignment");
    }
  } else if (
    req.user.role === "faculty" &&
    assignment.faculty._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You do not have access to this assignment");
  }

  res.status(200).json({
    success: true,
    data: assignment,
  });
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Faculty
const updateAssignment = asyncHandler(async (req, res) => {
  let assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  if (assignment.faculty.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own assignments");
  }

  // Handle new file uploads
  if (req.files && req.files.length > 0) {
    const newAttachments = [];
    for (const file of req.files) {
      const result = await githubStorage.uploadFile(
        file.buffer,
        file.originalname,
        "assignments"
      );
      newAttachments.push({
        fileName: file.originalname,
        fileUrl: result.url,
        fileType: file.mimetype,
        fileSize: file.size,
      });
    }
    req.body.attachments = [...(assignment.attachments || []), ...newAttachments];
  }

  assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await ActivityLog.logActivity({
    user: req.user._id,
    action: "update",
    entity: { type: "Assignment", id: assignment._id, name: assignment.title },
    description: `Updated assignment: ${assignment.title}`,
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  res.status(200).json({
    success: true,
    message: "Assignment updated successfully",
    data: assignment,
  });
});

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Student
const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  if (assignment.status !== "published") {
    throw new ApiError(400, "This assignment is not open for submissions");
  }

  // Check if already submitted
  if (assignment.hasStudentSubmitted(req.user._id)) {
    throw new ApiError(400, "You have already submitted this assignment");
  }

  // Check due date
  const now = new Date();
  const isLate = now > new Date(assignment.dueDate);

  if (isLate && !assignment.allowLateSubmission) {
    throw new ApiError(400, "Submission deadline has passed");
  }

  if (
    isLate &&
    assignment.lateSubmissionDeadline &&
    now > new Date(assignment.lateSubmissionDeadline)
  ) {
    throw new ApiError(400, "Late submission deadline has also passed");
  }

  // Handle file uploads
  const files = [];
  if (req.files && req.files.length > 0) {
    if (req.files.length > assignment.maxFiles) {
      throw new ApiError(400, `Maximum ${assignment.maxFiles} files allowed`);
    }

    for (const file of req.files) {
      // Validate file type
      if (
        assignment.allowedFileTypes.length > 0 &&
        !assignment.allowedFileTypes.includes(file.mimetype)
      ) {
        throw new ApiError(400, `File type ${file.mimetype} is not allowed`);
      }

      // Validate file size
      if (file.size > assignment.maxFileSize) {
        throw new ApiError(
          400,
          `File ${file.originalname} exceeds maximum size limit`
        );
      }

      const result = await githubStorage.uploadFile(
        file.buffer,
        `${req.user.enrollmentNo}_${file.originalname}`,
        `assignments/${assignment._id}/submissions`
      );

      files.push({
        fileName: file.originalname,
        fileUrl: result.url,
        fileType: file.mimetype,
        fileSize: file.size,
      });
    }
  }

  const submission = {
    student: req.user._id,
    files,
    content: req.body.content,
    status: isLate ? "late" : "submitted",
    isLate,
  };

  assignment.submissions.push(submission);
  await assignment.save();

  await ActivityLog.logActivity({
    user: req.user._id,
    action: "submit",
    entity: { type: "Assignment", id: assignment._id, name: assignment.title },
    description: `Submitted assignment: ${assignment.title}`,
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  res.status(200).json({
    success: true,
    message: isLate
      ? "Assignment submitted (late submission)"
      : "Assignment submitted successfully",
    data: submission,
  });
});

// @desc    Grade a submission
// @route   PUT /api/assignments/:id/submissions/:submissionId/grade
// @access  Faculty
const gradeSubmission = asyncHandler(async (req, res) => {
  const { marks, feedback, status } = req.body;

  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  if (assignment.faculty.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only grade your own assignments");
  }

  const submissionIndex = assignment.submissions.findIndex(
    (s) => s._id.toString() === req.params.submissionId
  );

  if (submissionIndex === -1) {
    throw new ApiError(404, "Submission not found");
  }

  // Apply late penalty if applicable
  let finalMarks = marks;
  if (assignment.submissions[submissionIndex].isLate && assignment.latePenalty > 0) {
    finalMarks = marks - (marks * assignment.latePenalty) / 100;
  }

  assignment.submissions[submissionIndex].marks = finalMarks;
  assignment.submissions[submissionIndex].feedback = feedback;
  assignment.submissions[submissionIndex].status = status || "graded";
  assignment.submissions[submissionIndex].gradedBy = req.user._id;
  assignment.submissions[submissionIndex].gradedAt = new Date();

  await assignment.save();

  // Send notification to student
  const student = await User.findById(assignment.submissions[submissionIndex].student);
  if (student) {
    await Notification.create({
      title: "Assignment Graded",
      message: `Your submission for "${assignment.title}" has been graded. Marks: ${finalMarks}/${assignment.maxMarks}`,
      type: "assignment",
      sender: req.user._id,
      recipients: { type: "individual", users: [student._id] },
      reference: { model: "Assignment", id: assignment._id },
    });
  }

  await ActivityLog.logActivity({
    user: req.user._id,
    action: "grade",
    entity: { type: "Assignment", id: assignment._id, name: assignment.title },
    description: `Graded submission for ${student?.fullName}`,
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  res.status(200).json({
    success: true,
    message: "Submission graded successfully",
    data: assignment.submissions[submissionIndex],
  });
});

// @desc    Get submission statistics
// @route   GET /api/assignments/:id/stats
// @access  Faculty
const getSubmissionStats = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate("submissions.student", "firstName lastName enrollmentNo");

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  // Get total students in the class
  const studentQuery = {
    role: "student",
    branch: assignment.branch,
    semester: assignment.semester,
    isActive: true,
  };
  if (assignment.section) {
    studentQuery.section = assignment.section;
  }
  const totalStudents = await User.countDocuments(studentQuery);

  const stats = {
    totalStudents,
    submitted: assignment.submissions.length,
    pending: totalStudents - assignment.submissions.length,
    graded: assignment.submissions.filter((s) => s.status === "graded").length,
    lateSubmissions: assignment.submissions.filter((s) => s.isLate).length,
    averageMarks: 0,
    highestMarks: 0,
    lowestMarks: assignment.maxMarks,
  };

  const gradedSubmissions = assignment.submissions.filter(
    (s) => s.status === "graded" && s.marks !== undefined
  );

  if (gradedSubmissions.length > 0) {
    const marks = gradedSubmissions.map((s) => s.marks);
    stats.averageMarks = (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2);
    stats.highestMarks = Math.max(...marks);
    stats.lowestMarks = Math.min(...marks);
  }

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Faculty, Admin
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  if (
    req.user.role === "faculty" &&
    assignment.faculty.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You can only delete your own assignments");
  }

  await Assignment.findByIdAndDelete(req.params.id);

  await ActivityLog.logActivity({
    user: req.user._id,
    action: "delete",
    entity: { type: "Assignment", id: assignment._id, name: assignment.title },
    description: `Deleted assignment: ${assignment.title}`,
    metadata: { ipAddress: req.ip, userAgent: req.headers["user-agent"] },
  });

  res.status(200).json({
    success: true,
    message: "Assignment deleted successfully",
  });
});

// Helper functions
function getAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

async function sendAssignmentNotifications(assignment, branch, semester, section) {
  const studentQuery = {
    role: "student",
    branch,
    semester,
    isActive: true,
  };
  if (section) studentQuery.section = section;

  const students = await User.find(studentQuery);

  // Create in-app notification
  await Notification.create({
    title: "New Assignment Posted",
    message: `New assignment "${assignment.title}" has been posted. Due date: ${new Date(assignment.dueDate).toLocaleDateString()}`,
    type: "assignment",
    priority: "high",
    sender: assignment.faculty,
    recipients: {
      type: "custom",
      users: students.map((s) => s._id),
    },
    reference: { model: "Assignment", id: assignment._id },
    channels: { inApp: true, email: true },
  });

  // Send email notifications
  for (const student of students) {
    await emailService.sendAssignmentNotification(student, {
      title: assignment.title,
      subject: assignment.subject,
      dueDate: assignment.dueDate,
      maxMarks: assignment.maxMarks,
    });
  }
}

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissionStats,
  deleteAssignment,
};
