const express = require('express');
const router = express.Router();
const testPassingController = require('../controllers/testPassingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/submit-test', authMiddleware, testPassingController.submitTest);

module.exports = router;
