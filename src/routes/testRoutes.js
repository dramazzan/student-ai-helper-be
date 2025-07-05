const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const testController = require('../controllers/testController');
const authMiddleware = require('../middlewares/authMiddleware');
const { scheduleFileDeletion } = require('../services/fileService');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, Date.now() + '-' + decodedName);
    }
});

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
 *               file:
 *                 type: string
 *                 format: binary
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
 *         description: ID теста
 *     responses:
 *       200:
 *         description: Успешный ответ с результатом теста
 */
router.get('/result/:id', authMiddleware, testController.getTestResult);

/**
 * @swagger
 * /api/test/generate-multi:
 *   post:
 *     summary: Генерация мульти-теста из файла
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
 *               file:
 *                 type: string
 *                 format: binary
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
 * /api/test/normal:
 *   get:
 *     summary: Получить список обычных тестов
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешно возвращён список обычных тестов
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
 *         description: Успешно возвращён список мульти-тестов
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
 *         description: Успешно получены тесты по модулю
 */
router.get('/module/:moduleId', authMiddleware, testController.getTestsByModuleId);

/**
 * @swagger
 * /api/test/module:
 *   get:
 *     summary: Получить все модули с тестами
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список модулей с тестами
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
 *         description: Успешно получен тест
 */
router.get('/:id', authMiddleware, testController.getTestByIdController);

module.exports = router;
