require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON des requêtes entrantes

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
const userRoutes = require('./routes/userAPI');
app.use('/api/users', userRoutes);

// Test de route
app.get('/', (req, res) => {
res.json({ message: 'Serveur fonctionne !' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log(`🚀 Backend prêt sur http://localhost:${PORT}`);
});