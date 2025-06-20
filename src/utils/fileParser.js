const fs = require('fs');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const path = require('path');

async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.docx') {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  throw new Error('Неподдерживаемый формат файла');
}

module.exports = { parseFile };
