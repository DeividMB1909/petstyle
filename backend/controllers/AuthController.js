const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
    // Registro de usuario
    static async register(req, res) {
        try {
            const { name, email, password, phone, role = 'customer', address, dateOfBirth } = req.body;

            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está registrado'
                });
            }

            // Encriptar password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Crear nuevo usuario
            const userData = {
                name,
                email,
                password: hashedPassword,
                phone,
                role,
                dateOfBirth
            };

            // Solo agregar address si se proporciona completo
            if (address && address.street && address.city && address.state && address.zipCode) {
                userData.address = address;
            }

            const newUser = new User(userData);

            await newUser.save();

            // Generar token JWT
            const token = jwt.sign(
                { 
                    userId: newUser._id, 
                    email: newUser.email, 
                    role: newUser.role 
                },
                process.env.JWT_SECRET || 'petstyle_secret_key_2024',
                { expiresIn: '7d' }
            );

            // Respuesta sin password
            const userResponse = {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                phone: newUser.phone,
                address: newUser.address,
                dateOfBirth: newUser.dateOfBirth,
                createdAt: newUser.createdAt
            };

            // Configurar cookie httpOnly para el token
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
            });

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    user: userResponse,
                    token: token // También enviamos el token en la respuesta para apps móviles
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al registrar usuario',
                error: error.message
            });
        }
    }

    // Login de usuario
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validar que se proporcionen email y password
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y password son requeridos'
                });
            }

            // Buscar usuario por email e incluir password explícitamente
            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar password usando el método del modelo
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                { 
                    userId: user._id, 
                    email: user.email, 
                    role: user.role 
                },
                process.env.JWT_SECRET || 'petstyle_secret_key_2024',
                { expiresIn: '7d' }
            );

            // Actualizar último login
            user.lastLogin = new Date();
            await user.save();

            // Respuesta sin password
            const userResponse = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                dateOfBirth: user.dateOfBirth,
                lastLogin: user.lastLogin
            };

            // Configurar cookie httpOnly para el token
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
            });

            res.status(200).json({
                success: true,
                message: 'Login exitoso',
                data: {
                    user: userResponse,
                    token: token
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error en el login',
                error: error.message
            });
        }
    }

    // Logout de usuario
    static async logout(req, res) {
        try {
            // Limpiar cookie del token
            res.clearCookie('token');

            res.status(200).json({
                success: true,
                message: 'Logout exitoso'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error en el logout',
                error: error.message
            });
        }
    }

    // Obtener perfil del usuario autenticado
    static async getProfile(req, res) {
        try {
            // El usuario viene del middleware de autenticación
            const user = await User.findById(req.user.userId).select('-password');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Perfil obtenido exitosamente',
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener perfil',
                error: error.message
            });
        }
    }

    // Cambiar password
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId;

            // Validar que se proporcionen ambos passwords
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Password actual y nuevo password son requeridos'
                });
            }

            // Validar longitud del nuevo password
            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'El nuevo password debe tener al menos 6 caracteres'
                });
            }

            // Buscar usuario e incluir password explícitamente
            const user = await User.findById(userId).select('+password');
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verificar password actual usando el método del modelo
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Password actual incorrecto'
                });
            }

            // Encriptar nuevo password y actualizar directamente
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            // Actualizar password directamente en la base de datos
            await User.findByIdAndUpdate(userId, { 
                password: hashedNewPassword 
            });

            res.status(200).json({
                success: true,
                message: 'Password cambiado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al cambiar password',
                error: error.message
            });
        }
    }

    // Actualizar perfil del usuario autenticado
    static async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const updateData = req.body;

            // No permitir actualizar email y password por esta ruta
            delete updateData.email;
            delete updateData.password;
            delete updateData.role; // Solo admins pueden cambiar roles

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Perfil actualizado exitosamente',
                data: updatedUser
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al actualizar perfil',
                error: error.message
            });
        }
    }

    // Verificar si el token es válido
    static async verifyToken(req, res) {
        try {
            // El middleware de autenticación ya verificó el token
            const user = await User.findById(req.user.userId).select('-password');
            
            res.status(200).json({
                success: true,
                message: 'Token válido',
                data: {
                    user: user,
                    tokenInfo: {
                        userId: req.user.userId,
                        email: req.user.email,
                        role: req.user.role
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al verificar token',
                error: error.message
            });
        }
    }
}

module.exports = AuthController;