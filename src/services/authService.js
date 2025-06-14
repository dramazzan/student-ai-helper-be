const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.registerUser = async ({ name, email, password }) => {
  const user = await User.findOne({ email });
  if (user) {
    const error = new Error("Пользователь уже зарегистрирован");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();

  return newUser;
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("Пользователь не найден");
    error.status = 404;
    throw error;
  }

  console.log(user)

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Неверный пароль");
    error.status = 400;
    throw error;
  }

  const token = jwt.sign(
    { id: user._id , username: user.name  , email: user.email},
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token, email };
};
