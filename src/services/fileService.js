const fs = require('fs');
const path = require('path');

function scheduleFileDeletion(filename, delay = 2 * 60 * 1000) {
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    setTimeout(() => {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Ошибка удаления файла:', filePath, err);
            else console.log('Файл удалён:', filePath);
        });
    }, delay);
}

module.exports = { scheduleFileDeletion };
