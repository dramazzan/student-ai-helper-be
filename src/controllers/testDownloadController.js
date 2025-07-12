const path = require('path');
const fs = require('fs');
const Test = require('../models/Test');
const { generateDocxFromTest } = require('../services/downloadServices/docxService');
const { generatePdfFromTest } = require('../services/downloadServices/pdfService');
const { generateGiftFromTest } = require('../services/downloadServices/giftService');
const { generateQtiFromTest } = require('../services/downloadServices/qtiService');
const { generateMoodleXmlFromTest } = require('../services/downloadServices/moodleXmlService');
const { generateCsvFromTest } = require('../services/downloadServices/csvService');

async function downloadFile(test, userId, generatorFn, format, res) {
    if (!test) {
        return res.status(404).json({ message: 'Тест не найден' });
    }

    if (test.owner.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Нет доступа к тесту' });
    }

    const fileName = `test-${test._id}.${format}`;
    try {
        const filePath = await generatorFn(test, fileName);
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error(`Ошибка при отправке файла ${format}:`, err);
                res.status(500).json({ message: 'Ошибка при отправке файла' });
            }
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.warn(`Не удалось удалить временный файл (${format}):`, unlinkErr);
            });
        });
    } catch (err) {
        console.error(`Ошибка при генерации файла ${format}:`, err);
        res.status(500).json({ message: 'Ошибка при генерации файла' });
    }
}

exports.downloadTestAsDocx = async (req, res) => {
    const test = await Test.findById(req.params.id);
    await downloadFile(test, req.user._id, generateDocxFromTest, 'docx', res);
};

exports.downloadTestAsPdf = async (req, res) => {
    const test = await Test.findById(req.params.id);
    await downloadFile(test, req.user._id, generatePdfFromTest, 'pdf', res);
};

exports.downloadTestAsGift = async (req, res) => {
    const test = await Test.findById(req.params.id);
    await downloadFile(test, req.user._id, generateGiftFromTest, 'gift.txt', res);
};

exports.downloadTestAsQti = async (req, res) => {
    const test = await Test.findById(req.params.id);
    await downloadFile(test, req.user._id, generateQtiFromTest, 'qti.xml', res);
};

exports.downloadTestAsMoodleXml = async (req, res) => {
    const test = await Test.findById(req.params.id);
    await downloadFile(test, req.user._id, generateMoodleXmlFromTest, 'moodle.xml', res);
};

exports.downloadTestAsCsv = async (req, res) => {
    const test = await Test.findById(req.params.id);
    await downloadFile(test, req.user._id, generateCsvFromTest, 'csv', res);
};
