const TestResult = require('../models/TestResult');
const Test = require('../models/Test');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeStudentPerformance(userId) {
    const results = await TestResult.find({ userId }).populate('testId');

    if (!results.length) throw new Error('Нет данных о тестах пользователя');

    const data = results.map(r => {
        return `Тест: ${r.testId.title}, Оценка: ${r.score}/${r.testId.questions.length}`;
    }).join('\n');

    const prompt = `У ученика есть следующие результаты:\n${data}\n\nКакие темы он знает хорошо, а какие плохо? Что ему стоит повторить? Дай советы, основываясь только на этих данных.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
    const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });

    return result.response.text().trim();
}

module.exports = { analyzeStudentPerformance };