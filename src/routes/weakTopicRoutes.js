const express = require('express');
const router = express.Router();
const { generateFromWeakTopicsController } = require('../controllers/testController/weakTopicController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/generate', authMiddleware,  generateFromWeakTopicsController);

module.exports = router;
