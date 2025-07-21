const { GoogleGenerativeAI } = require('@google/generative-ai');
const Summary = require('../../models/Summary');
const Test = require('../../models/Test');
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

async function generateTestFromText(text, userId, originalFileName, options = {}, userPrompt = null) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

  options = {
    difficulty: 'medium',
    questionCount: 5,
    questionType: 'тест с выбором',
    testType: 'normal',
    ...options,
  };

  // 1. Извлечение параметров, если есть userPrompt
  if (userPrompt) {
    const extractPrompt = `
Ты помощник, который извлекает параметры генерации теста из пользовательского запроса.
Верни JSON с полями:
- subject: тема
- questionCount: количество вопросов
- difficulty: easy | medium | hard
- optionsCount: число вариантов ответа (по умолчанию 4)
- questionLength: short | long

Запрос: "${userPrompt}"
    `;

    try {
      const extraction = await model.generateContent({
        contents: [{ parts: [{ text: extractPrompt }] }],
      });

      const extractedText = extraction.response.text().replace(/```json|```/g, '').trim();
      const extracted = JSON.parse(extractedText);

      options.difficulty = extracted.difficulty || options.difficulty;
      options.questionCount = extracted.questionCount || options.questionCount;

      if (!text) {
        const genTextPrompt = `
Создай учебный материал по теме "${extracted.subject}" для генерации теста. Объём — 1–2 абзаца, чтобы ИИ мог на его основе составить тест.
        `;
        const genTextRes = await model.generateContent({
          contents: [{ parts: [{ text: genTextPrompt }] }],
        });

        text = genTextRes.response.text().trim();
      }
    } catch (err) {
      console.error("Ошибка парсинга параметров из промпта:", err.message);
      throw new Error("Не удалось извлечь параметры из пользовательского запроса.");
    }
  }

  // 2. Проверка, есть ли текст
  if (!text) {
    throw new Error("Не передан ни текст, ни запрос для генерации учебного материала");
  }

  // 3. Генерация теста
  const testGenPrompt = `
Прочитай следующий учебный материал и составь тест в формате JSON. Учитывай параметры:
- Сложность: ${options.difficulty}
- Кол-во вопросов: ${options.questionCount}
- Тип вопросов: ${options.questionType}
- Тип теста: ${options.testType}

Формат:
{
  "title": "Тема теста",
  "questions": [
    {
      "question": "Вопрос",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 1,
      "topic": "Тема вопроса"
    }
  ]
}

Учебный материал:
---
${text}
  `;

  const result = await model.generateContent({
    contents: [{ parts: [{ text: testGenPrompt }] }],
  });

  const raw = result.response.text().trim().replace(/```json|```/g, '');

  let parsed;
  try {
    parsed = JSON.parse(raw);
    parsed.questions = parsed.questions.map(q => ({
      ...q,
      topic: q.topic || 'Общая тема',
    }));
  } catch (err) {
    console.error('Ошибка парсинга JSON:', err.message);
    console.error('Ответ от Gemini:', raw);
    throw new Error('Ответ ИИ не является валидным JSON');
  }

  const newTest = await Test.create({
    owner: userId,
    originalFileName: originalFileName || "generated-from-prompt",
    title: parsed.title,
    questions: parsed.questions,
    difficulty: options.difficulty,
    questionCount: options.questionCount,
    sourceType: text && userPrompt ? 'file+prompt' : (text ? 'file' : 'prompt'),
    sourceDetails: userPrompt || originalFileName,
    testType: options.testType,
  });

  return newTest;
}

async function splitTextIntoThemes(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

  const prompt = `
Раздели следующий текст на отдельные темы для учебного курса.
Верни результат в JSON:
[
  {
    "title": "Название темы",
    "content": "Текст по этой теме"
  }
]

Текст:
---
${text}
  `;

  const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });
  const raw = result.response.text().trim();

  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '');
  return JSON.parse(cleaned);
}

module.exports = {
  generateSummaryFromText,
  generateTestFromText,
  splitTextIntoThemes,
}



