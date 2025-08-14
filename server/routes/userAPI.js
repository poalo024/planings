const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Middleware de validation pour l'inscription
const validateRegisterInput = (req, res, next) => {
    const { nom, prenom, username, email, password } = req.body;
    if (!nom?.trim() || !prenom?.trim() || !username?.trim() || !email?.trim() || !password) {
        return res.status(400).json({ 
            message: 'Tous les champs sont obligatoires',
            receivedData: req.body 
        });
    }
    next();
};

// ==================== INSCRIPTION ====================
router.post('/register', express.json(), validateRegisterInput, async (req, res) => {
    try {
        const { nom, prenom, username, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Utilisateur existe déjà',
                conflict: existingUser.email === email ? 'email' : 'username'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            nom: nom.trim(),
            prenom: prenom.trim(),
            username: username.trim(),
            email: email.trim(),
            password: hashedPassword,
            role: 'user'
        });

        await newUser.save();

        res.status(201).json({ 
            message: 'Inscription réussie',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// ==================== CONNEXION ====================
router.post('/login', express.json(), async (req, res) => {
    try {
        const { email, password } = req.body;

        // Chercher l'utilisateur par email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Créer un token JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1h' }
        );

        // Réponse JSON
        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

module.exports = router;
