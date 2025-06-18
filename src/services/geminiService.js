const { GoogleGenerativeAI } = require('@google/generative-ai');
const Summary = require('../models/Summary');
const Test = require('../models/Test');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSummaryFromText(text, userId, originalFileName) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

  const prompt = `Прочитай этот учебный материал и составь краткий конспект на понятном языке.\n\n${text}`;

  const result = await model.generateContent({
    contents: [{ parts: [{ text: prompt }] }],
  });

  const response = await result.response;
  const summaryText = response.text().trim();

  await Summary.create({
    owner: userId,
    originalFileName,
    content: summaryText,
  });

  return summaryText;
}

async function generateTestFromText(text, userId, originalFileName, options = {}) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

  const {
    difficulty = 'средний',           // лёгкий | средний | сложный
    questionCount = 5,                // количество вопросов
    questionType = 'тест с выбором',  // можно в будущем: открытые, с одним выбором, с несколькими и т.д.
  } = options;

  const prompt = `
Прочитай следующий учебный материал и составь тест в формате JSON. Учитывай следующие параметры:
- Сложность: ${difficulty}
- Количество вопросов: ${questionCount}
- Тип вопросов: ${questionType}

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

  const cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

  try {
    const parsed = JSON.parse(cleaned);

    parsed.questions = parsed.questions.map(q => ({
      ...q,
      topic: q.topic || 'Общая тема',
    }));

    const newTest = await Test.create({
      owner: userId,
      originalFileName,
      title: parsed.title,
      questions: parsed.questions,
      difficulty: parsed.difficulty,
      questionCount: parsed.questionCount,
    });

    return newTest;
  } catch (err) {
    console.error('Ошибка парсинга JSON:', err.message);
    console.error('Ответ от Gemini:', raw);
    throw new Error('Ответ ИИ не является валидным JSON');
  }
}

module.exports = {
  generateSummaryFromText,
  generateTestFromText,
};
