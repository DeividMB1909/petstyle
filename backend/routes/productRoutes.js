const express = require('express');
const { ProductController } = require('../controllers');

const router = express.Router();

// GET /api/products - Obtener todos los productos (con filtros y paginación)
router.get('/', ProductController.getAllProducts);

// GET /api/products/search - Buscar productos
router.get('/search', ProductController.searchProducts);

// GET /api/products/category/:categoryId - Obtener productos por categoría
router.get('/category/:categoryId', ProductController.getProductsByCategory);

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', ProductController.getProductById);

// POST /api/products - Crear nuevo producto
router.post('/', ProductController.createProduct);

// PUT /api/products/:id - Actualizar producto
router.put('/:id', ProductController.updateProduct);

// DELETE /api/products/:id - Eliminar producto
router.delete('/:id', ProductController.deleteProduct);

// GET /api/products/name/:name - Obtener producto por nombre
router.get('/name/:name', ProductController.getProductByName);

// DELETE /api/products/name/:name - Eliminar producto por nombre
router.delete('/name/:name', ProductController.deleteProductByName);

module.exports = router;