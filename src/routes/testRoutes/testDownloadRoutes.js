const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const testDownloadController = require('../../controllers/testController/testDownloadController');

/**
 * @swagger
 * tags:
 *   name: Test Download
 *   description: Загрузка тестов в различных форматах
 */

/**
 * @swagger
 * /api/download/{id}/download/docx:
 *   get:
 *     summary: Скачать тест в формате .docx
 *     tags: [Test Download]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID теста
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: DOCX-файл успешно загружен
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Тест не найден
 */
router.get('/:id/download/docx', authMiddleware, testDownloadController.downloadTestAsDocx);

/**
 * @swagger
 * /api/download/{id}/download/pdf:
 *   get:
 *     summary: Скачать тест в формате .pdf
 *     tags: [Test Download]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID теста
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF-файл успешно загружен
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Тест не найден
 */
router.get('/:id/download/pdf', authMiddleware, testDownloadController.downloadTestAsPdf);

/**
 * @swagger
 * /api/download/{id}/download/gift:
 *   get:
 *     summary: Скачать тест в формате GIFT (для Moodle)
 *     tags: [Test Download]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID теста
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: GIFT-файл успешно загружен
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Тест не найден
 */
router.get('/:id/download/gift', authMiddleware, testDownloadController.downloadTestAsGift);

/**
 * @swagger
 * /api/download/{id}/download/qti:
 *   get:
 *     summary: Скачать тест в формате QTI (для Canvas, Blackboard)
 *     tags: [Test Download]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID теста
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QTI-файл успешно загружен
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Тест не найден
 */
router.get('/:id/download/qti', authMiddleware, testDownloadController.downloadTestAsQti);

/**
 * @swagger
 * /api/download/{id}/download/moodlexml:
 *   get:
 *     summary: Скачать тест в формате Moodle XML
 *     tags: [Test Download]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID теста
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Moodle XML-файл успешно загружен
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Тест не найден
 */
router.get('/:id/download/moodlexml', authMiddleware, testDownloadController.downloadTestAsMoodleXml);

/**
 * @swagger
 * /api/download/{id}/download/csv:
 *   get:
 *     summary: Скачать тест в формате CSV
 *     tags: [Test Download]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID теста
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CSV-файл успешно загружен
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Тест не найден
 */
router.get('/:id/download/csv', authMiddleware, testDownloadController.downloadTestAsCsv);

module.exports = router;
