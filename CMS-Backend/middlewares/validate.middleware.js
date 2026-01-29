const { validationResult, body, param, query } = require("express-validator");

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  // MongoDB ObjectId
  mongoId: (field, location = "param") => {
    const validator = location === "param" ? param(field) : body(field);
    return validator
      .isMongoId()
      .withMessage(`Invalid ${field} format`);
  },

  // Email
  email: body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .toLowerCase(),

  // Password
  password: body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),

  // Phone number
  phone: body("phoneNumber")
    .optional()
    .matches(/^\+?[\d\s-]{10,15}$/)
    .withMessage("Please provide a valid phone number"),

  // Name fields
  firstName: body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters"),

  lastName: body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters"),

  // Pagination
  page: query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  limit: query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),

  // Date
  date: (field) => body(field)
    .isISO8601()
    .withMessage(`${field} must be a valid date`),

  // Semester
  semester: body("semester")
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage("Semester must be between 1 and 8"),
};

// Validation rule sets
const validationRules = {
  // Auth validations
  register: [
    commonValidations.email,
    commonValidations.password,
    commonValidations.firstName,
    commonValidations.lastName,
    body("role")
      .isIn(["student", "faculty", "admin"])
      .withMessage("Role must be student, faculty, or admin"),
  ],

  login: [
    commonValidations.email,
    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],

  updateProfile: [
    commonValidations.firstName.optional(),
    commonValidations.lastName.optional(),
    commonValidations.phone,
  ],

  changePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    body("confirmPassword")
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage("Passwords do not match"),
  ],

  // Assignment validations
  createAssignment: [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 200 })
      .withMessage("Title cannot exceed 200 characters"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    commonValidations.mongoId("subject", "body"),
    commonValidations.mongoId("branch", "body"),
    commonValidations.semester,
    body("dueDate")
      .isISO8601()
      .withMessage("Due date is required and must be a valid date"),
    body("maxMarks")
      .isInt({ min: 0 })
      .withMessage("Max marks must be a positive number"),
  ],

  // Attendance validations
  markAttendance: [
    commonValidations.mongoId("subject", "body"),
    commonValidations.mongoId("branch", "body"),
    commonValidations.semester,
    body("date")
      .isISO8601()
      .withMessage("Date is required"),
    body("records")
      .isArray({ min: 1 })
      .withMessage("Attendance records are required"),
    body("records.*.student")
      .isMongoId()
      .withMessage("Invalid student ID"),
    body("records.*.status")
      .isIn(["present", "absent", "late", "excused"])
      .withMessage("Status must be present, absent, late, or excused"),
  ],

  // Leave validations
  applyLeave: [
    body("leaveType")
      .isIn(["sick", "casual", "medical", "emergency", "academic", "personal"])
      .withMessage("Invalid leave type"),
    body("reason")
      .trim()
      .notEmpty()
      .withMessage("Reason is required")
      .isLength({ max: 500 })
      .withMessage("Reason cannot exceed 500 characters"),
    body("startDate")
      .isISO8601()
      .withMessage("Start date is required"),
    body("endDate")
      .isISO8601()
      .withMessage("End date is required")
      .custom((value, { req }) => new Date(value) >= new Date(req.body.startDate))
      .withMessage("End date must be after start date"),
  ],

  // Notice validations
  createNotice: [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 300 })
      .withMessage("Title cannot exceed 300 characters"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("type")
      .optional()
      .isIn(["general", "academic", "exam", "event", "holiday", "placement", "sports", "cultural", "emergency"])
      .withMessage("Invalid notice type"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Invalid priority"),
  ],
};

module.exports = {
  validate,
  commonValidations,
  validationRules,
  body,
  param,
  query,
};
