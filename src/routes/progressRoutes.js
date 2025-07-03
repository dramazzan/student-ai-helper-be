const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const progressController = require('../controllers/progressController');

router.get('/overall', authMiddleware, progressController.getUserProgress);
router.get('/test/:resultId', authMiddleware, progressController.getTestProgress);
router.get('/test/result/:testId', authMiddleware, progressController.getTestResults)


module.exports = router;
