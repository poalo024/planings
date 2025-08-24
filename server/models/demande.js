const mongoose = require('mongoose');

const demandeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['conge', 'arret'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['en_attente', 'valide', 'refuse'], default: 'en_attente' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Demande', demandeSchema);
