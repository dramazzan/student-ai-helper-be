const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const progressController = require('../controllers/progressController');

// Общий прогресс
router.get('/overall', authMiddleware, progressController.getUserProgress);

// Прогресс по конкретному результату
router.get('/test/:resultId', authMiddleware, progressController.getTestProgress);

module.exports = router;
