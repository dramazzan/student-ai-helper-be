const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { htmlToText } = require('html-to-text');
const Summary = require('../../models/Summary');
const Test = require('../../models/Test');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function fetchTextFromURL(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const text = htmlToText(html, {
            wordwrap: false,
            selectors: [
                { selector: 'a', options: { ignoreHref: true } },
                { selector: 'img', format: 'skip' },
            ],
        });
        return text;
    } catch (err) {
        throw new Error('Не удалось получить содержимое страницы: ' + err.message);
    }
}

async function testFromUrlService(url, userId, originalURL, options = {}) {
    const text = await fetchTextFromURL(url);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

    const {
        difficulty = 'medium',
        questionCount = 5,
        questionType = 'тест с выбором',
        testType = 'normal',
    } = options;

    const prompt = `
Прочитай следующий учебный материал и составь тест в формате JSON. Учитывай следующие параметры:
- Сложность: ${difficulty}
- Количество вопросов: ${questionCount}
- Тип вопросов: ${questionType}
- Тип теста: ${testType}

Тест должен содержать:
- title: название темы
- questions: массив с вопросами, каждый из которых имеет:
  - question: текст вопроса
  - options: массив из 3–4 вариантов ответа
  - correctAnswer: индекс правильного варианта ответа (начиная с 0)
  - topic: тема вопроса

❗ ВАЖНО: Верни только JSON без форматирования, без обрамления в \`\`\`json или другие блоки. Просто JSON.

Учебный материал:
---
${text}
`;

    const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const raw = response.text();

    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        const parsed = JSON.parse(cleaned);

        parsed.questions = parsed.questions.map(q => ({
            ...q,
            topic: q.topic || 'Общая тема',
        }));

        const newTest = await Test.create({
            owner: userId,
            originalFileName: originalURL,
            title: parsed.title,
            questions: parsed.questions,
            sourceType: 'url',
            sourceDetails: originalURL,
            difficulty,
            questionCount,
            testType,
        });

        return newTest;
    } catch (err) {
        console.error('Ошибка парсинга JSON:', err.message);
        console.error('Ответ от Gemini:', raw);
        throw new Error('Ответ ИИ не является валидным JSON');
    }
}

module.exports = {
    generateTestFromURL: testFromUrlService,
};
