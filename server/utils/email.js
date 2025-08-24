const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST || 'smtp.example.com',
port: process.env.SMTP_PORT || 587,
secure: false,
auth: {
user: process.env.SMTP_USER || 'user@example.com',
pass: process.env.SMTP_PASS || 'password'
}
});

const sendEmail = async (to, subject, text) => {
const mailOptions = {
from: process.env.SMTP_USER || 'no-reply@example.com',
to,
subject,
text
};

try {
await transporter.sendMail(mailOptions);
console.log(`✔ Email envoyé à ${to}`);
} catch (err) {
console.error('Erreur envoi email:', err);
}
};

module.exports = sendEmail;
