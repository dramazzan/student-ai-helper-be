const TestResult = require('../models/TestResult');
const Test = require('../models/Test');
const Summary = require('../models/Summary');

async function analyzeStudentPerformance(userId) {
    const results = await TestResult.find({ userId }).sort({ createdAt: -1 });
    if (results.length === 0) {
        return {
            message: 'Нет данных для анализа',
        };
    }

    let totalScore = 0;
    let totalQuestions = 0;
    const topicStats = {};
    const weakTests = [];

    for (const result of results) {
        const test = await Test.findById(result.testId);
        if (!test) continue;

        totalScore += result.score;
        totalQuestions += test.questions.length;

        if ((result.score / test.questions.length) * 100 < 60) {
            weakTests.push({
                title: test.title,
                score: result.score,
                total: test.questions.length,
                date: result.createdAt,
            });
        }

        for (const answer of result.answers) {
            const question = test.questions.find(q => q._id.toString() === answer.questionId);
            if (!question) continue;

            const topic = question.topic || 'Общая тема';
            const isCorrect = answer.selectedAnswer === question.correctAnswer;

            if (!isCorrect) {
                topicStats[topic] = topicStats[topic] || { mistakes: 0 };
                topicStats[topic].mistakes++;
            }
        }
    }

    const weakTopics = Object.entries(topicStats)
        .filter(([_, data]) => data.mistakes >= 2)
        .map(([topic, data]) => ({
            topic,
            mistakes: data.mistakes,
            recommendation: `Повтори материал по теме: ${topic}`,
        }));

    const averageScore = Math.round((totalScore / totalQuestions) * 100);
    const progressPercent = Math.min(100, Math.round((results.length / 20) * 100)); // из 20 тестов

    const message = averageScore > 80
        ? 'Отличная работа! Продолжай в том же духе.'
        : averageScore > 50
            ? 'Хорошо, но есть куда расти. Обрати внимание на слабые темы.'
            : 'Не сдавайся! Учёба — это процесс. Повтори слабые темы.';

    return {
        totalTestsTaken: results.length,
        averageScore,
        progressPercent,
        weakTopics,
        lowScoreTests: weakTests,
        motivation: message,
    };
}

module.exports = { analyzeStudentPerformance };
