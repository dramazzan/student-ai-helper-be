const fs = require('fs');
const path = require('path');

async function generateGiftFromTest(test, fileName) {
    const lines = [];

    test.questions.forEach((q) => {
        lines.push(`${q.question} {`);
        q.options.forEach((option) => {
            const prefix = option === q.correctAnswer ? '=' : '~';
            lines.push(`${prefix}${option}`);
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
