const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const summaryController = require('../controllers/summaryController');
const authMiddleware = require('../middlewares/authMiddleware');
const { scheduleFileDeletion } = require("../utils/fileDeletion");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/**
 * @swagger
 * /api/summary/generate-summary:
 *   post:
 *     summary: Генерация конспекта из загруженного файла
 *     tags: [Summary]
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
 *         description: Конспект успешно сгенерирован
 *       400:
 *         description: Неверный запрос или неподдерживаемый файл
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post('/generate-summary', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    await summaryController.generateSummary(req, res);
    scheduleFileDeletion(req.file.filename);
  } catch (err) {
    console.error('Ошибка маршрута:', err);
    res.status(500).json({ message: 'Ошибка на стороне сервера' });
  }
});

module.exports = router;
