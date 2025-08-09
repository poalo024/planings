const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware pour vérifier le token JWT
const authenticateToken = async (req, res, next) => {
    try {
        // Récupérer le token depuis l'header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                message: 'Token d\'accès requis' 
            });
        }

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        // Récupérer l'utilisateur depuis la base de données
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ 
                message: 'Utilisateur non trouvé' 
            });
        }

        // Ajouter l'utilisateur à la requête
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expiré' 
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Token invalide' 
            });
        }
        
        console.error('Erreur authentification:', error);
        return res.status(500).json({ 
            message: 'Erreur serveur lors de l\'authentification' 
        });
    }
};

// Middleware pour vérifier si l'utilisateur est admin
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            message: 'Authentification requise' 
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            message: 'Accès interdit - Droits administrateur requis' 
        });
    }

    next();
};

// Middleware optionnel - vérifie le token s'il existe
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
            const user = await User.findById(decoded.userId).select('-password');
            req.user = user;
        }
        
        next();
    } catch (error) {
        // En cas d'erreur, on continue sans authentification
        next();
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    optionalAuth
};