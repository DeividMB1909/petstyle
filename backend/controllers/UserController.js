const User = require('../models/User');
const { validationResult } = require('express-validator');
const { deleteImage } = require('../config/cloudinary');

class UserController {
    // ✅ NUEVO: Actualizar avatar del usuario
    static updateAvatar = async (req, res) => {
        try {
            const userId = req.user.userId;

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionó archivo de imagen'
                });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Eliminar avatar anterior si existe
            if (user.avatar.publicId) {
                try {
                    await deleteImage(user.avatar.publicId);
                } catch (deleteError) {
                    console.warn('Error al eliminar avatar anterior:', deleteError);
                }
            }

            // Actualizar con nuevo avatar
            user.avatar = {
                url: req.file.path,
                publicId: req.file.filename
            };

            await user.save();

            res.status(200).json({
                success: true,
                message: 'Avatar actualizado exitosamente',
                data: {
                    avatar: user.avatar
                }
            });

        } catch (error) {
            console.error('Error al actualizar avatar:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };

    // Métodos existentes permanecen igual...
    static getProfile = async (req, res) => {
        try {
            const userId = req.user.userId;
            const user = await User.findById(userId).populate('favorites');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: user.toPublicJSON()
            });

        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };

    static updateProfile = async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const userId = req.user.userId;
            const updates = req.body;

            // No permitir actualizar campos sensibles
            delete updates.password;
            delete updates.role;
            delete updates.email;

            const user = await User.findByIdAndUpdate(
                userId,
                updates,
                { new: true, runValidators: true }
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Perfil actualizado exitosamente',
                data: user.toPublicJSON()
            });

        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };
}

module.exports = UserController;