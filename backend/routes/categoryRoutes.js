const express = require('express');
const { CategoryController } = require('../controllers');

const router = express.Router();

// GET /api/categories - Obtener todas las categorías
router.get('/', CategoryController.getAllCategories);

// GET /api/categories/active - Obtener categorías activas
router.get('/active', CategoryController.getActiveCategories);

// GET /api/categories/:id - Obtener categoría por ID
router.get('/:id', CategoryController.getCategoryById);

// POST /api/categories - Crear nueva categoría
router.post('/', CategoryController.createCategory);

// PUT /api/categories/:id - Actualizar categoría
router.put('/:id', CategoryController.updateCategory);

// DELETE /api/categories/:id - Eliminar categoría
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;