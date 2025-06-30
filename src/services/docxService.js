// src/services/docxService.js
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun } = require('docx');

async function generateDocxFromTest(test, fileName) {
    const paragraphs = [];

    paragraphs.push(
        new Paragraph({
            children: [new TextRun({ text: test.title, bold: true, size: 32 })],
            spacing: { after: 300 },
        })
    );

    test.questions.forEach((q, index) => {
        paragraphs.push(new Paragraph({ text: `${index + 1}. ${q.question}`, spacing: { after: 200 } }));

        q.options.forEach((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            paragraphs.push(new Paragraph(`   ${letter}) ${opt}`));
        });

        paragraphs.push(new Paragraph(''));
    });

    const doc = new Document({
        creator: 'Student AI Helper',
        title: test.title,
        description: 'Сгенерированный тест',
        sections: [
            {
                children: paragraphs,
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);

    const filePath = path.join(__dirname, '../../downloads', fileName);
    fs.writeFileSync(filePath, buffer);

    return filePath;
}

module.exports = { generateDocxFromTest };
