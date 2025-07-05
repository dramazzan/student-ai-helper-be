const express = require('express');
const router = express.Router();
const testPassingController = require('../controllers/testPassingController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/passing/submit-test:
 *   post:
 *     summary: Отправка теста на проверку
 *     tags: [Test Passing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               testId:
 *                 type: string
 *                 description: ID теста
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     selectedAnswer:
 *                       type: string
 *     responses:
 *       200:
 *         description: Тест успешно проверен, возвращается результат
 */
router.post('/submit-test', authMiddleware, testPassingController.submitTest);

module.exports = router;
