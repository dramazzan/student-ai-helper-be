const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const analyticsController = require('../controllers/analyticsController');

router.get('/student', authMiddleware, analyticsController.getStudentAnalytics);

module.exports = router;
