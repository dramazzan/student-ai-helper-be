const TestResult = require('../models/TestResult');
const Test = require('../../models/Test');

async function getTestResult(testResultId, userId) {
    const testResult = await TestResult.findById(testResultId);
    if (!testResult) throw new Error('Результат теста не найден');
    if (testResult.userId.toString() !== userId.toString()) throw new Error('Нет доступа к этому результату');

    const test = await Test.findById(testResult.testId);
    if (!test) throw new Error('Оригинальный тест не найден');

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

async function deleteTestById(testId, userId) {
    const test = await Test.findOneAndDelete({ _id: testId, owner: userId });

    if (!test) {
        throw new Error('Тест не найден или вы не имеете прав на его удаление.');
    }

    return { message: 'Тест успешно удалён.', deletedTestId: testId };
}


module.exports = { getTestResult, deleteTestById };
