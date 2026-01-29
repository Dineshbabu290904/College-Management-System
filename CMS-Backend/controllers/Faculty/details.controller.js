const facultyDetails = require("../../models/Faculty/details.model.js");

const getDetails = async (req, res) => {
    try {
        let user = await facultyDetails.find(req.body);
        if (!user || user.length === 0) {  // Fixed check for empty results
            return res
                .status(400)
                .json({ success: false, message: "No Faculty Found" });
        }
        const data = {
            success: true,
            message: "Faculty Details Found!",
            user,
        };
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const addDetails = async (req, res) => {
    try {
        let user = await facultyDetails.findOne({ employeeId: req.body.employeeId });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Faculty With This EmployeeId Already Exists",
            });
        }
        
        // Add error handling for missing file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Profile image is required",
            });
        }
        
        user = await facultyDetails.create({ ...req.body, profile: req.file.filename });
        const data = {
            success: true,
            message: "Faculty Details Added!",
            user,
        };
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const updateDetails = async (req, res) => {
    try {
        let user;
        if (req.file) {
            user = await facultyDetails.findByIdAndUpdate(
                req.params.id, 
                { ...req.body, profile: req.file.filename },
                { new: true }  // Return the updated document
            );
        } else {
            user = await facultyDetails.findByIdAndUpdate(
                req.params.id, 
                req.body,
                { new: true }  // Return the updated document
            );
        }
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Faculty Found",
            });
        }
        
        const data = {
            success: true,
            message: "Updated Successful!",
            user,  // Return the updated user data
        };
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const deleteDetails = async (req, res) => {
    try {
        let user = await facultyDetails.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Faculty Found",
            });
        }
        const data = {
            success: true,
            message: "Deleted Successful!",
        };
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getCount = async (req, res) => {
    try {
        let count = await facultyDetails.countDocuments(req.body);
        const data = {
            success: true,
            message: "Count Successful!",
            count,  // Changed from 'user' to 'count' for clarity
        };
        res.json(data);
    } catch (error) {
        console.log(error);  // Added console log for consistency
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
}

module.exports = { getDetails, addDetails, updateDetails, deleteDetails, getCount };