const authService = require('../services/authService');

exports.register = async (req, res) => {
    try {
        const response = await authService.registerUser(req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).json({ message: 'Токен не передан' });
    }

    try {
        const result = await authService.verifyEmail(token);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};
