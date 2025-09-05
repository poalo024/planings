require('dotenv').config(); // Charge les variables d'environnement
const sendEmail = require('./utils/email');

async function test() {
    try {
        // Affiche les variables pour vérifier qu'elles sont bien chargées
        console.log('SMTP_USER:', process.env.SMTP_USER);
        console.log('SMTP_PASS:', process.env.SMTP_PASS ? '****' : 'Non défini');

        // Envoie l'email à toi-même pour le test
        await sendEmail(
            'paoloalbert42@gmail.com', // ✅ Envoie à ton adresse
            'Test Email Node.js',
            'Ceci est un email de test depuis Node.js !'
        );
        console.log('✅ Test terminé avec succès');
    } catch (err) {
        console.error('❌ Test échoué:', err); // Affiche toute l'erreur
    }
}

test();
