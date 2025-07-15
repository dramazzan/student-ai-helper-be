const { getTestModules } = require('../services/testService/testModuleService');

exports.getTestModules = async (req, res) => {
    try {
        const modules = await getTestModules(req.user._id);
        res.status(200).json({ modules });
    } catch (err) {
        console.error('Ошибка при получении модулей:', err.message);
        res.status(500).json({ message: 'Ошибка сервера при получении модулей' });
    }
};
