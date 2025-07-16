const { generateTestFromURL } = require('../../services/testService/testFromUrlService');

async function generateTestFromUrlController(req, res) {
    try {
        const { url, difficulty, questionCount, questionType, testType } = req.body;
        const userId = req.user?.id || req.user?._id;

        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'URL обязателен и должен быть строкой' });
        }

        const options = {
            difficulty: difficulty || 'medium',
            questionCount: questionCount || 5,
            questionType: questionType || 'тест с выбором',
            testType: testType || 'normal',
        };

        const test = await generateTestFromURL(url, userId, url, options);
        return res.status(201).json(test);
    } catch (error) {
        console.error('❌ Ошибка генерации теста из URL:', error.message);
        return res.status(500).json({ error: 'Ошибка генерации теста' });
    }
}

module.exports = {
    generateTestFromUrlController,
};
