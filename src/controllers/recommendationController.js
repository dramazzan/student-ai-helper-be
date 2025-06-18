const { analyzeWeakTopicsWithSummaries } = require('../services/recommendationService');

exports.getRecommendations = async (req, res) => {
    try {
        const resultId = req.params.resultId;
        const userId = req.user._id;

        const recommendations = await analyzeWeakTopicsWithSummaries(resultId, userId);

        res.status(200).json({ recommendations });
    } catch (error) {
        console.error('Ошибка анализа тем:', error);
        res.status(500).json({ message: 'Ошибка анализа' });
    }
};
