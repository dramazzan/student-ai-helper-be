const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const testController = require('../controllers/testController');
const authMiddleware = require('../middlewares/authMiddleware');
const { scheduleFileDeletion } = require('../services/fileService');

// Настройка хранения файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, Date.now() + '-' + decodedName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100 MB
    }
});


/**
 * @swagger
 * /api/test/generate-test:
 *   post:
 *     summary: Генерация теста из загруженного файла
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               difficulty:
 *                 type: string
 *                 description: Сложность теста (например, easy, medium, hard)
 *               questionCount:
 *                 type: integer
 *                 description: Кол-во вопросов в тесте
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Файл формата .pdf, .docx, .pptx, .txt, .html и др.
 *     responses:
 *       200:
 *         description: Тест успешно сгенерирован
 */
router.post('/generate-test', authMiddleware, upload.single('file'), async (req, res, next) => {
    try {
        await testController.generateTest(req, res);
        scheduleFileDeletion(req.file.filename);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/test/generate-multi:
 *   post:
 *     summary: Генерация мульти-теста из загруженного файла по темам
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               difficulty:
 *                 type: string
 *                 description: Сложность тестов
 *               questionCount:
 *                 type: integer
 *                 description: Вопросов на каждую тему
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Файл (поддерживаются .pdf, .docx, .pptx, .txt, .html и др.)
 *     responses:
 *       200:
 *         description: Мульти-тест успешно сгенерирован
 */
router.post('/generate-multi', authMiddleware, upload.single('file'), async (req, res, next) => {
    try {
        await testController.generateMultipleTests(req, res);
        scheduleFileDeletion(req.file.filename);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/test/result/{id}:
 *   get:
 *     summary: Получить результат теста по ID
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID результата теста
 *     responses:
 *       200:
 *         description: Успешный ответ с результатом теста
 */
router.get('/result/:id', authMiddleware, testController.getTestResult);

/**
 * @swagger
 * /api/test/normal:
 *   get:
 *     summary: Получить список обычных тестов
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список обычных тестов
 */
router.get('/normal', authMiddleware, testController.getNormalTests);

/**
 * @swagger
 * /api/test/multi:
 *   get:
 *     summary: Получить список мульти-тестов
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список мульти-тестов
 */
router.get('/multi', authMiddleware, testController.getMultiTests);

/**
 * @swagger
 * /api/test/module/{moduleId}:
 *   get:
 *     summary: Получить тесты по moduleId
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: moduleId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID модуля
 *     responses:
 *       200:
 *         description: Список тестов по модулю
 */
router.get('/module/:moduleId', authMiddleware, testController.getTestsByModuleId);

/**
 * @swagger
 * /api/test/module:
 *   get:
 *     summary: Получить список всех модулей с тестами
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список модулей
 */
router.get('/module', authMiddleware, testController.getTestModules);

/**
 * @swagger
 * /api/test/{id}:
 *   get:
 *     summary: Получить тест по ID
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID теста
 *     responses:
 *       200:
 *         description: Тест по ID
 */
router.get('/:id', authMiddleware, testController.getTestByIdController);

module.exports = router;
