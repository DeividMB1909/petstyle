// backend/controllers/SeedController.js
const { User, Category, Product, Cart } = require('../models');
const bcrypt = require('bcryptjs');

class SeedController {
    static async seedDatabase(req, res) {
        try {
            console.log('🌱 Iniciando seed de la base de datos...');

            // Limpiar datos existentes (opcional - descomenta si quieres reset completo)
            // await User.deleteMany({});
            // await Category.deleteMany({});
            // await Product.deleteMany({});
            // await Cart.deleteMany({});

            let usersCreated = 0;
            let categoriesCreated = 0;
            let productsCreated = 0;

            // ========================================
            // CREAR USUARIOS
            // ========================================
            const usersData = [
                {
                    name: 'Administrador PetStyle',
                    email: 'admin@petstyle.com',
                    password: await bcrypt.hash('admin123', 12),
                    phone: '5551234567',
                    role: 'admin',
                    address: {
                        street: 'Av. Principal 123',
                        city: 'Aguascalientes',
                        state: 'Aguascalientes',
                        zipCode: '20000',
                        country: 'México'
                    }
                },
                {
                    name: 'Juan Pérez',
                    email: 'juan@test.com',
                    password: await bcrypt.hash('123456', 12),
                    phone: '5559876543',
                    role: 'customer'
                },
                {
                    name: 'María González',
                    email: 'maria@test.com',
                    password: await bcrypt.hash('123456', 12),
                    phone: '5555678901',
                    role: 'customer'
                }
            ];

            for (const userData of usersData) {
                const existingUser = await User.findOne({ email: userData.email });
                if (!existingUser) {
                    await User.create(userData);
                    usersCreated++;
                    console.log(`✅ Usuario creado: ${userData.email}`);
                }
            }

            // ========================================
            // CREAR CATEGORÍAS
            // ========================================
            const categoriesData = [
                {
                    name: 'Collares y Correas',
                    description: 'Collares, correas y arneses para perros y gatos',
                    order: 1
                },
                {
                    name: 'Juguetes',
                    description: 'Juguetes divertidos para mascotas de todas las edades',
                    order: 2
                },
                {
                    name: 'Camas y Descanso',
                    description: 'Camas, cojines y accesorios para el descanso de mascotas',
                    order: 3
                },
                {
                    name: 'Alimentación',
                    description: 'Comederos, bebederos y accesorios para alimentación',
                    order: 4
                },
                {
                    name: 'Cuidado e Higiene',
                    description: 'Productos para el cuidado y limpieza de mascotas',
                    order: 5
                },
                {
                    name: 'Ropa y Accesorios',
                    description: 'Ropa, sombreros y accesorios fashion para mascotas',
                    order: 6
                }
            ];

            let categories = {};
            for (const categoryData of categoriesData) {
                const existingCategory = await Category.findOne({ name: categoryData.name });
                if (!existingCategory) {
                    const category = await Category.create(categoryData);
                    categories[categoryData.name] = category._id;
                    categoriesCreated++;
                    console.log(`✅ Categoría creada: ${categoryData.name}`);
                } else {
                    categories[categoryData.name] = existingCategory._id;
                }
            }

            // ========================================
            // CREAR PRODUCTOS CON IMÁGENES VÁLIDAS
            // ========================================
            const productsData = [
                {
                    name: 'Collar Ajustable para Perros',
                    description: 'Collar resistente y ajustable, perfecto para perros de tamaño mediano. Fabricado con materiales duraderos y cómodos.',
                    price: 299.99,
                    originalPrice: 399.99,
                    discount: 25,
                    category: categories['Collares y Correas'],
                    brand: 'PetStyle',
                    sku: 'COL001',
                    stock: 25,
                    minStock: 5,
                    tags: ['collar', 'perro', 'ajustable', 'resistente'],
                    featured: true,
                    images: [
                        {
                            url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg',
                            publicId: 'petstyle/products/collar_001_primary',
                            alt: 'Collar Ajustable para Perros - Vista Principal',
                            isPrimary: true,
                            optimizedUrl: 'https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_limit/v1234567890/sample.jpg'
                        },
                        {
                            url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample2.jpg',
                            publicId: 'petstyle/products/collar_001_detail',
                            alt: 'Collar Ajustable para Perros - Detalle',
                            isPrimary: false,
                            optimizedUrl: 'https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_limit/v1234567890/sample2.jpg'
                        }
                    ],
                    specifications: [
                        { name: 'Material', value: 'Nylon resistente' },
                        { name: 'Tamaño', value: 'Mediano (30-45cm)' },
                        { name: 'Peso máximo', value: '25kg' }
                    ]
                },
                {
                    name: 'Pelota de Goma Resistente',
                    description: 'Pelota de goma natural, perfecta para juegos de buscar y traer. Resistente a mordidas y lavable.',
                    price: 159.99,
                    category: categories['Juguetes'],
                    brand: 'PlayPet',
                    sku: 'JUG001',
                    stock: 50,
                    minStock: 10,
                    tags: ['pelota', 'juguete', 'goma', 'resistente'],
                    featured: true,
                    images: [
                        {
                            url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample3.jpg',
                            publicId: 'petstyle/products/pelota_001_primary',
                            alt: 'Pelota de Goma Resistente - Vista Principal',
                            isPrimary: true,
                            optimizedUrl: 'https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_limit/v1234567890/sample3.jpg'
                        }
                    ]
                },
                {
                    name: 'Cama Suave para Gatos',
                    description: 'Cama ultra suave y cómoda, diseñada especialmente para el descanso de gatos. Material hipoalergénico.',
                    price: 899.99,
                    category: categories['Camas y Descanso'],
                    brand: 'ComfortPet',
                    sku: 'CAM001',
                    stock: 15,
                    minStock: 3,
                    tags: ['cama', 'gato', 'suave', 'hipoalergénico'],
                    images: [
                        {
                            url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample4.jpg',
                            publicId: 'petstyle/products/cama_001_primary',
                            alt: 'Cama Suave para Gatos - Vista Principal',
                            isPrimary: true,
                            optimizedUrl: 'https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_limit/v1234567890/sample4.jpg'
                        }
                    ]
                },
                {
                    name: 'Comedero Doble Acero Inoxidable',
                    description: 'Set de comedero y bebedero en acero inoxidable. Antideslizante y fácil de limpiar.',
                    price: 449.99,
                    category: categories['Alimentación'],
                    brand: 'FeedSafe',
                    sku: 'COM001',
                    stock: 30,
                    minStock: 5,
                    tags: ['comedero', 'acero', 'doble', 'antideslizante'],
                    images: [
                        {
                            url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample5.jpg',
                            publicId: 'petstyle/products/comedero_001_primary',
                            alt: 'Comedero Doble Acero Inoxidable - Vista Principal',
                            isPrimary: true,
                            optimizedUrl: 'https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_limit/v1234567890/sample5.jpg'
                        }
                    ]
                },
                {
                    name: 'Shampoo Antipulgas Natural',
                    description: 'Shampoo natural con ingredientes orgánicos, efectivo contra pulgas y garrapatas. Suave con la piel.',
                    price: 249.99,
                    category: categories['Cuidado e Higiene'],
                    brand: 'NaturalCare',
                    sku: 'SHA001',
                    stock: 40,
                    minStock: 8,
                    tags: ['shampoo', 'antipulgas', 'natural', 'orgánico'],
                    images: [
                        {
                            url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample6.jpg',
                            publicId: 'petstyle/products/shampoo_001_primary',
                            alt: 'Shampoo Antipulgas Natural - Vista Principal',
                            isPrimary: true,
                            optimizedUrl: 'https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_limit/v1234567890/sample6.jpg'
                        }
                    ]
                }
            ];

            for (const productData of productsData) {
                const existingProduct = await Product.findOne({ sku: productData.sku });
                if (!existingProduct) {
                    const product = await Product.create(productData);
                    productsCreated++;
                    console.log(`✅ Producto creado: ${productData.name} (${productData.sku})`);
                }
            }

            console.log('🌱 Seed completado exitosamente!');

            res.status(200).json({
                success: true,
                message: 'Base de datos poblada exitosamente',
                data: {
                    usersCreated,
                    categoriesCreated,
                    productsCreated,
                    totalRecords: usersCreated + categoriesCreated + productsCreated
                }
            });

        } catch (error) {
            console.error('❌ Error en seed:', error);
            res.status(500).json({
                success: false,
                message: 'Error al poblar la base de datos',
                error: error.message
            });
        }
    }

    static async getStats(req, res) {
        try {
            const users = await User.countDocuments();
            const categories = await Category.countDocuments();
            const products = await Product.countDocuments();
            const carts = await Cart.countDocuments();

            const activeProducts = await Product.countDocuments({ isActive: true });
            const inactiveProducts = await Product.countDocuments({ isActive: false });
            const outOfStockProducts = await Product.countDocuments({ stock: 0 });

            res.status(200).json({
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                data: {
                    collections: {
                        users,
                        categories,
                        products,
                        carts
                    },
                    products: {
                        active: activeProducts,
                        inactive: inactiveProducts,
                        outOfStock: outOfStockProducts,
                        total: products
                    },
                    database: {
                        status: 'connected',
                        name: process.env.MONGODB_URI ? 'cloud' : 'local'
                    }
                }
            });

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }

    // Método para limpiar la base de datos (uso en desarrollo)
    static async clearDatabase(req, res) {
        try {
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({
                    success: false,
                    message: 'No se puede limpiar la base de datos en producción'
                });
            }

            await User.deleteMany({});
            await Category.deleteMany({});
            await Product.deleteMany({});
            await Cart.deleteMany({});

            res.status(200).json({
                success: true,
                message: 'Base de datos limpiada exitosamente'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al limpiar la base de datos',
                error: error.message
            });
        }
    }
}

module.exports = SeedController;