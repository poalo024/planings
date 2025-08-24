require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => console.error('❌ Erreur MongoDB:', err));

// Routes
const userRoutes = require('./routes/userAPI');
app.use('/api/users', userRoutes);

// Route de test
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API fonctionne!',
        version: '1.0.0',
        features: ['Gestion multi-entreprises', 'Types de contrat', 'Sécurité renforcée']
    });
});

// Route santé
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connecté' : 'Déconnecté'
    });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err);
    res.status(500).json({ message: 'Erreur serveur interne' });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur: http://localhost:${PORT}`);
    console.log(`🔒 Sécurité: Accès cross-entreprise bloqué`);
    console.log(`🏢 Multi-entreprises: Activé avec isolation complète`);
});