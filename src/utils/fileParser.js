const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

async function parseFile(filePath) {
  try {
    const form = new FormData();
    form.append('files', fs.createReadStream(filePath)); // Изменено с 'file' на 'files'
    form.append('strategy', 'fast');
    form.append('output_format', 'application/json'); // Добавлен параметр

    const response = await axios.post(`http://unstructured:8000/general/v0/general`, form, {
      headers: {
        ...form.getHeaders(),
        'Accept': 'application/json' // Добавлен заголовок
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 30000 // Добавлен таймаут 30 секунд
    });

    // ИСПРАВЛЕНО: Обработка ответа от Unstructured API
    const elements = response.data;

    console.log('🔍 Ответ от Unstructured для файла:', JSON.stringify(elements, null, 2));

    if (!Array.isArray(elements) || elements.length === 0) {
      throw new Error('Unstructured вернул пустой массив или неправильный формат');
    }

    // Извлекаем текст из всех элементов
    const text = elements
        .filter(element => element.text && element.text.trim())
        .map(element => element.text.trim())
        .join('\n\n');

    if (!text || !text.trim()) {
      throw new Error('Файл не содержит текста');
    }

    console.log('✅ Извлеченный текст из файла (первые 200 символов):', text.substring(0, 200) + '...');

    return text.trim();
  } catch (error) {
    console.error('❌ Детали ошибки при парсинге файла:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      filePath: filePath
    });
    throw new Error('Ошибка при парсинге через Unstructured: ' + error.message);
  }
}

module.exports = { parseFile };