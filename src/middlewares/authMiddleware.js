require('dotenv').config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token; // ✅ получаем из cookie

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedToken.id);

        if (!req.user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid token", error: err.message });
    }
};

module.exports = authMiddleware;
