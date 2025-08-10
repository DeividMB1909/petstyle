// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Importar Administrador directamente para evitar problemas
const mongoose = require('mongoose');
const administradorSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
    rol: String,
    permisos: [String],
    activo: Boolean,
    fechaCreacion: Date,
    ultimoAcceso: Date
}, {
    collection: 'administradors'
});
const Administrador = mongoose.model('AdminAuth', administradorSchema, 'administradors');

const authenticateToken = async (req, res, next) => {
    try {
        let token;

        // Buscar token en headers Authorization o en cookies
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'petstyle_secret_key_2024');
        
        console.log('🔍 Token decoded:', decoded);
        console.log('🔍 Looking for user ID:', decoded.userId);
        
        // PASO 1: Buscar en usuarios normales
        let user = await User.findById(decoded.userId);
        let userType = 'user';
        
        if (user) {
            console.log('✅ User found in users table:', user.email);
        } else {
            console.log('❌ User not found in users table, checking administradors...');
            
            // PASO 2: Buscar en administradores
            user = await Administrador.findById(decoded.userId);
            
            if (user) {
                userType = 'admin';
                console.log('✅ Admin found in administradors table:', user.email);
            } else {
                console.log('❌ User not found in any table');
            }
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Agregar información del usuario a req
        if (userType === 'admin') {
            req.user = {
                userId: user._id,
                email: user.email,
                role: 'admin',
                userType: 'admin',
                isAdmin: true
            };
        } else {
            req.user = {
                userId: user._id,
                email: user.email,
                role: user.role,
                userType: 'user',
                isAdmin: false
            };
        }

        console.log('✅ Authentication successful for:', req.user);
        next();
        
    } catch (error) {
        console.error('❌ Error en autenticación:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Acceso no autorizado'
            });
        }

        console.log('🔍 Checking role authorization:', {
            userRole: req.user.role,
            requiredRoles: roles,
            isAdmin: req.user.isAdmin
        });

        // Si es admin, permitir siempre
        if (req.user.isAdmin || req.user.role === 'admin') {
            console.log('✅ Admin access granted');
            return next();
        }

        if (!roles.includes(req.user.role)) {
            console.log('❌ Role authorization failed');
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para esta acción'
            });
        }

        console.log('✅ Role authorization successful');
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};