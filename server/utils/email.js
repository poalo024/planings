const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // ✅ false pour le port 587 (TLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false // ⚠️ À utiliser uniquement en développement
    }
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject,
        text,
        html: `<p>${text}</p>`
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✔ Email envoyé à ${to}: ${info.messageId}`);
    } catch (err) {
        console.error('❌ Erreur envoi email:', err);
        throw new Error(`Erreur envoi email: ${err.message}`);
    }
};

module.exports = sendEmail;
// Exemple d'utilisation dans une autre partie de l'application
// const sendEmail = require('./utils/email');
