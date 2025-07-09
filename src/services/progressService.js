const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const mongoose = require('mongoose');


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
        testId: test._id,
        score: result.score,
        total: questions.length,
        percentage,
        details,
        completedAt: result.createdAt,
    };
}



async function getAllTestResults(testId, userId) {
    if (!mongoose.Types.ObjectId.isValid(testId)) {
        throw new Error('Неверный ID теста');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Неверный ID пользователя');
    }

    const test = await Test.findById(testId);
    if (!test) {
        throw new Error('Тест не найден');
    }

    const results = await TestResult.find({ userId, testId }).sort({ createdAt: -1 });

    if (!results || results.length === 0) {
        return {
            testTitle: test.title,
            attempts: []
        };
    }

    const detailedResults = results.map(result => {
        const detailedAnswers = result.answers.map(answer => {
            const question = test.questions.find(q => q._id.toString() === answer.questionId);

            return {
                question: question?.question || 'Вопрос не найден',
                options: question?.options || [],
                selectedAnswerIndex: answer.selectedAnswer,
                selectedAnswerText: question?.options[answer.selectedAnswer] || '',
                correctAnswerIndex: question?.correctAnswer,
                correctAnswerText: question?.options[question.correctAnswer] || '',
                isCorrect: answer.selectedAnswer === question?.correctAnswer
            };
        });

        const percentage = Math.round((result.score / test.questions.length) * 100);

        return {
            resultId: result._id,
            score: result.score,
            totalQuestions: test.questions.length,
            percentage,
            details: detailedAnswers,
            completedAt: result.createdAt
        };
    });

    return {
        testTitle: test.title,
        attempts: detailedResults
    };
}


module.exports = { getOverallProgress, getTestProgress , getAllTestResults};
