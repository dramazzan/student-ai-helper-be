const { generateTestFromURL } = require('../services/testFromUrlService');

async function generateTestFromUrlController(req, res) {
    try {
        const { url, options } = req.body;
        const userId = req.user.id || req.user._id;

        if (!url) {
            return res.status(400).json({ error: 'URL обязателен' });
        }

        const test = await generateTestFromURL(url, userId, url, options);
        res.status(201).json(test);
    } catch (error) {
        console.error('Ошибка генерации теста из URL:', error.message);
        res.status(500).json({ error: 'Ошибка генерации теста' });
    }
}

module.exports = {
    generateTestFromUrlController,
};
