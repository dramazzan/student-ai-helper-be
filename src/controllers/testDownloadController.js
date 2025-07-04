// controllers/testController.js
const path = require('path');
const fs = require('fs');
const Test = require('../models/Test');
const { generateDocxFromTest } = require('../services/docxService');

exports.downloadTestAsDocx = async (req, res) => {
    try {
        const testId = req.params.id;
        const userId = req.user._id;

        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Тест не найден' });
        }

        if (test.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Нет доступа к тесту' });
        }

        const fileName = `test-${test._id}.docx`;
        const filePath = await generateDocxFromTest(test, fileName);

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Ошибка при отправке файла:', err);
                res.status(500).json({ message: 'Ошибка при отправке файла' });
            }

            // Удалить файл после отправки (если не нужен для хранения)
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.warn('Не удалось удалить временный файл:', unlinkErr);
            });
        });
    } catch (err) {
        console.error('Ошибка при скачивании DOCX:', err);
        res.status(500).json({ message: 'Ошибка при генерации файла' });
    }
};
