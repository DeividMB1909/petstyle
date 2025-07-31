const Category = require('../models/Category');
const { validationResult } = require('express-validator');
const { deleteImage } = require('../config/cloudinary');

class CategoryController {
    // ✅ ACTUALIZADO: Crear categoría con imagen
    static createCategory = async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const { name, description, parentCategory, order, imageData } = req.body;

            // ✅ NUEVO: Procesar imagen si se proporciona
            let imageObject = {};
            if (imageData) {
                imageObject = {
                    url: imageData.url,
                    publicId: imageData.publicId
                };
            }

            const category = new Category({
                name,
                description,
                parentCategory: parentCategory || null,
                order: order || 0,
                image: imageObject.url ? imageObject : undefined
            });

            const savedCategory = await category.save();

            // Si es subcategoría, agregar a la categoría padre
            if (parentCategory) {
                await Category.findByIdAndUpdate(
                    parentCategory,
                    { $push: { subcategories: savedCategory._id } }
                );
            }

            res.status(201).json({
                success: true,
                message: 'Categoría creada exitosamente',
                data: savedCategory
            });

        } catch (error) {
            console.error('Error al crear categoría:', error);
            
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de la categoría ya existe'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };

    // ✅ ACTUALIZADO: Actualizar categoría con manejo de imagen
    static updateCategory = async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            const category = await Category.findById(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            // ✅ NUEVO: Manejar actualización de imagen
            if (updates.imageData) {
                // Eliminar imagen anterior si existe
                if (category.image.publicId) {
                    try {
                        await deleteImage(category.image.publicId);
                    } catch (deleteError) {
                        console.warn('Error al eliminar imagen anterior:', deleteError);
                    }
                }

                updates.image = {
                    url: updates.imageData.url,
                    publicId: updates.imageData.publicId
                };
                delete updates.imageData;
            }

            const updatedCategory = await Category.findByIdAndUpdate(
                id,
                updates,
                { new: true, runValidators: true }
            ).populate('parentCategory subcategories');

            res.status(200).json({
                success: true,
                message: 'Categoría actualizada exitosamente',
                data: updatedCategory
            });

        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };

    // ✅ ACTUALIZADO: Eliminar categoría con limpieza de imagen
    static deleteCategory = async (req, res) => {
        try {
            const { id } = req.params;

            const category = await Category.findById(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            // Verificar si tiene subcategorías
            if (category.subcategories && category.subcategories.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar una categoría con subcategorías'
                });
            }

            // ✅ NUEVO: Eliminar imagen de Cloudinary
            if (category.image && category.image.publicId) {
                try {
                    await deleteImage(category.image.publicId);
                } catch (deleteError) {
                    console.warn('Error al eliminar imagen:', deleteError);
                }
            }

            // Eliminar de categoría padre si es subcategoría
            if (category.parentCategory) {
                await Category.findByIdAndUpdate(
                    category.parentCategory,
                    { $pull: { subcategories: id } }
                );
            }

            await Category.findByIdAndDelete(id);

            res.status(200).json({
                success: true,
                message: 'Categoría eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };

    // ✅ NUEVO: Crear categoría con imagen en una sola operación
    static createCategoryWithImage = async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            // La imagen ya fue procesada por multer/cloudinary
            const imageData = req.file ? {
                url: req.file.path,
                publicId: req.file.filename
            } : {};

            const categoryData = {
                ...req.body,
                image: imageData
            };

            const category = new Category(categoryData);
            const savedCategory = await category.save();

            // Si es subcategoría, agregar a la categoría padre
            if (req.body.parentCategory) {
                await Category.findByIdAndUpdate(
                    req.body.parentCategory,
                    { $push: { subcategories: savedCategory._id } }
                );
            }

            res.status(201).json({
                success: true,
                message: 'Categoría creada exitosamente con imagen',
                data: savedCategory
            });

        } catch (error) {
            console.error('Error al crear categoría con imagen:', error);
            
            // Si hay error, eliminar imagen subida
            if (req.file) {
                try {
                    await deleteImage(req.file.filename);
                } catch (deleteError) {
                    console.warn('Error al limpiar imagen:', deleteError);
                }
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };

    // Métodos existentes permanecen igual...
    static getCategories = async (req, res) => {
        try {
            const { parent, includeInactive } = req.query;
            
            const query = {};
            
            if (parent) {
                query.parentCategory = parent;
            }
            
            if (!includeInactive) {
                query.isActive = true;
            }

            const categories = await Category.find(query)
                .populate('parentCategory', 'name')
                .populate('subcategories', 'name')
                .sort({ order: 1, name: 1 });

            res.status(200).json({
                success: true,
                data: categories
            });

        } catch (error) {
            console.error('Error al obtener categorías:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };

    static getCategory = async (req, res) => {
        try {
            const { id } = req.params;

            const category = await Category.findById(id)
                .populate('parentCategory', 'name')
                .populate('subcategories');

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                data: category
            });

        } catch (error) {
            console.error('Error al obtener categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };
}

module.exports = CategoryController;