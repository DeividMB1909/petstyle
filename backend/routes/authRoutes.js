const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');
const { 
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdate,
    handleValidationErrors
} = require('../middleware/validation');
const { body } = require('express-validator');

const router = express.Router();

// ======================================
// RUTAS PÚBLICAS (No requieren auth)
// ======================================

// POST /api/auth/register - Registro de usuario
router.post('/register', 
    validateUserRegistration,
    AuthController.register
);

// POST /api/auth/login - Login de usuario
router.post('/login', 
    validateUserLogin,
    AuthController.login
);

// POST /api/auth/logout - Logout de usuario
router.post('/logout', 
    AuthController.logout
);

// ======================================
// RUTAS PROTEGIDAS (Requieren auth)
// ======================================

// GET /api/auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', 
    authenticateToken, 
    AuthController.getProfile
);

// PUT /api/auth/profile - Actualizar perfil del usuario autenticado
router.put('/profile', 
    authenticateToken,
    validateUserUpdate,
    AuthController.updateProfile
);

// PUT /api/auth/change-password - Cambiar contraseña
router.put('/change-password', [
    authenticateToken,
    body('currentPassword')
        .notEmpty()
        .withMessage('La contraseña actual es requerida'),
    
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
    
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        }),
    
    handleValidationErrors
], AuthController.changePassword);

// GET /api/auth/verify - Verificar si el token es válido
router.get('/verify', 
    authenticateToken, 
    AuthController.verifyToken
);

module.exports = router;