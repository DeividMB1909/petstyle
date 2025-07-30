const { User, Category, Product, Cart } = require('../models');

class SeedController {
    // Poblar base de datos con datos de prueba
    static async seedDatabase(req, res) {
        try {
            // Limpiar datos existentes
            await User.deleteMany({});
            await Category.deleteMany({});
            await Product.deleteMany({});
            await Cart.deleteMany({});

            // Crear usuarios de prueba
            const users = await User.insertMany([
                {
                    name: 'Juan Pérez',
                    email: 'juan@example.com',
                    password: '123456',
                    role: 'admin',
                    address: {
                        street: 'Calle Principal 123',
                        city: 'Ciudad de México',
                        state: 'CDMX',
                        zipCode: '12345',
                        country: 'México'
                    },
                    phone: '8155556534'
                },
                {
                    name: 'María García',
                    email: 'maria@example.com',
                    password: '123456',
                    role: 'customer',
                    address: {
                        street: 'Avenida Juárez 456',
                        city: 'Guadalajara',
                        state: 'Jalisco',
                        zipCode: '44100',
                        country: 'México'
                    },
                    phone: '8155674934'
                },
                {
                    name: 'Carlos López',
                    email: 'carlos@example.com',
                    password: '123456',
                    role: 'customer',
                    address: {
                        street: 'Boulevard Norte 789',
                        city: 'Monterrey',
                        state: 'Nuevo León',
                        zipCode: '64000',
                        country: 'México'
                    },
                    phone: '8155551234'
                }
            ]);

            // Crear categorías de prueba
            const categories = await Category.insertMany([
                { name: 'Collares y Correas', description: 'Collares, correas y arneses para perros y gatos', isActive: true },
                { name: 'Juguetes', description: 'Juguetes divertidos para mascotas de todas las edades', isActive: true },
                { name: 'Camas y Descanso', description: 'Camas, cojines y accesorios para el descanso de mascotas', isActive: true },
                { name: 'Alimentación', description: 'Comederos, bebederos y accesorios para alimentación', isActive: true },
                { name: 'Cuidado e Higiene', description: 'Productos para el cuidado y limpieza de mascotas', isActive: true },
                { name: 'Transporte', description: 'Transportadoras, bolsos y accesorios para viajes', isActive: false }
            ]);

            // Lista de productos
            const productsData = [
                {
                    name: 'Collar Ajustable Premium',
                    description: 'Collar ajustable de nylon resistente con hebilla de seguridad',
                    price: 299.99,
                    category: categories[0]._id,
                    images: [
                        { url: 'https://example.com/collar1.jpg', alt: 'Collar Ajustable 1' },
                        { url: 'https://example.com/collar1-2.jpg', alt: 'Collar Ajustable 2' }
                    ],
                    stock: 25,
                    isActive: true
                },
                {
                    name: 'Correa Extensible 5m',
                    description: 'Correa extensible de 5 metros con sistema de frenado automático',
                    price: 459.99,
                    category: categories[0]._id,
                    images: [{ url: 'https://example.com/correa1.jpg', alt: 'Correa Extensible' }],
                    stock: 15,
                    isActive: true
                },
                {
                    name: 'Arnés Acolchado',
                    description: 'Arnés acolchado transpirable para perros medianos y grandes',
                    price: 389.99,
                    category: categories[0]._id,
                    images: [{ url: 'https://example.com/arnes1.jpg', alt: 'Arnés Acolchado' }],
                    stock: 20,
                    isActive: true
                },
                {
                    name: 'Pelota de Goma Rebotante',
                    description: 'Pelota de goma natural, perfecta para juegos de buscar',
                    price: 129.99,
                    category: categories[1]._id,
                    images: [{ url: 'https://example.com/pelota1.jpg', alt: 'Pelota de goma' }],
                    stock: 50,
                    isActive: true
                },
                {
                    name: 'Cuerda de Algodón Trenzada',
                    description: 'Cuerda de algodón 100% natural para juegos de tirar',
                    price: 89.99,
                    category: categories[1]._id,
                    images: [{ url: 'https://example.com/cuerda1.jpg', alt: 'Cuerda trenzada' }],
                    stock: 30,
                    isActive: true
                },
                {
                    name: 'Juguete Interactivo Kong',
                    description: 'Juguete dispensador de premios para estimulación mental',
                    price: 249.99,
                    category: categories[1]._id,
                    images: [{ url: 'https://example.com/kong1.jpg', alt: 'Juguete Kong' }],
                    stock: 12,
                    isActive: true
                },
                {
                    name: 'Cama Ortopédica Grande',
                    description: 'Cama ortopédica con espuma de memoria para perros grandes',
                    price: 899.99,
                    category: categories[2]._id,
                    images: [{ url: 'https://example.com/cama1.jpg', alt: 'Cama ortopédica' }],
                    stock: 8,
                    isActive: true
                },
                {
                    name: 'Cojín Reversible',
                    description: 'Cojín reversible lavable para perros y gatos',
                    price: 349.99,
                    category: categories[2]._id,
                    images: [{ url: 'https://example.com/cojin1.jpg', alt: 'Cojín reversible' }],
                    stock: 22,
                    isActive: true
                },
                {
                    name: 'Comedero Elevado Doble',
                    description: 'Set de comedero y bebedero elevado en acero inoxidable',
                    price: 549.99,
                    category: categories[3]._id,
                    images: [{ url: 'https://example.com/comedero1.jpg', alt: 'Comedero elevado' }],
                    stock: 18,
                    isActive: true
                },
                {
                    name: 'Fuente de Agua Automática',
                    description: 'Fuente de agua con filtro y circulación continua',
                    price: 789.99,
                    category: categories[3]._id,
                    images: [{ url: 'https://example.com/fuente1.jpg', alt: 'Fuente automática' }],
                    stock: 10,
                    isActive: true
                },
                {
                    name: 'Cepillo Desenredante',
                    description: 'Cepillo profesional para desenredar pelo largo y corto',
                    price: 199.99,
                    category: categories[4]._id,
                    images: [{ url: 'https://example.com/cepillo1.jpg', alt: 'Cepillo desenredante' }],
                    stock: 35,
                    isActive: true
                },
                {
                    name: 'Champú Hipoalergénico',
                    description: 'Champú suave para pieles sensibles, sin químicos agresivos',
                    price: 159.99,
                    category: categories[4]._id,
                    images: [{ url: 'https://example.com/champu1.jpg', alt: 'Champú hipoalergénico' }],
                    stock: 40,
                    isActive: true
                },
                {
                    name: 'Collar LED Nocturno',
                    description: 'Collar LED recargable para paseos nocturnos',
                    price: 329.99,
                    category: categories[0]._id,
                    images: [{ url: 'https://example.com/collar-led.jpg', alt: 'Collar LED' }],
                    stock: 0,
                    isActive: true
                },
                {
                    name: 'Producto Descontinuado',
                    description: 'Este producto ya no está disponible',
                    price: 199.99,
                    category: categories[1]._id,
                    images: [{ url: 'https://example.com/descontinuado.jpg', alt: 'Producto descontinuado' }],
                    stock: 5,
                    isActive: false
                }
            ];

            // Agregar campo SKU automáticamente
            const products = await Product.insertMany(
                productsData.map((product, index) => ({
                    ...product,
                    sku: `SKU${String(index + 1).padStart(3, '0')}`
                }))
            );

            res.status(200).json({
                success: true,
                message: 'Base de datos poblada exitosamente',
                data: {
                    users: users.length,
                    categories: categories.length,
                    products: products.length
                },
                summary: {
                    usersCreated: users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })),
                    categoriesCreated: categories.map(c => ({ id: c._id, name: c.name, isActive: c.isActive })),
                    productsCreated: products.length
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al poblar la base de datos',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de la base de datos
    static async getStats(req, res) {
        try {
            const userCount = await User.countDocuments();
            const categoryCount = await Category.countDocuments();
            const productCount = await Product.countDocuments();
            const cartCount = await Cart.countDocuments();

            const activeProducts = await Product.countDocuments({ isActive: true });
            const inactiveProducts = await Product.countDocuments({ isActive: false });
            const outOfStock = await Product.countDocuments({ stock: 0 });

            res.status(200).json({
                success: true,
                message: 'Estadísticas obtenidas exitosamente',
                data: {
                    collections: {
                        users: userCount,
                        categories: categoryCount,
                        products: productCount,
                        carts: cartCount
                    },
                    products: {
                        active: activeProducts,
                        inactive: inactiveProducts,
                        outOfStock: outOfStock,
                        total: productCount
                    },
                    database: {
                        status: 'connected',
                        name: 'petstyle'
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }
}

module.exports = SeedController;
