const { analyzeStudentPerformance } = require('../services/analyticsService');

exports.getStudentAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const analysis = await analyzeStudentPerformance(userId);
        res.status(200).json({ analysis });
    } catch (err) {
        console.error('Ошибка аналитики:', err);
        res.status(500).json({ message: 'Не удалось получить аналитику' });
    }
};
