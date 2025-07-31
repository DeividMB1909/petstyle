const express = require('express');
const { CategoryController } = require('../controllers');

const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Ver categorías - público
router.get('/', CategoryController.getAllCategories);
router.get('/active', CategoryController.getActiveCategories);
router.get('/:id', CategoryController.getCategoryById);
router.get('/name/:name', CategoryController.getCategoryByName);

// Gestionar categorías - solo admins
router.post('/', authenticateToken, authorizeRoles('admin'), CategoryController.createCategory);
router.put('/:id', authenticateToken, authorizeRoles('admin'), CategoryController.updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), CategoryController.deleteCategory);
router.delete('/name/:name', authenticateToken, authorizeRoles('admin'), CategoryController.deleteCategoryByName);

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

// GET /api/categories/name/:name - Obtener categoría por nombre
router.get('/name/:name', CategoryController.getCategoryByName);

// DELETE /api/categories/name/:name - Eliminar categoría por nombre
router.delete('/name/:name', CategoryController.deleteCategoryByName);

module.exports = router;