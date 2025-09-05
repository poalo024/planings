const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Entreprise = require('../models/Entreprise');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/entreprises/
 * Créer une nouvelle entreprise et inviter un manager principal
 */
router.post('/', authenticateToken, async (req, res) => {
try {
const { nom, description, managerEmail } = req.body;

if (req.user.role !== 'admin' || req.user.entreprise !== 'system') {
    return res.status(403).json({
    message: 'Accès refusé. Seul un admin système peut créer une entreprise.'
    });
}

if (!nom || !description || !managerEmail) {
    return res.status(400).json({
    message: 'Nom, description et email du manager sont requis.'
    });
}

const existingEntreprise = await Entreprise.findOne({
    nom: new RegExp('^' + nom + '$', 'i')
});
if (existingEntreprise) {
    return res.status(400).json({
    message: 'Une entreprise avec ce nom existe déjà.'
    });
}

const existingManager = await User.findOne({
    email: managerEmail,
    role: 'manager'
});
if (existingManager) {
    return res.status(400).json({
    message: 'Cet email est déjà utilisé par un manager.'
    });
}

// Créer l'entreprise
const entreprise = new Entreprise({ nom, description });
await entreprise.save();

// Générer un token d’invitation
const resetToken = crypto.randomBytes(32).toString('hex');
const resetTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

// Générer un username temporaire
const tempUsername = `manager_${entreprise.nom.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString().slice(-6)}`;

// Créer le manager principal
const manager = new User({
    nom: 'À définir',
    prenom: 'Manager',
    username: tempUsername,
    email: managerEmail,
    role: 'manager',
    entreprise: entreprise._id,
    isActive: false,
    resetToken,
    resetTokenExpiry
});
await manager.save();

// Lier à l’entreprise
entreprise.managers.push(manager._id);
await entreprise.save();

// Préparer email
const resetUrl = `${process.env.FRONTEND_URL}/first-login?token=${resetToken}&entreprise=${encodeURIComponent(entreprise.nom)}`;
const emailSubject = `Invitation à rejoindre ${entreprise.nom} comme Manager`;
const emailHtml = `
    <h2>Bonjour,</h2>
    <p>Vous avez été nommé Manager de l'entreprise <strong>${entreprise.nom}</strong>.</p>
    <p>Veuillez cliquer sur le lien ci-dessous pour définir votre mot de passe et activer votre compte :</p>
    <p><a href="${resetUrl}" style="background-color:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">Finaliser mon inscription</a></p>
    <p>Ce lien expirera dans 24 heures.</p>
    <br>
    <p><em>Équipe ${process.env.APP_NAME || 'PlanningApp'}</em></p>
`;

await sendEmail(managerEmail, emailSubject, emailHtml);

res.status(201).json({
    success: true,
    message: "Entreprise créée avec succès. Une invitation a été envoyée au manager.",
    data: {
    entreprise: {
        id: entreprise._id,
        nom: entreprise.nom,
        description: entreprise.description
    },
    manager: {
        email: managerEmail,
        status: "invitation envoyée"
    }
    }
});
} catch (err) {
console.error('Erreur création entreprise:', err);
res.status(500).json({
    success: false,
    message: 'Erreur serveur lors de la création de l\'entreprise.'
});
}
});

/**
 * ✅ NOUVELLE ROUTE : Inviter un autre manager dans une entreprise existante
 */
router.post('/:id/invite-manager', authenticateToken, async (req, res) => {
try {
const { id } = req.params;
const { managerEmail } = req.body;

// Vérifier si entreprise existe
const entreprise = await Entreprise.findById(id);
if (!entreprise) {
    return res.status(404).json({ message: "Entreprise non trouvée." });
}

// Vérifier permissions : admin système OU manager de l’entreprise
if (!(
    (req.user.role === "admin" && req.user.entreprise === "system") ||
    (req.user.role === "manager" && req.user.entreprise.toString() === entreprise._id.toString())
)) {
    return res.status(403).json({ message: "Accès refusé." });
}

// Vérifier si email déjà utilisé
const existingManager = await User.findOne({ email: managerEmail, role: "manager" });
if (existingManager) {
    return res.status(400).json({ message: "Cet email est déjà utilisé par un manager." });
}

// Générer token
const resetToken = crypto.randomBytes(32).toString('hex');
const resetTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
const tempUsername = `manager_${entreprise.nom.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString().slice(-6)}`;

// Créer manager invité
const manager = new User({
    nom: "À définir",
    prenom: "Manager",
    username: tempUsername,
    email: managerEmail,
    role: "manager",
    entreprise: entreprise._id,
    isActive: false,
    resetToken,
    resetTokenExpiry
});
await manager.save();

entreprise.managers.push(manager._id);
await entreprise.save();

// Envoi email invitation
const resetUrl = `${process.env.FRONTEND_URL}/first-login?token=${resetToken}&entreprise=${encodeURIComponent(entreprise.nom)}`;
const emailSubject = `Invitation à rejoindre ${entreprise.nom} comme Manager`;
const emailHtml = `
    <h2>Bonjour,</h2>
    <p>Vous avez été invité à rejoindre l'entreprise <strong>${entreprise.nom}</strong> comme Manager.</p>
    <p>Veuillez cliquer sur le lien ci-dessous pour définir votre mot de passe et activer votre compte :</p>
    <p><a href="${resetUrl}" style="background-color:#28a745;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">Accepter l'invitation</a></p>
    <p>Ce lien expirera dans 24 heures.</p>
    <br>
    <p><em>Équipe ${process.env.APP_NAME || 'PlanningApp'}</em></p>
`;
await sendEmail(managerEmail, emailSubject, emailHtml);

res.status(201).json({
    success: true,
    message: "Invitation envoyée avec succès au manager.",
    data: { manager: { email: managerEmail, status: "invitation envoyée" } }
});
} catch (err) {
console.error("Erreur invitation manager:", err);
res.status(500).json({ success: false, message: "Erreur serveur." });
}
});

/**
 * GET /api/entreprises/
 * Liste des entreprises (admin système uniquement)
 */
router.get('/', authenticateToken, async (req, res) => {
try {
if (req.user.role !== 'admin' || req.user.entreprise !== 'system') {
    return res.status(403).json({ message: 'Accès refusé' });
}
const entreprises = await Entreprise.find()
    .populate('managers', 'nom prenom email username isActive')
    .select('-__v');
res.json({
    success: true,
    count: entreprises.length,
    data: entreprises
});
} catch (err) {
console.error(err);
res.status(500).json({ success: false, message: err.message });
}
});

/**
 * DELETE /api/entreprises/:id
 * Supprimer entreprise (admin système uniquement)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
try {
const { id } = req.params;

if (req.user.role !== 'admin' || req.user.entreprise !== 'system') {
    return res.status(403).json({
    message: 'Accès refusé. Seul un admin système peut supprimer une entreprise.'
    });
}

const entreprise = await Entreprise.findById(id);
if (!entreprise) {
    return res.status(404).json({ message: 'Entreprise non trouvée.' });
}

await Entreprise.findByIdAndDelete(id);
await User.deleteMany({ entreprise: id });

res.json({
    success: true,
    message: `Entreprise "${entreprise.nom}" supprimée avec succès.`
});
} catch (err) {
console.error('Erreur suppression entreprise:', err);
res.status(500).json({
    success: false,
    message: 'Erreur serveur lors de la suppression de l\'entreprise.'
});
}
});

module.exports = router;
