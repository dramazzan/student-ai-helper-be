const Test = require('../../models/Test');
const TestResult = require('../../models/TestResult');

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

module.exports = { evaluateTest };
