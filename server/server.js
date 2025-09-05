require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connexion MongoDB avec meilleure gestion d'erreurs
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/database_appli', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => {
    console.error('❌ Erreur MongoDB:', err);
    process.exit(1);
});

// Vérification de la connexion MongoDB
mongoose.connection.on('error', err => {
    console.error('❌ Erreur de connexion MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  Déconnecté de MongoDB');
});

// Routes
const userRoutes = require('./routes/userAPI');
app.use('/api/users', userRoutes);

// Routes pour les entreprises (vérifier le nom exact du fichier)
try {
    const entrepriseRoutes = require('./routes/EntrepriseAPI');
    app.use('/api/entreprises', entrepriseRoutes);
    console.log('✅ Routes entreprises chargées');
} catch (error) {
    console.log('⚠️  Routes entreprises non chargées:', error.message);
}

// Middleware de logging pour le débogage
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Route de test améliorée
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API fonctionne!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connecté' : 'Déconnecté',
        features: ['Gestion multi-entreprises', 'Types de contrat', 'Sécurité renforcée']
    });
});

// Route santé améliorée
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMessages = {
        0: 'Déconnecté',
        1: 'Connecté',
        2: 'Connexion en cours',
        3: 'Déconnexion en cours'
    };
    
    res.json({ 
        status: dbStatus === 1 ? 'OK' : 'ERROR',
        timestamp: new Date().toISOString(),
        database: statusMessages[dbStatus] || 'État inconnu',
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Route spécifique pour vérifier users API
app.get('/api/users/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'API Users fonctionnelle',
        timestamp: new Date().toISOString()
    });
});

// Gestion des erreurs 404 avec plus de détails
app.use('*', (req, res) => {
    console.log(`❌ Route non trouvée: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        message: 'Route non trouvée',
        path: req.originalUrl,
        method: req.method,
        suggestion: 'Vérifiez l\'URL et la méthode HTTP'
    });
});

// Gestion des erreurs globales améliorée
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });
    
    res.status(500).json({ 
        message: 'Erreur serveur interne',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
    });
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
    console.log('\n🛑 Arrêt du serveur...');
    await mongoose.connection.close();
    console.log('✅ MongoDB déconnecté');
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur: http://localhost:${PORT}`);
    console.log(`🌐 Frontend autorisé: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🔒 Sécurité: CORS configuré`);
    console.log(`🏢 Multi-entreprises: Activé avec isolation complète`);
    console.log(`----------------------------------------`);
    console.log(`✅ Testez la connexion: http://localhost:${PORT}/health`);
    console.log(`✅ Testez l'API Users: http://localhost:${PORT}/api/users/health`);
    console.log(`✅ Testez l'API générale: http://localhost:${PORT}/api/test`);
});