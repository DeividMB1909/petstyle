const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        maxlength: [50, 'El nombre no puede exceder 50 caracteres']
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false // No incluir en consultas por defecto
    },
    phone: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        match: [/^[0-9]{10}$/, 'Teléfono debe tener 10 dígitos']
    },
    address: {
        street: { type: String, required: false }, // ← CAMBIADO A false
        city: { type: String, required: false },   // ← CAMBIADO A false
        state: { type: String, required: false },  // ← CAMBIADO A false
        zipCode: { type: String, required: false }, // ← CAMBIADO A false
        country: { type: String, default: 'México' }
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// ❌ COMENTADO: No necesario porque AuthController ya encripta
/*
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
*/

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos públicos del usuario
userSchema.methods.toPublicJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);