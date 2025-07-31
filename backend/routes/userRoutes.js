const express = require('express');
const { UserController } = require('../controllers');

const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Proteger todas las rutas de usuarios (solo admins pueden gestionar usuarios)
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// GET /api/users - Obtener todos los usuarios
router.get('/', UserController.getAllUsers);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', UserController.getUserById);

// POST /api/users - Crear nuevo usuario
router.post('/', UserController.createUser);

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', UserController.updateUser);

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', UserController.deleteUser);

// GET /api/users/email/:email - Obtener usuario por email
router.get('/email/:email', UserController.getUserByEmail);

// DELETE /api/users/email/:email - Eliminar usuario por email
router.delete('/email/:email', UserController.deleteUserByEmail);

module.exports = router;