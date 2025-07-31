const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticateToken } = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// ======================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ======================================
const handleAvatarUploadErrors = (error, req, res, next) => {
    if (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Avatar demasiado grande (máximo 2MB)'
            });
        }
        return res.status(400).json({
            success: false,
            message: 'Error al subir avatar',
            error: error.message
        });
    }
    next();
};

// ======================================
// VALIDACIONES
// ======================================
const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('phone')
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage('El teléfono debe tener 10 dígitos'),
    body('address.street')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('La calle no puede exceder 100 caracteres'),
    body('address.city')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('La ciudad no puede exceder 50 caracteres')
];

// ======================================
// RUTAS DE USUARIO
// ======================================

// GET /api/users/profile - Obtener perfil del usuario
router.get('/profile', authenticateToken, UserController.getProfile);

// PUT /api/users/profile - Actualizar perfil
router.put('/profile', [
    authenticateToken,
    ...updateProfileValidation,
    handleValidationErrors
], UserController.updateProfile);

// ✅ NUEVO: PUT /api/users/avatar - Actualizar avatar
router.put('/avatar', [
    authenticateToken,
    uploadAvatar.single('avatar'),
    handleAvatarUploadErrors
], UserController.updateAvatar);

module.exports = router;