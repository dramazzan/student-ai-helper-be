const {
    getMultiTestsByUser,
    getNormalTestsByUser,
    getTestsByModuleId,
    getTestById
} = require('../../services/testService/testQueryService');

exports.getNormalTests = async (req, res) => {
    try {
        const tests = await getNormalTestsByUser(req.user._id);
        res.status(200).json({ tests });
    } catch (err) {
        console.error('Ошибка при получении обычных тестов:', err.message);
        res.status(500).json({ message: 'Ошибка сервера при получении обычных тестов' });
    }
};

exports.getMultiTests = async (req, res) => {
    try {
        const tests = await getMultiTestsByUser(req.user._id);
        res.status(200).json({ tests });
    } catch (err) {
        console.error('Ошибка при получении мульти-тестов:', err.message);
        res.status(500).json({ message: 'Ошибка сервера при получении мульти-тестов' });
    }
};

exports.getTestsByModuleId = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const tests = await getTestsByModuleId(moduleId);
        res.status(200).json({ tests });
    } catch (error) {
        console.error('Ошибка при получении тестов по модулю:', error.message);
        res.status(500).json({ message: 'Ошибка сервера при получении тестов' });
    }
};

exports.getTestByIdController = async (req, res) => {
    try {
        const testId = req.params.id;
        const userId = req.user.id;

        const test = await getTestById(testId, userId);
        res.status(200).json(test);
    } catch (error) {
        console.error('Ошибка получения теста:', error.message);
        res.status(400).json({ error: error.message });
    }
};
