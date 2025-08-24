const express = require('express');
const Pointage = require('../models/pointage');
const { authenticateToken, requireManager } = require('../middleware/auth');
const router = express.Router();

// Créer un pointage (employé)
router.post('/', authenticateToken, async (req, res) => {
    const { date, heureArrivee, heureDepart } = req.body;
    if (!date || !heureArrivee || !heureDepart)
        return res.status(400).json({ message: 'Tous les champs sont obligatoires' });

    const pointage = new Pointage({
        user: req.user._id,
        date,
        heureArrivee,
        heureDepart,
        modifiedByEmployee: true,
        validatedByManager: false
    });
    await pointage.save();
    res.status(201).json({ message: 'Pointage soumis pour validation', pointage });
});

// Modifier un pointage (employé)
router.patch('/:id', authenticateToken, async (req, res) => {
    const pointage = await Pointage.findById(req.params.id);
    if (!pointage) return res.status(404).json({ message: 'Pointage non trouvé' });
    if (!pointage.user.equals(req.user._id)) return res.status(403).json({ message: 'Accès refusé' });

    const { heureArrivee, heureDepart } = req.body;
    if (heureArrivee) pointage.heureArrivee = heureArrivee;
    if (heureDepart) pointage.heureDepart = heureDepart;

    pointage.modifiedByEmployee = true;
    pointage.validatedByManager = false;
    await pointage.save();

    res.json({ message: 'Pointage modifié, en attente de validation', pointage });
});

// Valider un pointage (manager)
router.patch('/validate/:id', authenticateToken, requireManager, async (req, res) => {
    const pointage = await Pointage.findById(req.params.id);
    if (!pointage) return res.status(404).json({ message: 'Pointage non trouvé' });

    pointage.validatedByManager = true;
    await pointage.save();

    res.json({ message: 'Pointage validé par le manager', pointage });
});

// Liste des pointages (manager)
router.get('/all', authenticateToken, requireManager, async (req, res) => {
    const pointages = await Pointage.find().populate('user', 'nom prenom email');
    res.json(pointages);
});

module.exports = router;
