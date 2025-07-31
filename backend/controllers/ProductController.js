const Product = require('../models/Product');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');
const { deleteImage } = require('../config/cloudinary');

class ProductController {
    // ✅ ACTUALIZADO: Crear producto con imágenes
    static createProduct = async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const {
                name, description, price, originalPrice, discount, category,
                subcategory, brand, sku, stock, minStock, weight, dimensions,
                tags, specifications, featured, images // ✅ NUEVO: Recibir imágenes del frontend
            } = req.body;

            // Verificar que la categoría existe
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: 'La categoría especificada no existe'
                });
            }

            // Verificar subcategoría si se proporciona
            if (subcategory) {
                const subcategoryExists = await Category.findById(subcategory);
                if (!subcategoryExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'La subcategoría especificada no existe'
                    });
                }
            }

            // ✅ NUEVO: Procesar imágenes si se proporcionan
            let processedImages = [];
            if (images && Array.isArray(images) && images.length > 0) {
                processedImages = images.map((img, index) => ({
                    url: img.url,
                    publicId: img.publicId,
                    alt: img.alt || `${name} - Imagen ${index + 1}`,
                    isPrimary: index === 0, // Primera imagen es principal
                    optimizedUrl: img.optimizedUrl
                }));
            }

            const product = new Product({
                name, description, price, originalPrice, discount, category,
                subcategory, brand, sku, stock, minStock, weight, dimensions,
                tags, specifications, featured, 
                images: processedImages // ✅ NUEVO: Incluir imágenes
            });

            const savedProduct = await product.save();
            await savedProduct.populate('category subcategory');

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: savedProduct
            });

        } catch (error) {
            console.error('Error al crear producto:', error);
            
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'El SKU ya existe'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };

    // ✅ ACTUALIZADO: Actualizar producto con manejo de imágenes
    static updateProduct = async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // ✅ NUEVO: Manejar actualización de imágenes
            if (updates.images) {
                // Si se envían nuevas imágenes, eliminar las anteriores de Cloudinary
                if (product.images && product.images.length > 0) {
                    for (const oldImage of product.images) {
                        if (oldImage.publicId) {
                            try {
                                await deleteImage(oldImage.publicId);
                            } catch (deleteError) {
                                console.warn('Error al eliminar imagen anterior:', deleteError);
                            }
                        }
                    }
                }

                // Procesar nuevas imágenes
                updates.images = updates.images.map((img, index) => ({
                    url: img.url,
                    publicId: img.publicId,
                    alt: img.alt || `${updates.name || product.name} - Imagen ${index + 1}`,
                    isPrimary: index === 0,
                    optimizedUrl: img.optimizedUrl
                }));
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                updates,
                { new: true, runValidators: true }
            ).populate('category subcategory');

            res.status(200).json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: updatedProduct
            });

        } catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };

    // ✅ ACTUALIZADO: Eliminar producto con limpieza de imágenes
    static deleteProduct = async (req, res) => {
        try {
            const { id } = req.params;

            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // ✅ NUEVO: Eliminar imágenes de Cloudinary
            if (product.images && product.images.length > 0) {
                for (const image of product.images) {
                    if (image.publicId) {
                        try {
                            await deleteImage(image.publicId);
                        } catch (deleteError) {
                            console.warn('Error al eliminar imagen:', deleteError);
                        }
                    }
                }
            }

            await Product.findByIdAndDelete(id);

            res.status(200).json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };

    // ✅ NUEVO: Endpoint combinado para crear producto + subir imágenes
    static createProductWithImages = async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            // Los archivos de imagen ya fueron procesados por multer/cloudinary
            const uploadedImages = req.files ? req.files.map((file, index) => ({
                url: file.path,
                publicId: file.filename,
                alt: `${req.body.name} - Imagen ${index + 1}`,
                isPrimary: index === 0,
                optimizedUrl: file.path.replace('/upload/', '/upload/w_400,h_300,c_limit/')
            })) : [];

            const productData = {
                ...req.body,
                images: uploadedImages
            };

            const product = new Product(productData);
            const savedProduct = await product.save();
            await savedProduct.populate('category subcategory');

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente con imágenes',
                data: savedProduct
            });

        } catch (error) {
            console.error('Error al crear producto con imágenes:', error);
            
            // Si hay error, eliminar imágenes subidas
            if (req.files) {
                for (const file of req.files) {
                    try {
                        await deleteImage(file.filename);
                    } catch (deleteError) {
                        console.warn('Error al limpiar imagen:', deleteError);
                    }
                }
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };

    // ✅ NUEVO: Actualizar solo imágenes de un producto
    static updateProductImages = async (req, res) => {
        try {
            const { id } = req.params;
            
            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Eliminar imágenes anteriores
            if (product.images && product.images.length > 0) {
                for (const oldImage of product.images) {
                    if (oldImage.publicId) {
                        try {
                            await deleteImage(oldImage.publicId);
                        } catch (deleteError) {
                            console.warn('Error al eliminar imagen anterior:', deleteError);
                        }
                    }
                }
            }

            // Procesar nuevas imágenes
            const newImages = req.files ? req.files.map((file, index) => ({
                url: file.path,
                publicId: file.filename,
                alt: `${product.name} - Imagen ${index + 1}`,
                isPrimary: index === 0,
                optimizedUrl: file.path.replace('/upload/', '/upload/w_400,h_300,c_limit/')
            })) : [];

            product.images = newImages;
            await product.save();

            res.status(200).json({
                success: true,
                message: 'Imágenes del producto actualizadas exitosamente',
                data: {
                    productId: product._id,
                    images: newImages
                }
            });

        } catch (error) {
            console.error('Error al actualizar imágenes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };

    // Métodos existentes (getProducts, getProduct, etc.) permanecen igual...
    static getProducts = async (req, res) => {
        try {
            const { 
                page = 1, 
                limit = 10, 
                category, 
                minPrice, 
                maxPrice, 
                search, 
                featured,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;

            const query = { isActive: true };

            if (category) query.category = category;
            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = Number(minPrice);
                if (maxPrice) query.price.$lte = Number(maxPrice);
            }
            if (search) {
                query.$text = { $search: search };
            }
            if (featured) query.featured = featured === 'true';

            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const products = await Product.find(query)
                .populate('category subcategory')
                .sort(sortOptions)
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await Product.countDocuments(query);

            res.status(200).json({
                success: true,
                data: products,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalProducts: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };

    static getProduct = async (req, res) => {
        try {
            const { id } = req.params;

            const product = await Product.findById(id)
                .populate('category subcategory');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Incrementar vistas
            product.views += 1;
            await product.save();

            res.status(200).json({
                success: true,
                data: product
            });

        } catch (error) {
            console.error('Error al obtener producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };
}

module.exports = ProductController;