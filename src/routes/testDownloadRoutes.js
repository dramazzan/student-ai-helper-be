const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const testDownloadController = require('../controllers/testDownloadController');

router.get('/:id/download', authMiddleware, testDownloadController.downloadTestAsDocx);

module.exports = router;
