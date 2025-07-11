const express = require('express');
const router = express.Router();
const { generateTestFromUrlController } = require('../controllers/testFromUrlController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/generate-test/from-url:
 *   post:
 *     summary: Генерация теста из URL сайта
 *     tags:
 *       - Generate Test From URL
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://example.com/article"
 *               options:
 *                 type: object
 *                 properties:
 *                   difficulty:
 *                     type: string
 *                     example: "medium"
 *                   questionCount:
 *                     type: integer
 *                     example: 5
 *                   questionType:
 *                     type: string
 *                     example: "тест с выбором"
 *                   testType:
 *                     type: string
 *                     example: "normal"
 *     responses:
 *       201:
 *         description: Успешно сгенерирован тест
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Test'
 *       400:
 *         description: Некорректные данные (например, отсутствует URL)
 *       500:
 *         description: Ошибка сервера при генерации теста
 */
router.post('/from-url', authMiddleware, generateTestFromUrlController);

module.exports = router;
