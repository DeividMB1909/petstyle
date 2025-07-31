const { User } = require('../models');

class UserController {
    // Obtener todos los usuarios
    static async getAllUsers(req, res) {
        try {
            const users = await User.find().select('-password'); // Excluir password por seguridad
            res.status(200).json({
                success: true,
                data: users,
                message: 'Usuarios obtenidos exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios',
                error: error.message
            });
        }
    }

    // Obtener usuario por ID
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id).select('-password');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: user,
                message: 'Usuario obtenido exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuario',
                error: error.message
            });
        }
    }

    // Crear nuevo usuario
    static async createUser(req, res) {
        try {
            const userData = req.body;
            
            // Verificar si el email ya existe
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está registrado'
                });
            }

            const newUser = new User(userData);
            await newUser.save();

            // Remover password de la respuesta
            const userResponse = newUser.toObject();
            delete userResponse.password;

            res.status(201).json({
                success: true,
                data: userResponse,
                message: 'Usuario creado exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al crear usuario',
                error: error.message
            });
        }
    }

    // Actualizar usuario
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Si se está actualizando el email, verificar que no exista
            if (updateData.email) {
                const existingUser = await User.findOne({ 
                    email: updateData.email, 
                    _id: { $ne: id } 
                });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'El email ya está en uso por otro usuario'
                    });
                }
            }

            const updatedUser = await User.findByIdAndUpdate(
                id, 
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
                data: updatedUser,
                message: 'Usuario actualizado exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al actualizar usuario',
                error: error.message
            });
        }
    }

    // Obtener usuario por email
    static async getUserByEmail(req, res) {
        try {
            const { email } = req.params;
            const user = await User.findOne({ email: email }).select('-password');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado con ese email'
                });
            }

            res.status(200).json({
                success: true,
                data: user,
                message: 'Usuario obtenido exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuario por email',
                error: error.message
            });
        }
    }

    // Eliminar usuario por email
    static async deleteUserByEmail(req, res) {
        try {
            const { email } = req.params;
            const deletedUser = await User.findOneAndDelete({ email: email });

            if (!deletedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado con ese email'
                });
            }

            res.status(200).json({
                success: true,
                message: `Usuario ${deletedUser.name} eliminado exitosamente`,
                data: {
                    deletedUser: {
                        name: deletedUser.name,
                        email: deletedUser.email
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar usuario por email',
                error: error.message
            });
        }
    }

    // Eliminar usuario
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const deletedUser = await User.findByIdAndDelete(id);

            if (!deletedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Usuario eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar usuario',
                error: error.message
            });
        }
    }
}

module.exports = UserController;