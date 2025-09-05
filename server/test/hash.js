const bcrypt = require('bcrypt');

async function hashPassword() {
    const password = "je_12345"; // ton nouveau mot de passe
    const hashed = await bcrypt.hash(password, 10);
    console.log(hashed);
}

hashPassword();
