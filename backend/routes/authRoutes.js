const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register - Registro de usuario
router.post('/register', AuthController.register);

// POST /api/auth/login - Login de usuario
router.post('/login', AuthController.login);

// POST /api/auth/logout - Logout de usuario
router.post('/logout', AuthController.logout);

// GET /api/auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, AuthController.getProfile);

// PUT /api/auth/change-password - Cambiar password
router.put('/change-password', authenticateToken, AuthController.changePassword);

// GET /api/auth/verify - Verificar si el token es válido
router.get('/verify', authenticateToken, AuthController.verifyToken);

// PUT /api/auth/profile - Actualizar perfil del usuario autenticado
router.put('/profile', authenticateToken, AuthController.updateProfile);

module.exports = router;