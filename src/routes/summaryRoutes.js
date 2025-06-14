const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const summaryController = require('../controllers/summaryController');
const authMiddleware = require('../middlewares/authMiddleware')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/generate-summary',authMiddleware ,upload.single('file'), summaryController.generateSummary);

module.exports = router;