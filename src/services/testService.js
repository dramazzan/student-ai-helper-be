const Test = require('../models/Test');
const TestModule = require('../models/TestModule');
const TestResult = require('../models/TestResult');
const mongoose = require('mongoose');

async function evaluateTest(testId, userId, userAnswers) {
    const test = await Test.findById(testId);
    if (!test) throw new Error('Тест не найден');

    let score = 0;
    const detailedAnswers = [];

    for (const question of test.questions) {
        const userAnswer = userAnswers.find(a => a.questionId === question._id.toString());
        const selectedAnswer = userAnswer?.selectedAnswer;
        const isCorrect = selectedAnswer === question.correctAnswer;

        if (isCorrect) score++;

        detailedAnswers.push({
            questionId: question._id,
            selectedAnswer,
        });
    }

    const percentage = (score / test.questions.length) * 100;
    const isPassed = percentage >= 70;

    const result = await TestResult.create({
        testId,
        userId,
        answers: detailedAnswers,
        score,
        isPassed,
    });

    return { score, total: test.questions.length, percentage, isPassed, result };
}

async function getTestResult(testResultId, userId) {
    const testResult = await TestResult.findById(testResultId);

    if (!testResult) {
        throw new Error('Результат теста не найден');
    }

    if (testResult.userId.toString() !== userId.toString()) {
        throw new Error('Нет доступа к этому результату');
    }

    const test = await Test.findById(testResult.testId);

    if (!test) {
        throw new Error('Оригинальный тест не найден');
    }

    const detailedResults = testResult.answers.map((answer) => {
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

    const percentage = Math.round((testResult.score / test.questions.length) * 100);

    return {
        testTitle: test.title,
        score: testResult.score,
        totalQuestions: test.questions.length,
        percentage,
        details: detailedResults,
        completedAt: testResult.createdAt
    };
}

async function getNormalTestsByUser(userId) {
    return await Test.find({ owner: userId, testType: 'normal' }).sort({ createdAt: -1 });
}

async function getMultiTestsByUser(userId) {
    return await Test.find({ owner: userId, testType: 'multi' }).sort({ createdAt: -1 });
}


async function getTestsByModuleId(moduleId) {
    return await Test.find({ moduleId, testType: 'multi' }).sort({ createdAt: -1 });
}

async function getTestModules(userId) {
    return await TestModule.find({ owner: userId });
}


async function getTestById(testId, userId) {
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

    if (!test.owner.equals(userId)) {
        throw new Error('Нет доступа к этому тесту');
    }

    return test;
}




async function getPassedPercentageByModule(moduleId, userId) {
    const tests = await Test.find({ moduleId, testType: 'multi' });
    if (!tests.length) return { total: 0, passed: 0, percentage: 0 };

    const testIds = tests.map(test => test._id);

    const results = await TestResult.find({ testId: { $in: testIds }, userId });

    const passedTestIds = new Set(
        results.filter(r => r.isPassed).map(r => r.testId.toString())
    );

    const total = testIds.length;
    const passed = passedTestIds.size;

    return {
        total,
        passed,
        percentage: Math.round((passed / total) * 100)
    };
}




module.exports = {
    evaluateTest,
    getTestResult,
    getNormalTestsByUser,
    getMultiTestsByUser,
    getTestsByModuleId,
    getTestModules,
    getTestById,
    getPassedPercentageByModule,
};


