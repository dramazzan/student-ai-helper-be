// services/docxService.js
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun } = require('docx');

async function generateDocxFromTest(test, fileName) {
    const paragraphs = [];

    // Заголовок
    paragraphs.push(
        new Paragraph({
            children: [new TextRun({ text: test.title, bold: true, size: 36 })],
            spacing: { after: 300 },
        })
    );

    // Вопросы и варианты
    test.questions.forEach((q, index) => {
        paragraphs.push(
            new Paragraph({
                text: `${index + 1}. ${q.question}`,
                spacing: { after: 200 },
            })
        );

        q.options.forEach((option, i) => {
            const letter = String.fromCharCode(65 + i);
            paragraphs.push(
                new Paragraph({
                    text: `   ${letter}) ${option}`,
                    spacing: { after: 100 },
                })
            );
        });

        paragraphs.push(new Paragraph('')); // Пустая строка между вопросами
    });

    // Создание документа
    const doc = new Document({
        creator: 'Student AI Helper',
        title: test.title,
        description: 'Сгенерированный тест',
        sections: [{ children: paragraphs }],
    });

    const buffer = await Packer.toBuffer(doc);

    const downloadsDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const filePath = path.join(downloadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return filePath;
}

module.exports = { generateDocxFromTest };
