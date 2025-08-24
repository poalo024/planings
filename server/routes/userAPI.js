const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const sendEmail = require('../utils/email');
const { authenticateToken, preventCrossCompanyAccess } = require('../middleware/auth');

// --------------------- GET ALL USERS ---------------------
router.get('/', authenticateToken, async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === 'admin' && req.user.entreprise === 'system') {
            // Admin système voit tous les admins système
            filter = { role: 'admin' };
        } else if (req.user.role === 'manager') {
            // Manager ne voit que les users de sa propre entreprise
            filter = { entreprise: req.user.entreprise, role: 'user' };
        } else {
            // User ne voit que lui-même
            filter = { _id: req.user._id };
        }

        const users = await User.find(filter).select('-password -resetToken');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------------------- GET USER BY ID ---------------------
router.get('/:id', authenticateToken, preventCrossCompanyAccess, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -resetToken');
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        if (req.user.role === 'admin' && req.user.entreprise === 'system') {
            if (user.role === 'admin') return res.json(user); // Admin système voit tous les admins système
            return res.status(403).json({ message: 'Accès interdit aux employés créés par les managers' });
        }

        if (req.user.role === 'manager') {
            if (user.entreprise !== req.user.entreprise || user.role !== 'user') {
                return res.status(403).json({ message: 'Accès interdit' });
            }
        }

        if (req.user.role === 'user' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Accès interdit' });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------------------- LOGIN ---------------------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

        if (!user.isActive || user.statut === 'inactif') {
            return res.status(400).json({ message: 'Compte non actif ou désactivé' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

        const token = jwt.sign({ id: user._id, role: user.role, entreprise: user.entreprise }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '7d' });

        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------------------- INVITE / CREATE USER ---------------------
router.post('/invite', authenticateToken, async (req, res) => {
    try {
        const { nom, prenom, username, email, role, entreprise, poste, telephone, dateEmbauche, salaire, departement, adresse, statut, profession, typeContrat } = req.body;

        let userEntreprise;

        if (req.user.role === 'admin' && req.user.entreprise === 'system') {
            // Admin système peut créer manager ou user
            userEntreprise = entreprise;
            if (!userEntreprise) return res.status(400).json({ message: 'Entreprise obligatoire pour admin système' });
        } else if (req.user.role === 'manager') {
            // Manager limité à sa propre boîte
            userEntreprise = req.user.entreprise;
            if (role !== 'user') return res.status(403).json({ message: 'Les managers ne peuvent créer que des users' });
        } else {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ message: 'Email ou username déjà utilisé' });

        const resetToken = crypto.randomBytes(32).toString('hex');

        const newUser = new User({
            nom,
            prenom,
            username,
            email,
            role: role || 'user',
            entreprise: userEntreprise,
            isActive: false,
            resetToken,
            // Renseigner tous les champs seulement si ce n'est pas un manager
            poste: role !== 'manager' ? poste || '' : undefined,
            telephone: role !== 'manager' ? telephone || '' : undefined,
            dateEmbauche: role !== 'manager' && dateEmbauche ? new Date(dateEmbauche) : undefined,
            salaire: role !== 'manager' ? salaire || 0 : undefined,
            departement: role !== 'manager' ? departement || '' : undefined,
            adresse: role !== 'manager' ? adresse || '' : undefined,
            profession: role !== 'manager' ? profession || '' : undefined,
            typeContrat: role !== 'manager' ? typeContrat || 'Other' : undefined,
            statut: statut || 'actif'
        });

        await newUser.save();

        res.status(201).json({ message: 'Utilisateur créé', user: newUser });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------------------- UPDATE USER ---------------------
router.put('/:id', authenticateToken, preventCrossCompanyAccess, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        // Restrictions selon rôle
        if (req.user.role === 'manager' && (user.role !== 'user' || user.entreprise !== req.user.entreprise)) {
            return res.status(403).json({ message: 'Action non autorisée' });
        }
        if (req.user.role === 'user' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Action non autorisée' });
        }

        Object.assign(user, req.body);

        await user.save();
        res.json({ message: 'Utilisateur mis à jour', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------------------- DELETE USER ---------------------
router.delete('/:id', authenticateToken, preventCrossCompanyAccess, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        if (req.user.role === 'manager' && (user.role !== 'user' || user.entreprise !== req.user.entreprise)) {
            return res.status(403).json({ message: 'Action non autorisée' });
        }
        if (req.user.role === 'user') return res.status(403).json({ message: 'Action non autorisée' });

        await user.deleteOne();
        res.json({ message: 'Utilisateur supprimé' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------------------- TOGGLE STATUS ---------------------
router.patch('/:id/status', authenticateToken, preventCrossCompanyAccess, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        if (req.user.role === 'manager' && (user.role !== 'user' || user.entreprise !== req.user.entreprise)) {
            return res.status(403).json({ message: 'Action non autorisée' });
        }
        if (req.user.role === 'user') return res.status(403).json({ message: 'Action non autorisée' });

        user.statut = req.body.statut || (user.statut === 'actif' ? 'inactif' : 'actif');
        await user.save();

        res.json({ message: `Statut changé vers ${user.statut}`, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
