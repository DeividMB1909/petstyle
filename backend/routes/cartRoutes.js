const express = require('express');
const { CartController } = require('../controllers');
const { 
    authenticateToken, 
    authorizeOwnerOrAdmin 
} = require('../middleware/auth');
const { 
    validateAddToCart,
    validateUpdateCartItem,
    validateUserId,
    validateProductId,
    handleValidationErrors
} = require('../middleware/validation');
const { param } = require('express-validator');

const router = express.Router();

// ======================================
// TODAS las rutas del carrito requieren autenticación
// ======================================
router.use(authenticateToken);

// ======================================
// RUTAS PROTEGIDAS (Owner o Admin)
// ======================================

// GET /api/cart/:userId - Obtener carrito del usuario
router.get('/:userId', 
    validateUserId,
    authorizeOwnerOrAdmin,
    CartController.getCart
);

// POST /api/cart/:userId/add - Agregar producto al carrito
router.post('/:userId/add', [
    param('userId')
        .isMongoId()
        .withMessage('ID de usuario inválido'),
    validateAddToCart,
    handleValidationErrors
], authorizeOwnerOrAdmin, CartController.addToCart);

// PUT /api/cart/:userId/item/:productId - Actualizar cantidad en carrito
router.put('/:userId/item/:productId', [
    param('userId')
        .isMongoId()
        .withMessage('ID de usuario inválido'),
    param('productId')
        .isMongoId()
        .withMessage('ID de producto inválido'),
    validateUpdateCartItem,
    handleValidationErrors
], authorizeOwnerOrAdmin, CartController.updateCartItem);

// DELETE /api/cart/:userId/item/:productId - Remover producto del carrito
router.delete('/:userId/item/:productId', [
    param('userId')
        .isMongoId()
        .withMessage('ID de usuario inválido'),
    param('productId')
        .isMongoId()
        .withMessage('ID de producto inválido'),
    handleValidationErrors
], authorizeOwnerOrAdmin, CartController.removeFromCart);

// DELETE /api/cart/:userId/clear - Limpiar carrito completo
router.delete('/:userId/clear', 
    validateUserId,
    authorizeOwnerOrAdmin,
    CartController.clearCart
);

module.exports = router;