const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authController.register);

router.get('/verify-email', authController.verifyEmail);

router.post('/login', authController.login);

router.get('/dashboard', authMiddleware ,authController.getUserData)

module.exports = router;
