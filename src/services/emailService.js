const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendVerificationEmail(email, token) {
    const link = `http://localhost:3000/api/auth/verify?token=${token}`;
    await transporter.sendMail({
        to: email,
        subject: 'Подтверждение email',
        html: `<p>Нажмите, чтобы подтвердить регистрацию: <a href="${link}">${link}</a></p>`,
    });
}

module.exports = { sendVerificationEmail };
