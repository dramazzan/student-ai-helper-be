const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const summaryController = require('../controllers/summaryController');
const authMiddleware = require('../middlewares/authMiddleware')
const {scheduleFileDeletion} = require("../services/fileService");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

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