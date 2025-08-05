require('dotenv').config();
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const employeeRoutes = require('./routes/employeeAPI'); // <- import routes ici

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion MongoDB (ton URI local)
// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
useNewUrlParser: true,
useUnifiedTopology: true,
}).then(() => {
console.log("✔ Connecté à MongoDB");
}).catch((err) => {
console.error("Erreur MongoDB :", err);
});
// Routes
app.use('/api/employees', require('./routes/employeeAPI'));
 // <-- ici tu utilises les routes

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend prêt sur http://localhost:${PORT}`));
console.log('Port:', process.env.PORT);
console.log('Mongo URI:', process.env.MONGO_URI);

