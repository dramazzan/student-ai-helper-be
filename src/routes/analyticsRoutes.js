const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, analyticsController.getStudentAnalytics);

module.exports = router;
