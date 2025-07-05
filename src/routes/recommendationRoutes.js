const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/recommendation/{resultId}:
 *   get:
 *     summary: Получить рекомендации на основе результата теста
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: resultId
 *         in: path
 *         required: true
 *         description: ID результата теста
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Успешный ответ с рекомендациями
 *       404:
 *         description: Результат не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/:resultId', authMiddleware, recommendationController.getRecommendations);

module.exports = router;
