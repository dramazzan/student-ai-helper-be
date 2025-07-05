const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Получить аналитические данные пользователя
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешно получены аналитические данные
 *       401:
 *         description: Неавторизованный доступ
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/', authMiddleware, analyticsController.getStudentAnalytics);

module.exports = router;
