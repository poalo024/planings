require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const employeeRoutes = require('./routes/employeeAPI'); // <- import routes ici

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion MongoDB (ton URI local)
mongoose.connect('mongodb://localhost:27017/teamDB')
    .then(() => console.log('✔ Connecté à MongoDB'))
    .catch(err => console.log('❌ Erreur MongoDB:', err));

// Routes
app.use('/api/employees', employeeRoutes); // <-- ici tu utilises les routes

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend prêt sur http://localhost:${PORT}`));
