const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware para verificar autenticación
const authenticateToken = async (req, res, next) => {
    try {
        let token;

        // Obtener token de diferentes fuentes
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            // Token desde header Authorization: Bearer <token>
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            // Token desde cookie httpOnly
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido. Por favor inicia sesión.'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'petstyle_secret_key_2024');
        
        // Verificar que el usuario aún existe
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido. Usuario no encontrado.'
            });
        }

        // Agregar información del usuario a la request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Por favor inicia sesión nuevamente.'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Error al verificar autenticación',
                error: error.message
            });
        }
    }
};

// Middleware para verificar roles específicos
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Autenticación requerida'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`
            });
        }

        next();
    };
};

// Middleware para verificar que el usuario solo acceda a sus propios datos
const authorizeOwnerOrAdmin = async (req, res, next) => {
    try {
        const requestedUserId = req.params.userId || req.params.id;
        const currentUserId = req.user.userId;
        const currentUserRole = req.user.role;

        // Los admins pueden acceder a cualquier recurso
        if (currentUserRole === 'admin') {
            return next();
        }

        // Los usuarios solo pueden acceder a sus propios recursos
        if (requestedUserId && requestedUserId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo puedes acceder a tus propios datos.'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error en autorización',
            error: error.message
        });
    }
};

// Middleware opcional para rutas que pueden funcionar con o sin autenticación
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'petstyle_secret_key_2024');
                const user = await User.findById(decoded.userId).select('-password');
                
                if (user) {
                    req.user = {
                        userId: decoded.userId,
                        email: decoded.email,
                        role: decoded.role
                    };
                }
            } catch (error) {
                // Si el token es inválido, simplemente continúa sin usuario autenticado
                req.user = null;
            }
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = {
    authenticateToken,
    authorizeRoles,
    authorizeOwnerOrAdmin,
    optionalAuth
};