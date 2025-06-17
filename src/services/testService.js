const Test = require('../models/Test');
const TestResult = require('../models/TestResult');

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

    const result = await TestResult.create({
        testId,
        userId,
        answers: detailedAnswers,
        score,
    });

    return { score, total: test.questions.length, result };
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

module.exports = {
    evaluateTest,
    getTestResult,
};
