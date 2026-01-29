const Branch = require("../../models/Other/branch.model");

/**
 * Get all branches
 */
const getBranch = async (req, res) => {
    try {
        const branches = await Branch.find();

        return res.status(200).json({
            success: true,
            message: "All Branches Loaded!",
            branches,
        });
    } catch (error) {
        console.error("Error in getBranch:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};

/**
 * Add a new branch
 */
const addBranch = async (req, res) => {
    try {
        const { name } = req.body;
        
        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Branch name is required",
            });
        }

        // Check if branch already exists
        const existingBranch = await Branch.findOne({ name });
        if (existingBranch) {
            return res.status(409).json({
                success: false,
                message: "Branch already exists",
            });
        }

        // Create new branch
        const newBranch = await Branch.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Branch added successfully",
            branch: newBranch,
        });
    } catch (error) {
        console.error("Error in addBranch:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};

/**
 * Delete a branch by ID
 */
const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ID
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Branch ID is required",
            });
        }

        // Find and delete branch
        const deletedBranch = await Branch.findByIdAndDelete(id);
        
        if (!deletedBranch) {
            return res.status(404).json({ 
                success: false, 
                message: "Branch not found" 
            });
        }

        return res.status(200).json({
            success: true,
            message: "Branch deleted successfully",
            branch: deletedBranch,
        });
    } catch (error) {
        console.error("Error in deleteBranch:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};

module.exports = { getBranch, addBranch, deleteBranch };