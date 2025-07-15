const TestResult = require('../models/TestResult');
const Test = require('../models/Test');

exports.getTestResult = async (req, res) => {
    try {
        const testResultId = req.params.id;
        const userId = req.user._id;

        const testResult = await TestResult.findById(testResultId);
        if (!testResult) return res.status(404).json({ message: 'Результат теста не найден' });

        if (testResult.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Нет доступа к результату этого теста' });
        }

        const test = await Test.findById(testResult.testId);
        if (!test) return res.status(404).json({ message: 'Оригинальный тест не найден' });

        const detailedResults = testResult.answers.map(answer => {
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

        res.status(200).json({
            testTitle: test.title,
            score: testResult.score,
            totalQuestions: test.questions.length,
            percentage,
            details: detailedResults,
            completedAt: testResult.createdAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения результата теста' });
    }
};
