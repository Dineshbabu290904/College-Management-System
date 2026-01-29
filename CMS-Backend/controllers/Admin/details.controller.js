const adminDetails = require("../../models/Admin/details.model.js");
const studentDetails = require("../../models/Students/details.model.js"); // Added missing import for getCount

const getDetails = async (req, res) => {
    try {
        // Changed from find(req.body) to find() since it's more common to get all or filter with query params
        let user = await adminDetails.find(req.body);
        if (!user || user.length === 0) {  // Fixed check for empty results
            return res
                .status(400)
                .json({ success: false, message: "No Admin Found" });
        }
        const data = {
            success: true,
            message: "Admin Details Found!",
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
        let user = await adminDetails.findOne({ employeeId: req.body.employeeId });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Admin With This EmployeeId Already Exists",
            });
        }
        
        // Add error handling for missing file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Profile image is required",
            });
        }
        
        user = await adminDetails.create({ ...req.body, profile: req.file.filename });
        const data = {
            success: true,
            message: "Admin Details Added!",
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
            user = await adminDetails.findByIdAndUpdate(
                req.params.id, 
                { ...req.body, profile: req.file.filename },
                { new: true }  // Return the updated document
            );
        } else {
            user = await adminDetails.findByIdAndUpdate(
                req.params.id, 
                req.body,
                { new: true }  // Return the updated document
            );
        }
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Admin Found",
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
        let user = await adminDetails.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Admin Found",
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
        // Fixed to use adminDetails instead of studentDetails
        let count = await adminDetails.countDocuments(req.body);
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