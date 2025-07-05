const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                  type: string
 *                  format: name
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *
 *     responses:
 *       200:
 *         description: Ссылка для подтверждения отправлена на email
 *       409:
 *         description: Пользователь уже существует
 *       400:
 *         description: Неверные данные
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Подтвердить email пользователя
 *     tags: [Auth]
 *     parameters:
 *       - name: token
 *         in: query
 *         required: true
 *         description: Токен подтверждения из email
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email успешно подтверждён
 *       400:
 *         description: Неверный или просроченный токен
 */
router.get('/verify-email', authController.verifyEmail);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Успешный вход, возвращается токен
 *       401:
 *         description: Неверный email или пароль
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/dashboard:
 *   get:
 *     summary: Получить данные текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешно возвращены данные пользователя
 *       401:
 *         description: Пользователь не авторизован
 */
router.get('/dashboard', authMiddleware, authController.getUserData);

module.exports = router;
