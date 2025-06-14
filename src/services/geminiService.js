const { GoogleGenerativeAI } = require('@google/generative-ai');
const Summary = require('../models/Summary');
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

  // ⬇️ Сохраняем в MongoDB
  await Summary.create({
    owner: userId,
    originalFileName,
    content: summaryText,
  });

  return summaryText;
}

module.exports = { generateSummaryFromText };
