const { Category } = require('../models');

class CategoryController {
    // Obtener todas las categorías
    static async getAllCategories(req, res) {
        try {
            const categories = await Category.find();
            res.status(200).json({
                success: true,
                data: categories,
                message: 'Categorías obtenidas exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener categorías',
                error: error.message
            });
        }
    }

    // Obtener categoría por ID
    static async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findById(id);
            
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                data: category,
                message: 'Categoría obtenida exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener categoría',
                error: error.message
            });
        }
    }

    // Crear nueva categoría
    static async createCategory(req, res) {
        try {
            const categoryData = req.body;
            
            // Verificar si ya existe una categoría con el mismo nombre
            const existingCategory = await Category.findOne({ name: categoryData.name });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una categoría con ese nombre'
                });
            }

            const newCategory = new Category(categoryData);
            await newCategory.save();

            res.status(201).json({
                success: true,
                data: newCategory,
                message: 'Categoría creada exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al crear categoría',
                error: error.message
            });
        }
    }

    // Actualizar categoría
    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Si se está actualizando el nombre, verificar que no exista
            if (updateData.name) {
                const existingCategory = await Category.findOne({ 
                    name: updateData.name, 
                    _id: { $ne: id } 
                });
                if (existingCategory) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe una categoría con ese nombre'
                    });
                }
            }

            const updatedCategory = await Category.findByIdAndUpdate(
                id, 
                updateData, 
                { new: true, runValidators: true }
            );

            if (!updatedCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                data: updatedCategory,
                message: 'Categoría actualizada exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al actualizar categoría',
                error: error.message
            });
        }
    }

    // Eliminar categoría
    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const deletedCategory = await Category.findByIdAndDelete(id);

            if (!deletedCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Categoría eliminada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar categoría',
                error: error.message
            });
        }
    }

    // Obtener categoría por nombre
    static async getCategoryByName(req, res) {
        try {
            const { name } = req.params;
            const category = await Category.findOne({ 
                name: { $regex: new RegExp(name, 'i') } // Búsqueda insensible a mayúsculas
            });
            
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada con ese nombre'
                });
            }

            res.status(200).json({
                success: true,
                data: category,
                message: 'Categoría obtenida exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener categoría por nombre',
                error: error.message
            });
        }
    }

    // Eliminar categoría por nombre
    static async deleteCategoryByName(req, res) {
        try {
            const { name } = req.params;
            const deletedCategory = await Category.findOneAndDelete({ 
                name: { $regex: new RegExp(name, 'i') }
            });

            if (!deletedCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada con ese nombre'
                });
            }

            res.status(200).json({
                success: true,
                message: `Categoría "${deletedCategory.name}" eliminada exitosamente`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar categoría por nombre',
                error: error.message
            });
        }
    }

    // Obtener categorías activas
    static async getActiveCategories(req, res) {
        try {
            const activeCategories = await Category.find({ isActive: true });
            res.status(200).json({
                success: true,
                data: activeCategories,
                message: 'Categorías activas obtenidas exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener categorías activas',
                error: error.message
            });
        }
    }
}

module.exports = CategoryController;