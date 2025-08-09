require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mydb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("✔ Connecté à MongoDB");
}).catch((err) => {
    console.error("Erreur MongoDB :", err);
});

// Routes
app.use('/api/employees', require('./routes/employeeAPI'));
app.use('/api/users', require('./routes/userAPI'));

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'Serveur fonctionne !' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend prêt sur http://localhost:${PORT}`);
    console.log('📍 Routes disponibles:');
    console.log(`   GET  http://localhost:${PORT}/api/employees`);
    console.log(`   POST http://localhost:${PORT}/api/employees`);
    console.log(`   POST http://localhost:${PORT}/api/users/register`);
    console.log(`   POST http://localhost:${PORT}/api/users/login`);
});