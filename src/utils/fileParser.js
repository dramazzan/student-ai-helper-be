const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.docx') {
    try {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('DOCX не содержит текста');
      }
      return result.value.trim();
    } catch (error) {
      throw new Error('Ошибка чтения DOCX: ' + error.message);
    }
  }

  if (ext === '.pdf') {
    try {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('PDF не содержит читаемого текста');
      }
      return data.text.trim();
    } catch (error) {
      throw new Error('Ошибка чтения PDF: ' + error.message);
    }
  }

  throw new Error('Неподдерживаемый формат файла: ' + ext);
}

module.exports = { parseFile };
