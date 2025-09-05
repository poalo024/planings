const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String },

    role: { 
        type: String, 
        enum: ['user', 'employee', 'manager', 'admin', 'system-admin'], 
        default: 'user' 
    },

    // Manager lié à une entreprise
    entrepriseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' },

    // Info entreprise simple pour users/admin
    entreprise: { type: String, required: true },

    isActive: { type: Boolean, default: false },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },   // ✅ ajouté ici

    // Nouveaux champs RH
    profession: { type: String, trim: true },
    typeContrat: { 
        type: String, 
        enum: [
            'CDI', 'CDD', 'Contrat d\'apprentissage', 'Contrat de professionnalisation',
            'Contrat d\'intérim', 'Contrat à temps partiel', 'Contrat de travail temporaire',
            'Contrat de projet', 'Portage salarial', 'Auto-entrepreneur', 'Freelance',
            'Stage', 'Alternance', 'Contrat unique d\'insertion', 'Emploi aidé',
            'VSI/Volontariat', 'Other'
        ],
        trim: true 
    },
    poste: { type: String, trim: true },
    telephone: { type: String, trim: true },
    dateEmbauche: { type: Date },
    salaire: { type: Number, min: 0 },
    departement: { type: String, trim: true },
    adresse: { type: String, trim: true },
    statut: { type: String, enum: ['actif', 'inactif'], default: 'actif' },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Hash password uniquement si modifié
userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Comparaison mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Exclure password et resetToken quand on convertit en JSON
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.resetToken;
    return user;
};

module.exports = mongoose.model('User', userSchema);
