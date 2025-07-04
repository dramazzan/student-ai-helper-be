require('dotenv').config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedToken.id);

        if (!req.user) {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            return res.status(404).json({ success: false, message: "User not found" });
        }

        next();
    } catch (err) {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        let message = "Invalid token";
        if (err.name === "TokenExpiredError") {
            message = "Token expired";
        }

        return res.status(401).json({ success: false, message, error: err.message });
    }
};

module.exports = authMiddleware;
