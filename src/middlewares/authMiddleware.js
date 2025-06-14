require('dotenv').config();

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({success: false, message: "Unauthorized"});
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedToken.id);
        next();
    } catch (err) {
        return res.status(500).json({success: false, message: "Something went wrong", error: err.message});
    }

}

module.exports = authMiddleware;