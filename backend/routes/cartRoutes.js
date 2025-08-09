// backend/routes/cartRoutes.js
const express = require('express');
const CartController = require('../controllers/CartController'); // ✅ Sin destructuring
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { body, param } = require('express-validator');

const router = express.Router();

// ======================================
// VALIDACIONES PERSONALIZADAS
// ======================================
const validateUserId = [
    param('userId')
        .isMongoId()
        .withMessage('ID de usuario inválido')
];

const validateProductId = [
    param('productId')
        .isMongoId()
        .withMessage('ID de producto inválido')
];

const validateAddToCart = [
    body('productId')
        .isMongoId()
        .withMessage('ID de producto inválido'),
    body('quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un número entero mayor a 0')
];

const validateUpdateCartItem = [
    body('quantity')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un número entero mayor a 0')
];

// ======================================
// MIDDLEWARE PERSONALIZADO
// ======================================
const authorizeOwnerOrAdmin = (req, res, next) => {
    const { userId } = req.params;
    const currentUser = req.user;

    // Permitir si es admin o si es el dueño del carrito
    if (currentUser.role === 'admin' || currentUser.userId.toString() === userId) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este carrito'
    });
};

// ======================================
// RUTAS PROTEGIDAS
// ======================================

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// GET /api/cart/:userId - Obtener carrito del usuario
router.get('/:userId', [
    ...validateUserId,
    handleValidationErrors,
    authorizeOwnerOrAdmin
], CartController.getCart);

// POST /api/cart/:userId/add - Agregar producto al carrito
router.post('/:userId/add', [
    ...validateUserId,
    ...validateAddToCart,
    handleValidationErrors,
    authorizeOwnerOrAdmin
], CartController.addToCart);

// PUT /api/cart/:userId/item/:productId - Actualizar cantidad en carrito
router.put('/:userId/item/:productId', [
    ...validateUserId,
    ...validateProductId,
    ...validateUpdateCartItem,
    handleValidationErrors,
    authorizeOwnerOrAdmin
], CartController.updateCartItem);

// DELETE /api/cart/:userId/item/:productId - Remover producto del carrito
router.delete('/:userId/item/:productId', [
    ...validateUserId,
    ...validateProductId,
    handleValidationErrors,
    authorizeOwnerOrAdmin
], CartController.removeFromCart);

// DELETE /api/cart/:userId/clear - Limpiar carrito completo
router.delete('/:userId/clear', [
    ...validateUserId,
    handleValidationErrors,
    authorizeOwnerOrAdmin
], CartController.clearCart);

module.exports = router;