const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

module.exports = async (email, token) => {
    const link = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;

    await transporter.sendMail({
        to: email,
        subject: 'Подтвердите вашу почту',
        html: `<p>Пожалуйста, подтвердите вашу почту, перейдя по ссылке:</p>
           <a href="${link}">${link}</a>`,
    });
};
