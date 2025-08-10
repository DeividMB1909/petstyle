const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Importación directa del modelo Administrador
const mongoose = require('mongoose');

// Definir el schema directamente en el controller para evitar problemas de importación
const administradorSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
    rol: String,
    permisos: [String],
    activo: Boolean,
    fechaCreacion: Date,
    ultimoAcceso: Date
}, {
    collection: 'administradors' // Nombre exacto de tu colección
});

const Administrador = mongoose.model('AdminTemp', administradorSchema, 'administradors');

class AuthController {
    // Registro de usuario (mantener igual)
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

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    user: userResponse,
                    token: token
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

    // Login SIMPLIFICADO Y DIRECTO
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y password son requeridos'
                });
            }

            console.log('🔍 === INICIO LOGIN ===');
            console.log('📧 Email:', email);
            console.log('🔐 Password:', password);

            let user = null;
            let userType = null;
            let isPasswordValid = false;

            // PASO 1: Buscar en usuarios normales
            console.log('🔍 PASO 1: Buscando en users...');
            try {
                user = await User.findOne({ email }).select('+password');
                console.log('👤 Usuario encontrado en users:', !!user);
                
                if (user) {
                    userType = 'user';
                    isPasswordValid = await user.comparePassword(password);
                    console.log('✅ Password válido (user):', isPasswordValid);
                    
                    if (isPasswordValid) {
                        user.lastLogin = new Date();
                        await user.save();
                        console.log('🎯 LOGIN EXITOSO COMO USER');
                    }
                }
            } catch (error) {
                console.error('❌ Error en users:', error.message);
            }

            // PASO 2: Si no funciona, buscar en administradors
            if (!user || !isPasswordValid) {
                console.log('🔍 PASO 2: Buscando en administradors...');
                try {
                    // Buscar directamente en la colección
                    user = await Administrador.findOne({ email: email });
                    console.log('👨‍💼 Admin encontrado:', !!user);
                    
                    if (user) {
                        console.log('📋 Admin data:', {
                            nombre: user.nombre,
                            email: user.email,
                            rol: user.rol,
                            activo: user.activo
                        });
                        
                        userType = 'admin';
                        // Verificar password
                        isPasswordValid = await bcrypt.compare(password, user.password);
                        console.log('✅ Password válido (admin):', isPasswordValid);
                        
                        if (isPasswordValid) {
                            // Actualizar último acceso
                            user.ultimoAcceso = new Date();
                            await user.save();
                            console.log('🎯 LOGIN EXITOSO COMO ADMIN');
                        }
                    }
                } catch (error) {
                    console.error('❌ Error en administradors:', error.message);
                }
            }

            console.log('🔍 RESULTADOS FINALES:');
            console.log('👤 Usuario encontrado:', !!user);
            console.log('🔐 Password válido:', isPasswordValid);
            console.log('👥 Tipo usuario:', userType);

            // Verificar credenciales
            if (!user || !isPasswordValid) {
                console.log('❌ LOGIN FALLIDO - Credenciales inválidas');
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar si admin está activo
            if (userType === 'admin' && user.activo === false) {
                console.log('❌ LOGIN FALLIDO - Admin desactivado');
                return res.status(401).json({
                    success: false,
                    message: 'Cuenta desactivada'
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                { 
                    userId: user._id, 
                    email: user.email, 
                    role: userType === 'admin' ? 'admin' : user.role,
                    userType: userType
                },
                process.env.JWT_SECRET || 'petstyle_secret_key_2024',
                { expiresIn: '7d' }
            );

            // Preparar respuesta
            let userResponse;
            
            if (userType === 'admin') {
                userResponse = {
                    id: user._id,
                    name: user.nombre,
                    email: user.email,
                    role: 'admin',
                    userType: 'admin',
                    isAdmin: true,
                    permissions: user.permisos || [],
                    lastAccess: user.ultimoAcceso
                };
            } else {
                userResponse = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    userType: 'user',
                    isAdmin: false,
                    phone: user.phone,
                    address: user.address,
                    dateOfBirth: user.dateOfBirth,
                    lastLogin: user.lastLogin
                };
            }

            // Cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            console.log('🎉 LOGIN COMPLETAMENTE EXITOSO');
            console.log('📤 Enviando respuesta:', {
                userType: userType,
                role: userResponse.role,
                isAdmin: userResponse.isAdmin
            });

            res.status(200).json({
                success: true,
                message: 'Login exitoso',
                user: userResponse,
                token: token,
                redirectTo: userType === 'admin' ? '/admin.html' : '/main.html'
            });

        } catch (error) {
            console.error('💥 ERROR CRÍTICO EN LOGIN:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el login',
                error: error.message
            });
        }
    }

    // Resto de métodos (mantener igual)
    static async logout(req, res) {
        try {
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

    static async getProfile(req, res) {
        try {
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

    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Password actual y nuevo password son requeridos'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'El nuevo password debe tener al menos 6 caracteres'
                });
            }

            const user = await User.findById(userId).select('+password');
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Password actual incorrecto'
                });
            }

            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

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

    static async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const updateData = req.body;

            delete updateData.email;
            delete updateData.password;
            delete updateData.role;

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

    static async verifyToken(req, res) {
        try {
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