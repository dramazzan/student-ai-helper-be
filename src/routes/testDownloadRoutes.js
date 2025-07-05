const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const testDownloadController = require('../controllers/testDownloadController');

/**
 * @swagger
 * /api/download/{id}/download:
 *   get:
 *     summary: Скачать тест в формате .docx
 *     tags: [Test Download]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID теста
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Файл успешно загружен
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Тест не найден
 */
router.get('/:id/download', authMiddleware, testDownloadController.downloadTestAsDocx);

module.exports = router;
