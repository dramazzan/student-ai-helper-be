const path = require('path');
const fs = require('fs');

const uploadsPath = path.join(__dirname, '..', '..', 'uploads');

function clearUploadsFolder() {
    fs.readdir(uploadsPath, (err, files) => {
        if (err) {
            console.error('Ошибка чтения папки uploads:', err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(uploadsPath, file);

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Ошибка удаления файла:', filePath, err);
                } else {
                    console.log('Файл удалён:', filePath);
                }
            });
        });
    });
}

clearUploadsFolder();

setInterval(clearUploadsFolder, 10*10);
