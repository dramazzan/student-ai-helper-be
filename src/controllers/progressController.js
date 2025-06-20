const { getOverallProgress, getTestProgress } = require('../services/progressService');

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
