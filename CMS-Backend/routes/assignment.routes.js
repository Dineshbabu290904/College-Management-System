const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissionStats,
  deleteAssignment,
} = require("../controllers/assignment.controller");
const { verifyToken, authorize } = require("../middlewares/auth.middleware");
const { validationRules, validate } = require("../middlewares/validate.middleware");

// Multer configuration for memory storage (for GitHub upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    files: 5,
  },
});

// All routes require authentication
router.use(verifyToken);

// CRUD operations
router.post(
  "/",
  authorize("faculty", "admin"),
  upload.array("files", 5),
  validationRules.createAssignment,
  validate,
  createAssignment
);
router.get("/", getAssignments);
router.get("/:id", getAssignment);
router.put("/:id", authorize("faculty", "admin"), upload.array("files", 5), updateAssignment);
router.delete("/:id", authorize("faculty", "admin"), deleteAssignment);

// Submission routes
router.post("/:id/submit", authorize("student"), upload.array("files", 5), submitAssignment);
router.put("/:id/submissions/:submissionId/grade", authorize("faculty"), gradeSubmission);
router.get("/:id/stats", authorize("faculty", "admin"), getSubmissionStats);

module.exports = router;
