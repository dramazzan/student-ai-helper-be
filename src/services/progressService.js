const Test = require('../models/Test');
const TestResult = require('../models/TestResult');

async function getOverallProgress(userId) {
    const results = await TestResult.find({ userId });

    if (results.length === 0) return { average: 0, testsTaken: 0 };

    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const totalQuestions = results.reduce((sum, r) => sum + r.answers.length, 0);

    const average = Math.round((totalScore / totalQuestions) * 100);

    return {
        average,
        testsTaken: results.length,
    };
}

async function getTestProgress(resultId, userId) {
    const result = await TestResult.findById(resultId);
    if (!result) throw new Error('Результат не найден');
    if (result.userId.toString() !== userId.toString()) throw new Error('Нет доступа');

    const test = await Test.findById(result.testId);
    if (!test) throw new Error('Тест не найден');

    const questions = test.questions;

    const details = result.answers.map(answer => {
        const question = questions.find(q => q._id.toString() === answer.questionId);
        return {
            question: question?.question || 'Вопрос не найден',
            selected: answer.selectedAnswer,
            correct: question?.correctAnswer,
            isCorrect: answer.selectedAnswer === question?.correctAnswer,
        };
    });

    const percentage = Math.round((result.score / questions.length) * 100);

    return {
        testTitle: test.title,
        score: result.score,
        total: questions.length,
        percentage,
        details,
        completedAt: result.createdAt,
    };
}

module.exports = { getOverallProgress, getTestProgress };
