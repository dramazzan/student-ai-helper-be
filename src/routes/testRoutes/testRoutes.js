const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../../middlewares/authMiddleware');
const {scheduleFileDeletion} = require('../../utils/fileDeletion');

const generationController = require('../../controllers/testController/testGenerationController');
const resultController = require('../../controllers/testController/testResultController');
const listController = require('../../controllers/testController/testListController');
const moduleController = require('../../controllers/moduleController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, {recursive: true});
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
    limits: {fileSize: 100 * 1024 * 1024}, // 100 MB
});

/**
 * @swagger
 * /api/test/generate-test:
 *   post:
 *     summary: Генерация теста из файла, промпта или их комбинации
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               difficulty:
 *                 type: string
 *                 example: medium
 *               questionCount:
 *                 type: integer
 *                 example: 5
 *               userPrompt:
 *                 type: string
 *                 example: "Сделай тест по теме 'Физика: законы Ньютона' на 7 вопросов, сложность высокая"
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *   200:
 *     description: Тест успешно сгенерирован
 *   400:
 *     description: "Ошибка: нужен файл или userPrompt"
 *   500:
 *     description: "Ошибка генерации теста"
 */

router.post('/generate-test', authMiddleware, upload.single('file'), async (req, res, next) => {
    try {
        await generationController.generateTest(req, res);
        if (req.file) {
            scheduleFileDeletion(req.file.filename);
        }
    } catch (err) {
        next(err);
    }
});

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
 *               difficulty:
 *                 type: string
 *               questionCount:
 *                 type: integer
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Мульти-тест успешно сгенерирован
 */
router.post('/generate-multi', authMiddleware, upload.single('file'), async (req, res, next) => {
    try {
        await generationController.generateMultipleTests(req, res);
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID результата теста
 *     responses:
 *       200:
 *         description: Результат теста
 */
router.get('/result/:id', authMiddleware, resultController.getTestResult);

/**
 * @swagger
 * /api/test/normal:
 *   get:
 *     summary: Получить обычные тесты пользователя
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список обычных тестов
 */
router.get('/normal', authMiddleware, listController.getNormalTests);

/**
 * @swagger
 * /api/test/multi:
 *   get:
 *     summary: Получить мульти-тесты пользователя
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список мульти-тестов
 */
router.get('/multi', authMiddleware, listController.getMultiTests);

/**
 * @swagger
 * /api/test/module/{moduleId}:
 *   get:
 *     summary: Получить тесты по moduleId
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Тесты модуля
 */
router.get('/module/:moduleId', authMiddleware, listController.getTestsByModuleId);

/**
 * @swagger
 * /api/test/module:
 *   get:
 *     summary: Получить модули с тестами
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список модулей
 */
router.get('/module', authMiddleware, moduleController.getTestModules);

/**
 * @swagger
 * /api/test/{id}:
 *   get:
 *     summary: Получить тест по ID
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Тест найден
 */
router.get('/:id', authMiddleware, listController.getTestByIdController);


/**
 * @swagger
 * /api/test/{id}:
 *   delete:
 *     summary: Удалить тест по ID
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID теста для удаления
 *     responses:
 *       200:
 *         description: Тест успешно удалён
 *       404:
 *         description: Тест не найден или нет доступа
 *       500:
 *         description: Ошибка при удалении теста
 */
router.delete('/delete/:id', authMiddleware, resultController.deleteTest);


module.exports = router;
