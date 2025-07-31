const express = require('express');
const ProductController = require('../controllers/ProductController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { uploadProduct } = require('../config/cloudinary');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// ======================================
// VALIDACIONES
// ======================================
const productValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo'),
    body('category')
        .isMongoId()
        .withMessage('ID de categoría inválido'),
    body('sku')
        .trim()
        .isLength({ min: 2, max: 20 })
        .withMessage('El SKU debe tener entre 2 y 20 caracteres'),
    body('stock')
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero positivo')
];

const handleUploadErrors = (error, req, res, next) => {
    if (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Archivo demasiado grande (máximo 5MB)'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Máximo 10 imágenes por producto'
            });
        }
        return res.status(400).json({
            success: false,
            message: 'Error al subir archivo',
            error: error.message
        });
    }
    next();
};

// ======================================
// RUTAS PÚBLICAS
// ======================================

// GET /api/products - Obtener productos (con filtros)
router.get('/', ProductController.getProducts);

// GET /api/products/:id - Obtener producto específico
router.get('/:id', [
    param('id').isMongoId().withMessage('ID de producto inválido'),
    handleValidationErrors
], ProductController.getProduct);

// ======================================
// RUTAS ADMIN
// ======================================

// POST /api/products - Crear producto (sin imágenes)
router.post('/', [
    authenticateToken,
    authorizeRoles('admin'),
    ...productValidation,
    handleValidationErrors
], ProductController.createProduct);

// ✅ NUEVO: POST /api/products/with-images - Crear producto con imágenes
router.post('/with-images', [
    authenticateToken,
    authorizeRoles('admin'),
    uploadProduct.array('images', 10),
    handleUploadErrors,
    ...productValidation,
    handleValidationErrors
], ProductController.createProductWithImages);

// PUT /api/products/:id - Actualizar producto
router.put('/:id', [
    authenticateToken,
    authorizeRoles('admin'),
    param('id').isMongoId().withMessage('ID de producto inválido'),
    ...productValidation,
    handleValidationErrors
], ProductController.updateProduct);

// ✅ NUEVO: PUT /api/products/:id/images - Actualizar solo imágenes
router.put('/:id/images', [
    authenticateToken,
    authorizeRoles('admin'),
    param('id').isMongoId().withMessage('ID de producto inválido'),
    uploadProduct.array('images', 10),
    handleUploadErrors,
    handleValidationErrors
], ProductController.updateProductImages);

// DELETE /api/products/:id - Eliminar producto
router.delete('/:id', [
    authenticateToken,
    authorizeRoles('admin'),
    param('id').isMongoId().withMessage('ID de producto inválido'),
    handleValidationErrors
], ProductController.deleteProduct);

module.exports = router;