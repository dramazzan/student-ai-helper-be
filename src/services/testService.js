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

module.exports = {
    evaluateTest,
};
