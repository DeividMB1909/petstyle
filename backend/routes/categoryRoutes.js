const express = require('express');
const CategoryController = require('../controllers/CategoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { uploadCategory } = require('../config/cloudinary');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// ======================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ======================================
const handleCategoryUploadErrors = (error, req, res, next) => {
    if (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Imagen demasiado grande (máximo 3MB)'
            });
        }
        return res.status(400).json({
            success: false,
            message: 'Error al subir imagen',
            error: error.message
        });
    }
    next();
};

// ======================================
// VALIDACIONES
// ======================================
const categoryValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 30 })
        .withMessage('El nombre debe tener entre 2 y 30 caracteres'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La descripción no puede exceder 200 caracteres'),
    body('parentCategory')
        .optional()
        .isMongoId()
        .withMessage('ID de categoría padre inválido'),
    body('order')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El orden debe ser un número entero positivo')
];

// ======================================
// RUTAS PÚBLICAS
// ======================================

// GET /api/categories - Obtener categorías
router.get('/', CategoryController.getCategories);

// GET /api/categories/:id - Obtener categoría específica
router.get('/:id', [
    param('id').isMongoId().withMessage('ID de categoría inválido'),
    handleValidationErrors
], CategoryController.getCategory);

// ======================================
// RUTAS ADMIN
// ======================================

// POST /api/categories - Crear categoría (sin imagen)
router.post('/', [
    authenticateToken,
    authorizeRoles('admin'),
    ...categoryValidation,
    handleValidationErrors
], CategoryController.createCategory);

// ✅ NUEVO: POST /api/categories/with-image - Crear categoría con imagen
router.post('/with-image', [
    authenticateToken,
    authorizeRoles('admin'),
    uploadCategory.single('image'),
    handleCategoryUploadErrors,
    ...categoryValidation,
    handleValidationErrors
], CategoryController.createCategoryWithImage);

// PUT /api/categories/:id - Actualizar categoría
router.put('/:id', [
    authenticateToken,
    authorizeRoles('admin'),
    param('id').isMongoId().withMessage('ID de categoría inválido'),
    ...categoryValidation,
    handleValidationErrors
], CategoryController.updateCategory);

// DELETE /api/categories/:id - Eliminar categoría
router.delete('/:id', [
    authenticateToken,
    authorizeRoles('admin'),
    param('id').isMongoId().withMessage('ID de categoría inválido'),
    handleValidationErrors
], CategoryController.deleteCategory);

module.exports = router;