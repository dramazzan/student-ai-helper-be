const { GoogleGenerativeAI } = require('@google/generative-ai');
const Test = require('../../models/Test');
const { analyzeStudentPerformance } = require('../analyticsService');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateTestsFromWeakTopics(userId, options = {}) {
    const {
        difficulty = 'medium',
        questionCount = 5,
        questionType = 'тест с выбором',
        testType = 'normal',
    } = options;

    const analysis = await analyzeStudentPerformance(userId);

    if (!analysis.weakTopics || analysis.weakTopics.length === 0) {
        throw new Error('Слабые темы не найдены');
    }

    console.log("👀 Слабые темы:", analysis.weakTopics);


    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
    const createdTests = [];

    for (const { topic } of analysis.weakTopics) {
        const prompt = `
Составь тест в формате JSON на тему "${topic}". Учитывай следующие параметры:
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

❗ ВАЖНО: Верни только JSON без форматирования, без обрамления в \`\`\`.

Тема:
---
${topic}
    `;

        const result = await model.generateContent({
            contents: [{ parts: [{ text: prompt }] }],
        });

        const response = await result.response;
        const raw = response.text().trim();
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '');

        try {
            const parsed = JSON.parse(cleaned);

            parsed.questions = parsed.questions.map(q => ({
                ...q,
                topic: q.topic || topic,
            }));

            const newTest = await Test.create({
                owner: userId,
                originalFileName: topic,
                title: parsed.title || topic,
                questions: parsed.questions,
                difficulty,
                questionCount,
                sourceType: 'weak-topic',
                sourceDetails: topic,
                testType,
            });

            createdTests.push(newTest);
        } catch (err) {
            console.error(`Ошибка генерации теста по теме "${topic}":`, err.message);
        }
    }

    return createdTests;
}

module.exports = { generateTestsFromWeakTopics };
