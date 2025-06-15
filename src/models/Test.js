const { parsePDF } = require('../utils/fileParser');
const { generateTestFromText } = require('../services/geminiService');
const Test = require('../models/Test');

exports.generateTest = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Файл не найден' });

    const text = await parsePDF(req.file.path);
    const testJson = await generateTestFromText(text);

    const newTest = new Test({
      owner: req.user._id,
      originalFileName: req.file.originalname,
      title: testJson.title,
      questions: testJson.questions,
    });

    await newTest.save();

    res.status(200).json({ test: newTest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка генерации теста' });
  }
};
