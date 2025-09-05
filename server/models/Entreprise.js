const mongoose = require('mongoose');

const entrepriseSchema = new mongoose.Schema({
    nom: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    managers: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Entreprise', entrepriseSchema);
