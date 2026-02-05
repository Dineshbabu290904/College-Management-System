/**
 * Admin Seeder Script
 * Creates a superadmin user for the College Management System
 *
 * Usage: node seeders/adminSeeder.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// User Schema (inline to avoid model conflicts)
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin", "superadmin"],
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    middleName: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    phoneNumber: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "India" },
    },
    profileImage: {
      url: String,
      publicId: String,
    },
    employeeId: {
      type: String,
      sparse: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    designation: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    refreshTokens: [{
      token: String,
      createdAt: { type: Date, default: Date.now },
      expiresAt: Date,
      userAgent: String,
      ipAddress: String,
    }],
    preferences: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
      language: { type: String, default: "en" },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Default Superadmin Configuration
const DEFAULT_SUPERADMIN = {
  email: "superadmin@campusflow.com",
  password: "SuperAdmin@123",
  firstName: "Super",
  lastName: "Admin",
  role: "superadmin",
  employeeId: "ADMIN001",
  designation: "System Administrator",
  gender: "other",
  phoneNumber: "+91-9999999999",
  isActive: true,
  isEmailVerified: true,
  address: {
    street: "Admin Block",
    city: "Campus City",
    state: "State",
    zipCode: "123456",
    country: "India",
  },
  preferences: {
    theme: "system",
    language: "en",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  },
};

// Additional admin users to seed
const ADDITIONAL_ADMINS = [
  {
    email: "admin@campusflow.com",
    password: "Admin@123",
    firstName: "System",
    lastName: "Admin",
    role: "admin",
    employeeId: "ADMIN002",
    designation: "Administrator",
    gender: "other",
    phoneNumber: "+91-8888888888",
    isActive: true,
    isEmailVerified: true,
  },
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/college_management";

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    return false;
  }
};

// Seed superadmin
const seedSuperAdmin = async () => {
  const User = mongoose.models.User || mongoose.model("User", userSchema);

  try {
    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: "superadmin" });

    if (existingSuperAdmin) {
      console.log("ℹ️  Superadmin already exists:");
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Name: ${existingSuperAdmin.firstName} ${existingSuperAdmin.lastName}`);

      // Ask if user wants to reset password
      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        rl.question("\n🔄 Do you want to reset the superadmin password? (y/N): ", async (answer) => {
          rl.close();

          if (answer.toLowerCase() === "y") {
            existingSuperAdmin.password = DEFAULT_SUPERADMIN.password;
            await existingSuperAdmin.save();
            console.log("✅ Superadmin password has been reset");
            console.log(`   New Password: ${DEFAULT_SUPERADMIN.password}`);
          }

          resolve(existingSuperAdmin);
        });
      });
    }

    // Create new superadmin
    const superAdmin = new User(DEFAULT_SUPERADMIN);
    await superAdmin.save();

    console.log("\n✅ Superadmin created successfully!");
    console.log("━".repeat(50));
    console.log("📧 Email:    ", DEFAULT_SUPERADMIN.email);
    console.log("🔑 Password: ", DEFAULT_SUPERADMIN.password);
    console.log("👤 Name:     ", `${DEFAULT_SUPERADMIN.firstName} ${DEFAULT_SUPERADMIN.lastName}`);
    console.log("🏷️  Role:     ", DEFAULT_SUPERADMIN.role);
    console.log("🆔 Employee ID:", DEFAULT_SUPERADMIN.employeeId);
    console.log("━".repeat(50));

    return superAdmin;
  } catch (error) {
    if (error.code === 11000) {
      console.log("ℹ️  Superadmin with this email already exists");
    } else {
      console.error("❌ Error creating superadmin:", error.message);
    }
    throw error;
  }
};

// Seed additional admins
const seedAdmins = async () => {
  const User = mongoose.models.User || mongoose.model("User", userSchema);

  console.log("\n📋 Seeding additional admin users...\n");

  for (const adminData of ADDITIONAL_ADMINS) {
    try {
      const existingAdmin = await User.findOne({ email: adminData.email });

      if (existingAdmin) {
        console.log(`ℹ️  Admin already exists: ${adminData.email}`);
        continue;
      }

      const admin = new User(adminData);
      await admin.save();

      console.log(`✅ Admin created: ${adminData.email}`);
      console.log(`   Password: ${adminData.password}`);
    } catch (error) {
      if (error.code === 11000) {
        console.log(`ℹ️  Admin already exists: ${adminData.email}`);
      } else {
        console.error(`❌ Error creating admin ${adminData.email}:`, error.message);
      }
    }
  }
};

// Seed demo users for testing
const seedDemoUsers = async () => {
  const User = mongoose.models.User || mongoose.model("User", userSchema);

  const demoUsers = [
    {
      email: "student@campusflow.com",
      password: "Student@123",
      firstName: "Demo",
      lastName: "Student",
      role: "student",
      enrollmentNo: "STU2024001",
      semester: 4,
      section: "A",
      admissionYear: 2024,
      batch: "2024-2028",
      isActive: true,
      isEmailVerified: true,
    },
    {
      email: "faculty@campusflow.com",
      password: "Faculty@123",
      firstName: "Demo",
      lastName: "Faculty",
      role: "faculty",
      employeeId: "FAC001",
      designation: "Assistant Professor",
      experience: 5,
      qualification: "M.Tech",
      specialization: "Computer Science",
      isActive: true,
      isEmailVerified: true,
    },
  ];

  console.log("\n📋 Seeding demo users for testing...\n");

  for (const userData of demoUsers) {
    try {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`ℹ️  Demo user already exists: ${userData.email}`);
        continue;
      }

      const user = new User(userData);
      await user.save();

      console.log(`✅ Demo ${userData.role} created: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
    } catch (error) {
      if (error.code === 11000) {
        console.log(`ℹ️  Demo user already exists: ${userData.email}`);
      } else {
        console.error(`❌ Error creating demo user ${userData.email}:`, error.message);
      }
    }
  }
};

// Main function
const main = async () => {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║        CampusFlow - Admin Seeder Script                ║");
  console.log("║        College Management System v2.0                  ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log("\n");

  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  try {
    // Seed superadmin
    await seedSuperAdmin();

    // Seed additional admins
    await seedAdmins();

    // Seed demo users
    await seedDemoUsers();

    console.log("\n");
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║              Seeding Completed Successfully!           ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log("\n");
    console.log("🔐 Login Credentials Summary:");
    console.log("━".repeat(50));
    console.log("SUPERADMIN:");
    console.log("  Email:    superadmin@campusflow.com");
    console.log("  Password: SuperAdmin@123");
    console.log("");
    console.log("ADMIN:");
    console.log("  Email:    admin@campusflow.com");
    console.log("  Password: Admin@123");
    console.log("");
    console.log("DEMO STUDENT:");
    console.log("  Email:    student@campusflow.com");
    console.log("  Password: Student@123");
    console.log("");
    console.log("DEMO FACULTY:");
    console.log("  Email:    faculty@campusflow.com");
    console.log("  Password: Faculty@123");
    console.log("━".repeat(50));
    console.log("\n⚠️  Remember to change these passwords in production!\n");

  } catch (error) {
    console.error("\n❌ Seeding failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the seeder
main();
