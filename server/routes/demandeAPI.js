const express = require('express');
const Demande = require('../models/demande');
const { authenticateToken, requireManager } = require('../middleware/auth');
const router = express.Router();

// Créer une demande (employé)
router.post('/', authenticateToken, async (req, res) => {
    const { type, startDate, endDate } = req.body;
    if (!type || !startDate || !endDate)
        return res.status(400).json({ message: 'Tous les champs sont obligatoires' });

    const demande = new Demande({
        user: req.user._id,
        type,
        startDate,
        endDate,
        status: 'en_attente'
    });

    await demande.save();
    res.status(201).json({ message: 'Demande soumise', demande });
});

// Valider ou refuser une demande (manager)
router.patch('/:id', authenticateToken, requireManager, async (req, res) => {
    const { status } = req.body;
    if (!['valide', 'refuse'].includes(status))
        return res.status(400).json({ message: 'Status invalide' });

    const demande = await Demande.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée' });

    demande.status = status;
    await demande.save();

    res.json({ message: `Demande ${status} par le manager`, demande });
});

// Liste des demandes (manager)
router.get('/all', authenticateToken, requireManager, async (req, res) => {
    const demandes = await Demande.find().populate('user', 'nom prenom email');
    res.json(demandes);
});

// Liste des demandes de l'utilisateur connecté
router.get('/me', authenticateToken, async (req, res) => {
    const demandes = await Demande.find({ user: req.user._id });
    res.json(demandes);
});

module.exports = router;
