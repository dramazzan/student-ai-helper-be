const { generateTestsFromWeakTopics } = require('../../services/testService/generateTestsFromWeakTopics');

async function generateFromWeakTopicsController(req, res) {
    try {
        const userId = req.user.id || req.user._id;
        const options = req.body.options || {};

        const tests = await generateTestsFromWeakTopics(userId, options);

        if (!tests.length) {
            return res.status(400).json({ message: 'Не удалось сгенерировать тесты по слабым темам', tests: [] });
        }

        res.status(201).json({ message: 'Сгенерировано тестов: ' + tests.length, tests });
    } catch (err) {
        console.error('Ошибка генерации по слабым темам:', err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = { generateFromWeakTopicsController };
