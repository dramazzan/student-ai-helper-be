const authService = require('../services/authService');

exports.register = async (req, res) => {
    try {
        const response = await authService.registerUser(req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).json({ message: 'Токен не передан' });
    }

    try {
        const result = await authService.verifyEmail(token);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const {token, user} = await authService.loginUser(req.body);



        res.cookie('token' , token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 1000 * 60 * 60 * 1000
        })

        res.status(200).json({success: true , message: "Успешный вход", user: user })
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};


exports.getUserData = async (req, res) =>{
    try{
        const user = await authService.getUserData(req.user)
        res.status(200).json(user)
    }catch(error){
        res.status(error.status || 500).json({ message: error.message });
    }
}