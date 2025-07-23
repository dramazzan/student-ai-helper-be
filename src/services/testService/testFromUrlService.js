const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Test = require('../../models/Test');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🔧 Скачиваем HTML и парсим через Unstructured
async function extractTextFromUrlWithUnstructured(url) {
    try {
        // 1. Скачиваем HTML
        const response = await axios.get(url);
        const html = response.data;

        // 2. Сохраняем как временный .html файл
        const tempPath = path.join(__dirname, 'temp-url-content.html');
        fs.writeFileSync(tempPath, html, 'utf8');

        // 3. Отправляем в Unstructured
        const form = new FormData();
        form.append('files', fs.createReadStream(tempPath)); // Изменено с 'file' на 'files'
        form.append('strategy', 'fast');
        form.append('output_format', 'application/json'); // Добавлен параметр

        const parsed = await axios.post('http://unstructured:8000/general/v0/general', form, {
            headers: {
                ...form.getHeaders(),
                'Accept': 'application/json'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 30000 // Добавлен таймаут
        });

        // 4. Удаляем временный файл
        fs.unlinkSync(tempPath);

        // 5. ИСПРАВЛЕНО: Обработка ответа от Unstructured
        const elements = parsed.data;

        console.log('🔍 Ответ от Unstructured:', JSON.stringify(elements, null, 2));

        if (!Array.isArray(elements) || elements.length === 0) {
            throw new Error('Unstructured вернул пустой массив или неправильный формат');
        }

        // Извлекаем текст из всех элементов
        const text = elements
            .filter(element => element.text && element.text.trim())
            .map(element => element.text.trim())
            .join('\n\n');

        if (!text || !text.trim()) {
            throw new Error('Unstructured не вернул текст');
        }

        console.log('✅ Извлеченный текст (первые 200 символов):', text.substring(0, 200) + '...');

        return text.trim();
    } catch (err) {
        console.error('❌ Детали ошибки Unstructured:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
        });
        throw new Error('Ошибка при обработке URL через Unstructured: ' + err.message);
    }
}

// 🧠 Основной сервис генерации теста из URL
async function generateTestFromURL(url, userId, originalURL, options = {}) {
    const text = await extractTextFromUrlWithUnstructured(url);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

    const {
        difficulty = 'medium',
        questionCount = 5,
        questionType = 'тест с выбором',
        testType = 'normal',
    } = options;

    const prompt = `
Прочитай следующий учебный материал и составь тест в формате JSON. 

СТРОГО СОБЛЮДАЙ СЛЕДУЮЩИЕ ПАРАМЕТРЫ:
- Сложность: ${difficulty}
- Количество вопросов: ОБЯЗАТЕЛЬНО ${questionCount} вопросов (не больше, не меньше)
- Тип вопросов: ${questionType}
- Тип теста: ${testType}

ТРЕБОВАНИЯ К ТЕСТУ:
1. Создай ТОЧНО ${questionCount} вопросов
2. Каждый вопрос должен иметь:
   - question: текст вопроса
   - options: массив из 3–4 вариантов ответа
   - correctAnswer: индекс правильного варианта ответа (начиная с 0)
   - topic: тема вопроса

СТРУКТУРА JSON:
{
  "title": "название темы",
  "questions": [
    // МАССИВ ДОЛЖЕН СОДЕРЖАТЬ РОВНО ${questionCount} ЭЛЕМЕНТОВ
  ]
}

❗ КРИТИЧЕСКИ ВАЖНО: 
- Создай ИМЕННО ${questionCount} вопросов
- Верни только JSON без форматирования
- Не используй \`\`\`json или другие блоки
- Просто чистый JSON

Учебный материал:
---
${text}
`;

    const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const raw = response.text();

    console.log('🔍 Сырой ответ от Gemini:', raw);

    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        const parsed = JSON.parse(cleaned);

        // Проверяем количество вопросов
        if (parsed.questions.length !== questionCount) {
            console.warn(`⚠️ Gemini создал ${parsed.questions.length} вопросов вместо ${questionCount}`);

            // Обрезаем или дополняем вопросы до нужного количества
            if (parsed.questions.length > questionCount) {
                parsed.questions = parsed.questions.slice(0, questionCount);
            } else if (parsed.questions.length < questionCount) {
                // Если вопросов меньше, повторяем последние
                const lastQuestion = parsed.questions[parsed.questions.length - 1];
                while (parsed.questions.length < questionCount) {
                    parsed.questions.push({
                        ...lastQuestion,
                        question: `${lastQuestion.question} (дополнительный вопрос ${parsed.questions.length + 1})`
                    });
                }
            }
        }

        parsed.questions = parsed.questions.map((q) => ({
            ...q,
            topic: q.topic || 'Общая тема',
        }));

        console.log('✅ Финальное количество вопросов:', parsed.questions.length);

        const newTest = await Test.create({
            owner: userId,
            originalFileName: originalURL,
            title: parsed.title,
            questions: parsed.questions,
            sourceType: 'url',
            sourceDetails: originalURL,
            difficulty: options.difficulty || 'medium',
            questionCount: options.questionCount || parsed.questions.length,
            testType: options.testType || 'normal',
        });

        return newTest;
    } catch (err) {
        console.error('Ошибка парсинга JSON:', err.message);
        console.error('Ответ от Gemini:', raw);
        throw new Error('Ответ ИИ не является валидным JSON');
    }
}

module.exports = {
    generateTestFromURL,
};