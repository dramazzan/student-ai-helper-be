const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const testController = require('../controllers/testController');
const authMiddleware = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + path.extname(file.originalname);
        cb(null, filename);
    }
});

const upload = multer({ storage });

const { scheduleFileDeletion } = require('../services/fileService');

router.post('/generate-test', authMiddleware, upload.single('file'), async (req, res, next) => {
    try {
        await testController.generateTest(req, res);
        scheduleFileDeletion(req.file.filename);
    } catch (err) {
        next(err);
    }
});


module.exports = router;
