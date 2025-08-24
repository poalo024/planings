const mongoose = require('mongoose');

const pointageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    heureArrivee: { type: String, required: true },
    heureDepart: { type: String, required: true },
    validatedByManager: { type: Boolean, default: false },
    modifiedByEmployee: { type: Boolean, default: false }
});

module.exports = mongoose.model('Pointage', pointageSchema);