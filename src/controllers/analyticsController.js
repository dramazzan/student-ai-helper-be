const { analyzeStudentPerformance } = require('../services/analyticsService');

exports.getStudentAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const analytics = await analyzeStudentPerformance(userId);
        res.status(200).json(analytics);
    } catch (error) {
        console.error('Ошибка аналитики:', error);
        res.status(500).json({ message: 'Ошибка получения аналитики' });
    }
};
