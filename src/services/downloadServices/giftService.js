const fs = require('fs');
const path = require('path');

async function generateGiftFromTest(test, fileName) {
    const lines = [];

    test.questions.forEach((q, index) => {
        lines.push(`::Q${index + 1}:: ${q.question} {`);

        (q.options || []).forEach((option, i) => {
            const prefix = i === q.correctAnswer ? '=' : '~';
            // Экранирование фигурных скобок и кавычек
            const safeOption = option.replace(/[{}]/g, '').replace(/"/g, '\"');
            lines.push(`${prefix}${safeOption}`);
        });

        lines.push('}\n');
    });

    const content = lines.join('\n');

    const downloadsDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

    const filePath = path.join(downloadsDir, fileName);
    fs.writeFileSync(filePath, content, 'utf-8');

    return filePath;
}

module.exports = { generateGiftFromTest };
