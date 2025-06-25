const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendVerificationEmail = require('../utils/sendVerificationEmail');


exports.registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error("Пользователь уже существует");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const emailToken = jwt.sign(
      { name, email, password: hashedPassword },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
  );

  try {
    await sendVerificationEmail(email, emailToken);
  } catch (err) {
    console.error("❌ Ошибка отправки письма:", err);
    const error = new Error("Не удалось отправить письмо подтверждения");
    error.status = 500;
    throw error;
  }

  return { message: "Письмо подтверждения отправлено. Проверьте почту." };
};

exports.verifyEmail = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("❌ Ошибка токена:", err.message);
    const error = new Error("Недействительный или просроченный токен");
    error.status = 400;
    throw error;

  }

  const existing = await User.findOne({ email: payload.email });
  if (existing) {
    const error = new Error("Аккаунт уже подтверждён");
    error.status = 400;
    throw error;
  }

  const newUser = new User({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    isVerified: true,
  });

  await newUser.save();

  return { message: "Email успешно подтверждён. Теперь вы можете войти." };
};


exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Пользователь не найден');
    error.status = 404;
    throw error;
  }

  if (!user.isVerified) {
    const error = new Error('Подтвердите email, прежде чем входить');
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Неверный пароль');
    error.status = 400;
    throw error;
  }

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return { token  , user: {id: user.id , email: user.email , username: user.name}};
};



exports.getUserData = async (user) => {
  if (!user || !user._id) {
    const error = new Error('Неверные данные пользователя');
    error.status = 400;
    throw error;
  }

  const userData = await User.findById(user._id).lean();

  if (!userData) {
    const error = new Error('Пользователь не найден');
    error.status = 404;
    throw error;
  }

  return userData;
};
