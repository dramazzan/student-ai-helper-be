const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const progressController = require('../controllers/progressController');

/**
 * @swagger
 * /api/progress/overall:
 *   get:
 *     summary: Получить общий прогресс пользователя
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный ответ с общим прогрессом
 */
router.get('/overall', authMiddleware, progressController.getUserProgress);

/**
 * @swagger
 * /api/progress/test/{resultId}:
 *   get:
 *     summary: Получить подробности прогресса по конкретной попытке теста
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: resultId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID результата попытки
 *     responses:
 *       200:
 *         description: Успешно получены детали прогресса по тесту
 *       404:
 *         description: Результат не найден
 */
router.get('/test/:resultId', authMiddleware, progressController.getTestProgress);

/**
 * @swagger
 * /api/progress/test/result/{testId}:
 *   get:
 *     summary: Получить историю попыток по тесту
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: testId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID теста
 *     responses:
 *       200:
 *         description: Успешно получена история прохождений
 *       404:
 *         description: Тест не найден или нет попыток
 */
router.get('/test/result/:testId', authMiddleware, progressController.getTestResults);

/**
 * @swagger
 * /api/progress/module/{moduleId}:
 *   get:
 *     summary: Получить прогресс по модулю
 *     tags: [Progress]
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
 *         description: Успешно получен прогресс по модулю
 *       404:
 *         description: Модуль не найден
 */
router.get('/module/:moduleId', authMiddleware, progressController.getModuleProgress);

module.exports = router;
