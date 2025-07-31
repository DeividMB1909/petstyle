const express = require('express');
const { CartController } = require('../controllers');

const router = express.Router();
const { authenticateToken, authorizeOwnerOrAdmin } = require('../middleware/auth');

// Todas las rutas del carrito requieren autenticación
router.use(authenticateToken);

// Y que solo el dueño o admin pueda acceder
router.get('/:userId', authorizeOwnerOrAdmin, CartController.getCart);
router.post('/:userId/add', authorizeOwnerOrAdmin, CartController.addToCart);
router.put('/:userId/item/:productId', authorizeOwnerOrAdmin, CartController.updateCartItem);
router.delete('/:userId/item/:productId', authorizeOwnerOrAdmin, CartController.removeFromCart);
router.delete('/:userId/clear', authorizeOwnerOrAdmin, CartController.clearCart);

// GET /api/cart/:userId - Obtener carrito del usuario
router.get('/:userId', CartController.getCart);

// POST /api/cart/:userId/add - Agregar producto al carrito
router.post('/:userId/add', CartController.addToCart);

// PUT /api/cart/:userId/item/:productId - Actualizar cantidad de producto en carrito
router.put('/:userId/item/:productId', CartController.updateCartItem);

// DELETE /api/cart/:userId/item/:productId - Remover producto del carrito
router.delete('/:userId/item/:productId', CartController.removeFromCart);

// DELETE /api/cart/:userId/clear - Limpiar carrito
router.delete('/:userId/clear', CartController.clearCart);

module.exports = router;