const facultyCredential = require("../../models/Faculty/credential.model.js");
const bcrypt = require("bcrypt");

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

const loginHandler = async (req, res) => {
    let { loginid, password } = req.body;
    try {
        let user = await facultyCredential.findOne({ loginid });
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Wrong Credentials" });
        }
        
        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: "Wrong Credentials" });
        }
        
        const data = {
            success: true,
            message: "Login Successful!",
            loginid: user.loginid,
            id: user.id,
        };
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const registerHandler = async (req, res) => {
    let { loginid, password } = req.body;
    try {
        let user = await facultyCredential.findOne({ loginid });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User With This LoginId Already Exists",
            });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        user = await facultyCredential.create({
            loginid,
            password: hashedPassword,
        });
        
        const data = {
            success: true,
            message: "Register Successful!",
            loginid: user.loginid,
            id: user.id,
        };
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const updateHandler = async (req, res) => {
    try {
        const { password } = req.body;
        
        // If password is being updated, hash it
        if (password) {
            req.body.password = await bcrypt.hash(password, SALT_ROUNDS);
        }
        
        let user = await facultyCredential.findByIdAndUpdate(
            req.params.id,
            req.body
        );
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No User Exists!",
            });
        }
        
        const data = {
            success: true,
            message: "Updated Successful!",
        };
        res.json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const deleteHandler = async (req, res) => {
    try {
        let user = await facultyCredential.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No User Exists!",
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

module.exports = { loginHandler, registerHandler, updateHandler, deleteHandler };