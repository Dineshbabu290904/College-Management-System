const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.fromEmail = process.env.FROM_EMAIL || "noreply@college.edu";
    this.fromName = process.env.FROM_NAME || "College Management System";
  }

  /**
   * Send email
   * @param {Object} options - { to, subject, text, html }
   */
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error("Email sending error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to College Management System</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName}!</h2>
            <p>Welcome to our College Management System. Your account has been successfully created.</p>
            <p><strong>Your Details:</strong></p>
            <ul>
              <li>Email: ${user.email}</li>
              <li>Role: ${user.role}</li>
              ${user.enrollmentNo ? `<li>Enrollment No: ${user.enrollmentNo}</li>` : ""}
              ${user.employeeId ? `<li>Employee ID: ${user.employeeId}</li>` : ""}
            </ul>
            <p>You can now login to access your dashboard and explore all the features.</p>
            <a href="${process.env.FRONTEND_URL}" class="button">Login to Dashboard</a>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} College Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: "Welcome to College Management System",
      text: `Welcome ${user.firstName}! Your account has been created successfully.`,
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName}!</h2>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <div class="warning">
              <strong>Note:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} College Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: "Password Reset Request - CMS",
      text: `Reset your password: ${resetUrl}. This link expires in 1 hour.`,
      html,
    });
  }

  /**
   * Send assignment notification
   */
  async sendAssignmentNotification(student, assignment) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3498db; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Assignment Posted</h1>
          </div>
          <div class="content">
            <h2>Hello ${student.firstName}!</h2>
            <p>A new assignment has been posted for your class.</p>
            <div class="details">
              <p><strong>Title:</strong> ${assignment.title}</p>
              <p><strong>Subject:</strong> ${assignment.subject}</p>
              <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
              <p><strong>Max Marks:</strong> ${assignment.maxMarks}</p>
            </div>
            <a href="${process.env.FRONTEND_URL}/student/assignments" class="button">View Assignment</a>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} College Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: student.email,
      subject: `New Assignment: ${assignment.title}`,
      text: `New assignment "${assignment.title}" has been posted. Due date: ${new Date(assignment.dueDate).toLocaleDateString()}`,
      html,
    });
  }

  /**
   * Send grade notification
   */
  async sendGradeNotification(student, exam, result) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .grade { font-size: 48px; text-align: center; color: #27ae60; font-weight: bold; }
          .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Exam Results Published</h1>
          </div>
          <div class="content">
            <h2>Hello ${student.firstName}!</h2>
            <p>Your results for ${exam.name} have been published.</p>
            <div class="grade">${result.grade}</div>
            <div class="details">
              <p><strong>Subject:</strong> ${exam.subject}</p>
              <p><strong>Marks Obtained:</strong> ${result.marksObtained} / ${exam.maxMarks}</p>
              <p><strong>Grade Points:</strong> ${result.gradePoints}</p>
            </div>
            <a href="${process.env.FRONTEND_URL}/student/results" class="button">View Full Results</a>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} College Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: student.email,
      subject: `Results Published: ${exam.name}`,
      text: `Your result for ${exam.name} - Grade: ${result.grade}, Marks: ${result.marksObtained}/${exam.maxMarks}`,
      html,
    });
  }

  /**
   * Send attendance alert
   */
  async sendAttendanceAlert(student, subject, percentage) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 5px; text-align: center; }
          .percentage { font-size: 48px; color: #e74c3c; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Low Attendance Alert</h1>
          </div>
          <div class="content">
            <h2>Hello ${student.firstName}!</h2>
            <p>This is to inform you that your attendance in <strong>${subject}</strong> has fallen below the minimum required percentage.</p>
            <div class="alert">
              <p>Your Current Attendance</p>
              <div class="percentage">${percentage.toFixed(1)}%</div>
              <p>Minimum Required: 75%</p>
            </div>
            <p>Please ensure regular attendance to avoid any academic consequences.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} College Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: student.email,
      subject: `Low Attendance Alert: ${subject}`,
      text: `Your attendance in ${subject} is ${percentage.toFixed(1)}%. Minimum required is 75%.`,
      html,
    });
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info("SMTP connection verified");
      return true;
    } catch (error) {
      logger.error("SMTP verification failed:", error.message);
      return false;
    }
  }
}

// Singleton instance
const emailService = new EmailService();

module.exports = emailService;
