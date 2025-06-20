const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const testController = require('../controllers/testController');
const authMiddleware = require('../middlewares/authMiddleware');
const { scheduleFileDeletion } = require('../services/fileService');

// Хранилище файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + path.extname(file.originalname);
        cb(null, filename);
    }
});

// Фильтр по типу файла
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Неподдерживаемый формат файла'), false);
        }
    }
});

// Генерация одного теста
router.post('/generate-test', authMiddleware, upload.single('file'), async (req, res, next) => {
    try {
        await testController.generateTest(req, res);
        scheduleFileDeletion(req.file.filename);
    } catch (err) {
        next(err);
    }
});

// Получение результата теста
router.get('/result/:id', authMiddleware, testController.getTestResult);

// Генерация множества тестов из одного файла
router.post('/generate-multi', authMiddleware, upload.single('file'), async (req, res, next) => {
    try {
        await testController.generateMultipleTests(req, res);
        scheduleFileDeletion(req.file.filename);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
