const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const { generateSummaryFromText } = require('./testService/geminiService');

async function analyzeWeakTopicsWithSummaries(resultId, userId) {
    const result = await TestResult.findById(resultId);
    if (!result) throw new Error('Результат не найден');
    if (result.userId.toString() !== userId.toString()) throw new Error('Нет доступа');

    const test = await Test.findById(result.testId);
    if (!test) throw new Error('Тест не найден');

    const topicStats = {};
    const topicTexts = {};

    for (const answer of result.answers) {
        const question = test.questions.find(q => q._id.toString() === answer.questionId);
        if (!question) continue;

        const topic = question.topic || 'Общая тема';
        const isCorrect = answer.selectedAnswer === question.correctAnswer;

        if (!isCorrect) {
            topicStats[topic] = (topicStats[topic] || 0) + 1;
            topicTexts[topic] = (topicTexts[topic] || '') + '\n' + question.question;
        }
    }

    const weakTopics = Object.entries(topicStats)
        .map(([topic]) => topic);


    const recommendations = [];
    for (const topic of weakTopics) {
        const summary = await generateSummaryFromText(topicTexts[topic], userId, `topic-${topic}`);
        recommendations.push({ topic, summary });
    }

    return recommendations;
}

module.exports = { analyzeWeakTopicsWithSummaries };
