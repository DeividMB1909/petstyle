// backend/models/Administrador.js
const mongoose = require('mongoose');

const administradorSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        maxlength: [50, 'El nombre no puede exceder 50 caracteres']
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    rol: {
        type: String,
        enum: ['admin', 'superadmin'],
        default: 'admin'
    },
    permisos: {
        type: [String],
        default: [
            'productos.leer',
            'productos.crear', 
            'productos.actualizar',
            'productos.eliminar',
            'usuarios.leer',
            'categorias.leer',
            'categorias.crear',
            'categorias.actualizar',
            'categorias.eliminar'
        ]
    },
    activo: {
        type: Boolean,
        default: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    ultimoAcceso: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'administradors' // Nombre exacto de tu colección
});

// Índices
administradorSchema.index({ email: 1 });
administradorSchema.index({ activo: 1 });

// Método para actualizar último acceso
administradorSchema.methods.updateLastAccess = function() {
    this.ultimoAcceso = new Date();
    return this.save();
};

// Método para verificar permisos
administradorSchema.methods.hasPermission = function(permission) {
    return this.permisos.includes(permission);
};

// Método estático para buscar por email
administradorSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('Administrador', administradorSchema, 'administradors');