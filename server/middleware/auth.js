const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        // Vérifier si l'utilisateur existe toujours et est actif
        const user = await User.findById(decoded.id).select('-password -resetToken');
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Compte désactivé' });
        }

        if (user.statut === 'inactif') {
            return res.status(401).json({ message: 'Compte inactif' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token invalide' });
    }
};

// Middleware pour restreindre l'accès admin aux données sensibles
const restrictAdminAccess = (req, res, next) => {
    if (req.user.role === 'admin' && req.user.entreprise !== 'system') {
        return res.status(403).json({ 
            message: 'Accès restreint. Admin système seulement.' 
        });
    }
    next();
};

// Middleware pour empêcher l'accès cross-entreprise
const preventCrossCompanyAccess = async (req, res, next) => {
    try {
        if (req.user.role === 'admin' && req.user.entreprise === 'system') {
            return next(); // Admin système a accès à tout
        }

        // Pour les routes avec :id, vérifier l'entreprise
        if (req.params.id) {
            const targetUser = await User.findById(req.params.id).select('entreprise');
            if (!targetUser) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            if (targetUser.entreprise !== req.user.entreprise) {
                return res.status(403).json({ 
                    message: 'Accès interdit à cette entreprise' 
                });
            }
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Erreur de vérification des permissions' });
    }
};

module.exports = { 
    authenticateToken, 
    restrictAdminAccess, 
    preventCrossCompanyAccess 
};