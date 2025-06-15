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
  const summaryText = response.text();

  await Summary.create({
    owner: userId,
    originalFileName,
    content: summaryText,
  });

  return summaryText;
}

// 🧪 Генерация и сохранение теста
async function generateTestFromText(text, userId, originalFileName) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

  const prompt = `Прочитай следующий учебный материал и составь тест в формате JSON. 
Тест должен содержать:
- title: название темы
- questions: массив с вопросами, каждый из которых имеет:
  - question: текст вопроса
  - options: массив из 3–4 вариантов ответа
  - correctAnswer: индекс правильного варианта ответа (начиная с 0)

Верни только JSON без лишнего текста.

Учебный материал:
---
${text}
`;

  const result = await model.generateContent({
    contents: [{ parts: [{ text: prompt }] }],
  });

  const response = await result.response;
  const raw = response.text();

  try {
    const parsed = JSON.parse(raw);

    const newTest = await Test.create({
      owner: userId,
      originalFileName,
      title: parsed.title,
      questions: parsed.questions,
    });

    return newTest;
  } catch (err) {
    console.error('Ошибка парсинга JSON:', err.message);
    throw new Error('Ответ ИИ не является валидным JSON');
  }
}

module.exports = {
  generateSummaryFromText,
  generateTestFromText,
};
