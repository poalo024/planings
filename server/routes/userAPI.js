const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const Entreprise = require('../models/Entreprise');
const sendEmail = require('../utils/email');
const { authenticateToken, preventCrossCompanyAccess } = require('../middleware/auth');

// --------------------- CREATE FIRST SYSTEM ADMIN ---------------------
router.post('/admin/first-admin', async (req, res) => {
try {
    const { nom, prenom, username, email, password } = req.body;
    
    const existingAdmin = await User.findOne({ role: 'admin', entreprise: 'system' });
    if (existingAdmin) return res.status(400).json({ message: 'Un admin système existe déjà' });

    if (!password) return res.status(400).json({ message: 'Mot de passe requis pour l\'admin' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAdmin = new User({
        nom, prenom, username, email,
        password: hashedPassword,
        role: 'admin',
        entreprise: 'system',
        isActive: true,
        statut: 'actif'
    });
    
    await newAdmin.save();

    const token = jwt.sign(
        { id: newAdmin._id, role: newAdmin.role, entreprise: newAdmin.entreprise },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '7d' }
    );
    
    res.status(201).json({ message: 'Premier admin système créé', admin: newAdmin, token });
} catch (err) {
    console.error('Erreur create first admin:', err);
    res.status(500).json({ message: err.message });
}
});

// --------------------- LOGIN ---------------------
router.post('/login', async (req, res) => {
try {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
        .select('+password')
        .populate('entrepriseId', 'nom description');

    if (!user) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    if (!user.password) {
        return res.status(400).json({ 
            message: 'Compte non activé. Veuillez utiliser le lien reçu par email pour définir votre mot de passe.'
        });
    }
    
    if (!user.isActive || user.statut === 'inactif') {
        return res.status(400).json({ message: 'Compte non actif ou désactivé' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
        { id: user._id, role: user.role, entreprise: user.entrepriseId || user.entreprise },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '7d' }
    );
    
    res.json({ 
        token, 
        user: {
            id: user._id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            statut: user.statut
        }, 
        entreprise: user.entrepriseId || { nom: user.entreprise } 
    });
} catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ message: err.message });
}
});

// --------------------- VERIFY TOKEN ---------------------
router.get('/verify-token', async (req, res) => {
try {
    const { token } = req.query;
    
    if (!token) return res.status(400).json({ success: false, message: 'Token manquant' });

    const now = new Date();
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: now } }).select('-password');

    if (!user) return res.status(400).json({ success: false, message: 'Token invalide ou expiré.' });

    res.json({ 
        success: true, 
        user: { role: user.role, entreprise: user.entreprise, email: user.email, nom: user.nom, prenom: user.prenom } 
    });
} catch (err) {
    console.error('Erreur verify-token:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la vérification du token.' });
}
});

// --------------------- GET ALL USERS ---------------------
router.get('/', authenticateToken, async (req, res) => {
try {
    let filter = {};
    if (req.user.role === 'admin' && req.user.entreprise === 'system') {
        filter = { $or: [{ role: 'admin', entreprise: 'system' }, { role: 'manager' }] };
    } else if (req.user.role === 'manager') {
        filter = { entreprise: req.user.entreprise };
    } else {
        filter = { _id: req.user._id };
    }
    
    const users = await User.find(filter).select('-password -resetToken');
    res.json(users);
} catch (err) {
    console.error('Erreur get users:', err);
    res.status(500).json({ message: err.message });
}
});

// --------------------- GET USER BY ID ---------------------
router.get('/:id', authenticateToken, preventCrossCompanyAccess, async (req, res) => {
try {
    const user = await User.findById(req.params.id).select('-password -resetToken');
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
} catch (err) {
    console.error('Erreur get user by id:', err);
    res.status(500).json({ message: err.message });
}
});

// --------------------- INVITE / CREATE USER ---------------------
router.post('/invite', authenticateToken, async (req, res) => {
try {
    let userEntreprise;
    let newUserData = {};
    
    if (req.user.role === 'admin' && req.user.entreprise === 'system') {
        const { nom, prenom, username, email, role, entreprise } = req.body;
        if (!nom || !prenom || !username || !email || !role || !entreprise) {
            return res.status(400).json({ message: 'Tous les champs basiques sont obligatoires' });
        }
        userEntreprise = entreprise;
        newUserData = { nom, prenom, username, email, role, entreprise: userEntreprise };
        
    } else if (req.user.role === 'manager') {
        const { nom, prenom, username, email, role, poste, telephone,
            dateEmbauche, salaire, departement, adresse, statut, profession, typeContrat } = req.body;
        if (!nom || !prenom || !username || !email) {
            return res.status(400).json({ message: 'Nom, prénom, email et username obligatoires' });
        }
        userEntreprise = req.user.entreprise;
        newUserData = {
            nom, prenom, username, email, role,
            entreprise: userEntreprise,
            poste, telephone,
            dateEmbauche: dateEmbauche ? new Date(dateEmbauche) : undefined,
            salaire, departement, adresse,
            statut: statut || 'actif',
            profession, typeContrat
        };
        
    } else {
        return res.status(403).json({ message: 'Accès refusé' });
    }

    const existingUser = await User.findOne({ 
        $or: [{ email: newUserData.email }, { username: newUserData.username }] 
    });
    
    if (existingUser) {
        return res.status(400).json({ message: 'Email ou username déjà utilisé' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    
    newUserData.isActive = false;
    newUserData.statut = 'inactif';
    newUserData.resetToken = resetToken;
    newUserData.resetTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    const newUser = new User(newUserData);
    await newUser.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/first-login?token=${resetToken}&entreprise=${encodeURIComponent(userEntreprise)}`;
    
    const emailHtml = `
        <h2>Bonjour ${newUser.prenom},</h2>
        <p>Vous avez été invité à rejoindre <strong>${userEntreprise}</strong> en tant que <strong>${newUserData.role}</strong>.</p>
        <p>Veuillez cliquer sur le lien ci-dessous pour définir votre mot de passe et activer votre compte :</p>
        <p><a href="${resetUrl}">Définir mon mot de passe</a></p>
        <p><strong>Important :</strong> Ce lien est valable 24 heures.</p>
    `;
    
    await sendEmail(newUser.email, 'Invitation à rejoindre ' + userEntreprise, emailHtml);

    res.status(201).json({ 
        message: 'Utilisateur créé et invitation envoyée', 
        user: newUser
    });
} catch (err) {
    console.error('Erreur invite user:', err);
    res.status(500).json({ message: err.message });
}
});

// --------------------- FIRST LOGIN ---------------------
router.post('/first-login', async (req, res) => {
try {
    const { token, password } = req.body;
    
    if (!token || !password) {
        return res.status(400).json({ success: false, message: 'Token et mot de passe requis' });
    }

    const user = await User.findOne({ 
        resetToken: token, 
        resetTokenExpiry: { $gt: new Date() },
        isActive: false
    });
    
    if (!user) {
        return res.status(400).json({ 
            success: false, 
            message: 'Token invalide, expiré ou compte déjà activé.' 
        });
    }

    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'Le mot de passe doit contenir au moins 6 caractères' 
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    user.password = hashedPassword;
    user.isActive = true;
    user.statut = 'actif';
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    
    await user.save();

    const jwtToken = jwt.sign(
        { id: user._id, role: user.role, entreprise: user.entreprise },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '7d' }
    );
    
    res.json({ 
        success: true, 
        message: 'Compte activé avec succès', 
        user: { 
            id: user._id,
            email: user.email, 
            role: user.role, 
            entreprise: user.entreprise,
            nom: user.nom,
            prenom: user.prenom
        },
        token: jwtToken
    });
} catch (err) {
    console.error('Erreur first-login:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'activation du compte.' });
}
});

// --------------------- REQUEST RESET PASSWORD ---------------------
router.post('/request-reset-password', async (req, res) => {
try {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ success: false, message: 'Email requis' });

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    if (!user.isActive || !user.password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Compte non activé. Veuillez utiliser le lien d\'invitation initial.' 
        });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const emailHtml = `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Bonjour ${user.prenom},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
        <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
        <p><strong>Ce lien est valable 24 heures.</strong></p>
    `;
    
    await sendEmail(user.email, 'Réinitialisation de mot de passe', emailHtml);

    res.json({ success: true, message: 'Email de réinitialisation envoyé' });
} catch (err) {
    console.error('Erreur request-reset-password:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la demande de réinitialisation' });
}
});

// --------------------- RESET PASSWORD ---------------------
router.post('/reset-password', async (req, res) => {
try {
    const { token, newPassword, email } = req.body;
    
    if (!token || !newPassword || !email) {
        return res.status(400).json({ success: false, message: 'Token, email et nouveau mot de passe requis' });
    }

    const user = await User.findOne({ 
        email: email.toLowerCase(), 
        resetToken: token, 
        resetTokenExpiry: { $gt: Date.now() },
        isActive: true
    });
    
    if (!user) return res.status(400).json({ success: false, message: 'Token invalide ou expiré' });

    if (newPassword.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'Le mot de passe doit contenir au moins 6 caractères' 
        });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
} catch (err) {
    console.error('Erreur reset-password:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la réinitialisation du mot de passe' });
}
});

// --------------------- UPDATE USER ---------------------
router.put('/:id', authenticateToken, preventCrossCompanyAccess, async (req, res) => {
try {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const { password, resetToken, resetTokenExpiry, ...updateData } = req.body;
    Object.assign(user, updateData);
    await user.save();
    
    res.json({ message: 'Utilisateur mis à jour', user });
} catch (err) {
    console.error('Erreur update user:', err);
    res.status(500).json({ message: err.message });
}
});

// --------------------- DELETE USER ---------------------
router.delete('/:id', authenticateToken, preventCrossCompanyAccess, async (req, res) => {
try {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    await user.deleteOne();
    res.json({ message: 'Utilisateur supprimé' });
} catch (err) {
    console.error('Erreur delete user:', err);
    res.status(500).json({ message: err.message });
}
});

// --------------------- TOGGLE STATUS ---------------------
router.patch('/:id/status', authenticateToken, preventCrossCompanyAccess, async (req, res) => {
try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    user.statut = req.body.statut || (user.statut === 'actif' ? 'inactif' : 'actif');
    await user.save();
    res.json({ message: `Statut changé vers ${user.statut}`, user });
} catch (err) {
    console.error('Erreur toggle status:', err);
    res.status(500).json({ message: err.message });
}
});

// --------------------- HEALTH CHECK ---------------------
router.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API users fonctionnelle', timestamp: new Date().toISOString() });
});

module.exports = router;