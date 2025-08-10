// backend/routes/authRoutes.js
const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');

const router = express.Router();

// ======================================
// VALIDACIONES
// ======================================
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('phone')
        .matches(/^[0-9]{10}$/)
        .withMessage('El teléfono debe tener 10 dígitos')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('La contraseña actual es requerida'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];

// ======================================
// RUTAS PÚBLICAS
// ======================================

// POST /api/auth/register - Registro de usuario
router.post('/register', [
    ...registerValidation,
    handleValidationErrors
], AuthController.register);

// POST /api/auth/login - Login de usuario
router.post('/login', [
    ...loginValidation,
    handleValidationErrors
], AuthController.login);

// POST /api/auth/logout - Logout de usuario
router.post('/logout', AuthController.logout);

// ======================================
// RUTAS PROTEGIDAS
// ======================================

// GET /api/auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, AuthController.getProfile);

// PUT /api/auth/profile - Actualizar perfil del usuario autenticado
router.put('/profile', authenticateToken, AuthController.updateProfile);

// POST /api/auth/change-password - Cambiar contraseña
router.post('/change-password', [
    authenticateToken,
    ...changePasswordValidation,
    handleValidationErrors
], AuthController.changePassword);

// GET /api/auth/verify - Verificar si el token es válido
router.get('/verify', authenticateToken, AuthController.verifyToken);

module.exports = router;