const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateToken = async (req, res, next) => {
try {
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];

if (!token) {
    return res.status(401).json({ message: 'Access token required' });
}

const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
const user = await User.findById(decoded.userId).select('-password');

if (!user) {
    return res.status(401).json({ message: 'User not found' });
}

req.user = user;
next();

} catch (error) {
if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
}
if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
}
console.error('Authentication error:', error);
res.status(500).json({ message: 'Authentication failed' });
}
};

const requireAdmin = (req, res, next) => {
if (!req.user || req.user.role !== 'admin') {
return res.status(403).json({ message: 'Admin access required' });
}
next();
};

const optionalAuth = async (req, res, next) => {
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];

if (token) {
try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const user = await User.findById(decoded.userId).select('-password');
    req.user = user;
} catch (error) {
    // Token is invalid but we continue anyway
    console.error('Optional auth error:', error);
}
}

next();
};

module.exports = {
authenticateToken,
requireAdmin,
optionalAuth
};