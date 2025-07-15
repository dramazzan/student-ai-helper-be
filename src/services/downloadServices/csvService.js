const fs = require('fs');
const path = require('path');

async function generateCsvFromTest(test, fileName) {
    const downloadsDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const filePath = path.join(downloadsDir, fileName);

    const rows = [];

    // Заголовок таблицы
    rows.push([
        'Question',
        'Option A',
        'Option B',
        'Option C',
        'Option D',
        'Correct Answer'
    ].join(','));

    test.questions.forEach((q) => {
        const opts = q.options || [];

        // Безопасное экранирование CSV
        const safeOption = (v) => {
            const str = (v ?? '').toString();
            return `"${str.replace(/"/g, '""')}"`;
        };

        // Получаем индекс правильного ответа
        const correctIndex = typeof q.correctAnswer === 'object' && q.correctAnswer.$numberInt
            ? parseInt(q.correctAnswer.$numberInt, 10)
            : q.correctAnswer;

        const correctText = opts[correctIndex] ?? '';

        const row = [
            safeOption(q.question),
            safeOption(opts[0]),
            safeOption(opts[1]),
            safeOption(opts[2]),
            safeOption(opts[3]),
            safeOption(correctText)
        ];

        rows.push(row.join(','));
    });

    fs.writeFileSync(filePath, rows.join('\n'), 'utf-8');
    return filePath;
}

module.exports = { generateCsvFromTest };
