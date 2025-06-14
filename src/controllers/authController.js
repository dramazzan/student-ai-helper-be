const { z } = require('zod');
const authService = require('../services/authService');

const registerSchema = z.object({
    name: z.string().min(2, 'Имя слишком короткое').nonempty("Имя не может быть пустым"),
    email: z.string().email('Неверный email').nonempty("Email не может быть пустым"),
    password: z.string().min(6, 'Пароль должен быть минимум 6 символов')
});

const loginSchema = z.object({
    email: z.string().email('Неверный email').nonempty('Email не может быть пустым'),
    password: z.string().nonempty('Пароль не может быть пустым')
});

exports.register = async (req, res) => {
    try {
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Ошибка валидации",
                errors: result.error.flatten().fieldErrors
            });
        }

        const user = await authService.registerUser(result.data);
        res.status(201).json({ message: "Регистрация прошла успешно", userId: user._id });

    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Что-то пошло не так" });
    }
};

exports.login = async (req, res) => {
    try {
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Ошибка валидации",
                errors: result.error.flatten().fieldErrors
            });
        }

        const { token, email } = await authService.loginUser(result.data);
        res.status(200).json({ email, token });

    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Что-то пошло не так" });
    }
};
