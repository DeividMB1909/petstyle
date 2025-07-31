const { Product, Category } = require('../models');

class ProductController {
    // Obtener todos los productos
    static async getAllProducts(req, res) {
        try {
            const { page = 1, limit = 10, category, minPrice, maxPrice, isActive } = req.query;
            
            // Construir filtros
            const filters = {};
            if (category) filters.category = category;
            if (minPrice || maxPrice) {
                filters.price = {};
                if (minPrice) filters.price.$gte = parseFloat(minPrice);
                if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
            }
            if (isActive !== undefined) filters.isActive = isActive === 'true';

            const products = await Product.find(filters)
                .populate('category', 'name description')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 });

            const total = await Product.countDocuments(filters);

            res.status(200).json({
                success: true,
                data: products,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                },
                message: 'Productos obtenidos exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener productos',
                error: error.message
            });
        }
    }

    // Obtener producto por ID
    static async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findById(id).populate('category', 'name description');
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: product,
                message: 'Producto obtenido exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener producto',
                error: error.message
            });
        }
    }

    // Obtener producto por nombre exacto
    static async getProductByName(req, res) {
        try {
            const { name } = req.params;
            const product = await Product.findOne({ 
                name: { $regex: new RegExp(name, 'i') }
            }).populate('category', 'name description');
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado con ese nombre'
                });
            }

            res.status(200).json({
                success: true,
                data: product,
                message: 'Producto obtenido exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener producto por nombre',
                error: error.message
            });
        }
    }

    // Eliminar producto por nombre
    static async deleteProductByName(req, res) {
        try {
            const { name } = req.params;
            const deletedProduct = await Product.findOneAndDelete({ 
                name: { $regex: new RegExp(name, 'i') }
            });

            if (!deletedProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado con ese nombre'
                });
            }

            res.status(200).json({
                success: true,
                message: `Producto "${deletedProduct.name}" eliminado exitosamente`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar producto por nombre',
                error: error.message
            });
        }
    }

    // Crear nuevo producto
    static async createProduct(req, res) {
        try {
            const productData = req.body;
            
            // Verificar que la categoría existe
            if (productData.category) {
                const categoryExists = await Category.findById(productData.category);
                if (!categoryExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'La categoría especificada no existe'
                    });
                }
            }

            const newProduct = new Product(productData);
            await newProduct.save();

            // Poblar la categoría en la respuesta
            await newProduct.populate('category', 'name description');

            res.status(201).json({
                success: true,
                data: newProduct,
                message: 'Producto creado exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al crear producto',
                error: error.message
            });
        }
    }

    // Actualizar producto
    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Verificar que la categoría existe si se está actualizando
            if (updateData.category) {
                const categoryExists = await Category.findById(updateData.category);
                if (!categoryExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'La categoría especificada no existe'
                    });
                }
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                id, 
                updateData, 
                { new: true, runValidators: true }
            ).populate('category', 'name description');

            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: updatedProduct,
                message: 'Producto actualizado exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al actualizar producto',
                error: error.message
            });
        }
    }

    // Eliminar producto
    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const deletedProduct = await Product.findByIdAndDelete(id);

            if (!deletedProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar producto',
                error: error.message
            });
        }
    }

    // Obtener productos por categoría
    static async getProductsByCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const products = await Product.find({ 
                category: categoryId, 
                isActive: true 
            })
                .populate('category', 'name description')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 });

            const total = await Product.countDocuments({ 
                category: categoryId, 
                isActive: true 
            });

            res.status(200).json({
                success: true,
                data: products,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                },
                message: 'Productos de la categoría obtenidos exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener productos por categoría',
                error: error.message
            });
        }
    }

    // Buscar productos
    static async searchProducts(req, res) {
        try {
            const { q, page = 1, limit = 10 } = req.query;
            
            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Parámetro de búsqueda requerido'
                });
            }

            const searchRegex = new RegExp(q, 'i');
            const products = await Product.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex }
                ],
                isActive: true
            })
                .populate('category', 'name description')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 });

            const total = await Product.countDocuments({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex }
                ],
                isActive: true
            });

            res.status(200).json({
                success: true,
                data: products,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                },
                message: `Productos encontrados para: "${q}"`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error en la búsqueda de productos',
                error: error.message
            });
        }
    }
}

module.exports = ProductController;