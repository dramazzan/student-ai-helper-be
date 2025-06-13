const { parsePDF } = require('../utils/fileParser');
const { generateSummaryFromText } = require('../services/geminiService');

exports.generateSummary = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Файл не найден' });

    const text = await parsePDF(req.file.path);
    const summary = await generateSummaryFromText(text);

    res.status(200).json({ summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка генерации конспекта' });
  }
};
