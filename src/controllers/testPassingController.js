const { evaluateTest } = require('../services/testService/testEvaluationService');

exports.submitTest = async (req, res) => {
    try {
        const { testId, answers } = req.body;
        const userId = req.user._id;

        const evaluation = await evaluateTest(testId, userId, answers);

        res.status(200).json({
            message: 'Тест завершен',
            score: evaluation.score,
            total: evaluation.total,
            resultId: evaluation.result._id,
        });
    } catch (error) {
        console.error('Ошибка при прохождении теста:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
