const { getOverallProgress, getTestProgress } = require('../services/progressService');
const { getAllTestResults } = require('../services/progressService')
const {getPassedPercentageByModule} = require('../services/testService')

exports.getTestResults = async (req, res) => {
    try {
        const userId = req.user._id
        const testId = req.params.testId

        const results = await getAllTestResults(testId, userId)
        return res.status(200).json(results)
    } catch (error) {
        console.error('Ошибка получения результатов теста:', error.message)
        return res.status(400).json({ message: error.message })
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

