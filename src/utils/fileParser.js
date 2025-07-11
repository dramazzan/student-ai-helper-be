const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function parseFile(filePath) {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post('http://localhost:8000/parse', form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    const text = response.data.text;

    if (!text || !text.trim()) {
      throw new Error('Файл не содержит текста');
    }

    return text.trim();
  } catch (error) {
    throw new Error('Ошибка при парсинге через Unstructured: ' + error.message);
  }
}

module.exports = { parseFile };
