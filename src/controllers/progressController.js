const { getOverallProgress, getTestProgress } = require('../services/progressService');
const { getAllTestResults } = require('../services/progressService')
const {getPassedPercentageByModule} = require('../services/testService/testModuleService')

exports.getTestResults = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Неавторизованный доступ' })
        }

        const userId = req.user._id
        const testId = req.params.testId

        const results = await getAllTestResults(testId, userId)
        return res.status(200).json(results)
    } catch (error) {
        console.error('Ошибка получения результатов теста:', error)
        return res.status(400).json({ message: error.message || 'Не удалось получить результаты' })
    }
}



exports.getUserProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const progress = await getOverallProgress(userId);
        res.status(200).json(progress);
    } catch (err) {
        console.error('Ошибка получения общего прогресса:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.getTestProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const resultId = req.params.resultId;
        const data = await getTestProgress(resultId, userId);
        res.status(200).json(data);
    } catch (err) {
        console.error('Ошибка получения прогресса по тесту:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};


exports.getModuleProgress = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const userId = req.user._id;

        const progress = await getPassedPercentageByModule(moduleId, userId);
        res.status(200).json(progress);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

