const adminDetails = require("./models/Admin/details.model.js");
const adminCredential = require("./models/Admin/credential.model.js");
const connectToMongo = require("./Database/db.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const seedData = async () => {
    try {
        await connectToMongo();
        
        await adminCredential.deleteMany({});
        await adminDetails.deleteMany({});
        
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash("admin123", saltRounds);
        
        await adminCredential.create({
            loginid: "22501A4460",
            password: hashedPassword
        });
        
        const adminDetail = {
            employeeId: "22501A4460",
            firstName: "Dinesh",
            middleName: "Babu",
            lastName: "Surapaneni",
            email: "22501a4460@pvpsit.ac.in",
            phoneNumber: "6300575551",
            gender: "Male",
            type: "Admin",
            profile: "Default.png",
        };
        
        await adminDetails.create(adminDetail);
        
        console.log("Seeding completed successfully!");
    } catch (error) {
        console.error("Error while seeding:", error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

seedData();