const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function generatePdfFromTest(test, fileName) {
    const downloadsDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const filePath = path.join(downloadsDir, fileName);
    const doc = new PDFDocument({ margin: 50 });

    // ✅ НЕ НУЖНО fontkit
    const fontPath = path.join(__dirname, '../assets/fonts/RobotoSlab-Regular.ttf');
    if (!fs.existsSync(fontPath)) {
        throw new Error('RobotoSlab-Regular.ttf не найден. Поместите его в /services/assets/fonts/');
    }

    doc.registerFont('RobotoSlab', fontPath);
    doc.font('RobotoSlab');

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Заголовок
    doc.fontSize(20).text(test.title, { align: 'center' });
    doc.moveDown(1.5);

    // Вопросы и ответы
    test.questions.forEach((q, index) => {
        doc.fontSize(14).text(`${index + 1}. ${q.question}`);
        doc.moveDown(0.3);

        if (Array.isArray(q.options)) {
            q.options.forEach((option, i) => {
                const letter = String.fromCharCode(65 + i);
                doc.fontSize(12).text(`   ${letter}) ${option}`);
            });
        }

        doc.moveDown();
    });

    doc.end();

    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', (err) => reject(err));
    });
}

module.exports = { generatePdfFromTest };
