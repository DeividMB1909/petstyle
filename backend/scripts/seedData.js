// =====================================================
// 🚀 SCRIPT DE POBLACIÓN DE DATOS - PETSTYLE
// =====================================================
// Ejecutar desde la carpeta backend: node scripts/seedData.js

const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
require('dotenv').config();

// 🎯 CATEGORÍAS PRINCIPALES
const categories = [
    {
        name: 'Perros',
        description: 'Todo para el mejor amigo del hombre',
        icon: {
            url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop&crop=face'
        },
        image: {
            url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop'
        },
        order: 1
    },
    {
        name: 'Gatos',
        description: 'Productos especiales para felinos',
        icon: {
            url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100&fit=crop&crop=face'
        },
        image: {
            url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop'
        },
        order: 2
    },
    {
        name: 'Aves',
        description: 'Cuidado especializado para aves',
        icon: {
            url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=100&h=100&fit=crop'
        },
        image: {
            url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&h=300&fit=crop'
        },
        order: 3
    },
    {
        name: 'Peces',
        description: 'Acuarios y cuidado de peces',
        icon: {
            url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop'
        },
        image: {
            url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'
        },
        order: 4
    },
    {
        name: 'Accesorios',
        description: 'Juguetes, correas y más',
        icon: {
            url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100&h=100&fit=crop'
        },
        image: {
            url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop'
        },
        order: 5
    }
];

// 🎯 FUNCIÓN PARA GENERAR PUBLIC ID ÚNICO
function generatePublicId(category, productName, imageIndex = 1) {
    const categoryCode = category.toLowerCase().replace(/[^a-z]/g, '');
    const productCode = productName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
    return `petstyle/demo/${categoryCode}/${productCode}_${imageIndex.toString().padStart(3, '0')}`;
}

// 🎯 FUNCIÓN PARA GENERAR SKU ÚNICO
function generateSKU(category, name) {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const nameCode = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${categoryCode}${nameCode}${randomNum}`;
}

// 🎯 PRODUCTOS POR CATEGORÍA
const productsByCategory = {
    'Perros': [
        {
            name: 'Alimento Premium Royal Canin Adult',
            description: 'Alimento completo y balanceado para perros adultos. Formulado con ingredientes de alta calidad para mantener la salud y vitalidad de tu mascota.',
            price: 1250,
            originalPrice: 1450,
            discount: 14,
            brand: 'Royal Canin',
            stock: 25,
            minStock: 5,
            weight: { value: 15, unit: 'kg' },
            tags: ['alimento', 'premium', 'adulto', 'nutritivo'],
            specifications: [
                { name: 'Edad', value: 'Adulto (1-7 años)' },
                { name: 'Tamaño', value: 'Todas las razas' },
                { name: 'Ingrediente principal', value: 'Pollo' },
                { name: 'Proteína', value: '26%' }
            ],
            featured: true,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop',
                    alt: 'Alimento Royal Canin para perros',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=300&fit=crop'
                },
                {
                    url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop',
                    alt: 'Detalle del alimento',
                    isPrimary: false,
                    optimizedUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop'
                }
            ]
        },
        {
            name: 'Correa Retráctil Flexi 5m',
            description: 'Correa retráctil de alta calidad con sistema de frenado suave. Perfecta para paseos cómodos y seguros.',
            price: 680,
            originalPrice: 780,
            discount: 13,
            brand: 'Flexi',
            stock: 18,
            minStock: 3,
            weight: { value: 350, unit: 'g' },
            tags: ['correa', 'retractil', 'paseo', 'seguridad'],
            specifications: [
                { name: 'Longitud', value: '5 metros' },
                { name: 'Peso máximo', value: '25 kg' },
                { name: 'Material', value: 'Nylon resistente' },
                { name: 'Color', value: 'Negro/Rojo' }
            ],
            featured: true,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop',
                    alt: 'Correa retráctil Flexi',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop'
                }
            ]
        },
        {
            name: 'Cama Ortopédica Memory Foam',
            description: 'Cama ortopédica con espuma de memoria para el descanso perfecto. Ideal para perros mayores o con problemas articulares.',
            price: 1850,
            brand: 'PetComfort',
            stock: 12,
            minStock: 2,
            weight: { value: 2.5, unit: 'kg' },
            dimensions: { length: 80, width: 60, height: 15, unit: 'cm' },
            tags: ['cama', 'ortopedica', 'memory foam', 'descanso'],
            specifications: [
                { name: 'Tamaño', value: '80x60x15 cm' },
                { name: 'Material', value: 'Memory Foam + Tela impermeable' },
                { name: 'Lavable', value: 'Sí, funda removible' },
                { name: 'Peso soportado', value: 'Hasta 35 kg' }
            ],
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=400&h=400&fit=crop',
                    alt: 'Cama ortopédica para perros',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=300&h=300&fit=crop'
                }
            ]
        },
        {
            name: 'Juguete Kong Classic Rojo',
            description: 'El juguete Kong original, perfecto para rellenar con premios. Ayuda a reducir la ansiedad y mantiene entretenido a tu perro.',
            price: 420,
            brand: 'Kong',
            stock: 30,
            minStock: 8,
            weight: { value: 180, unit: 'g' },
            tags: ['juguete', 'kong', 'entretenimiento', 'premios'],
            specifications: [
                { name: 'Tamaño', value: 'Mediano' },
                { name: 'Material', value: 'Caucho natural' },
                { name: 'Resistencia', value: 'Ultra resistente' },
                { name: 'Apto para', value: 'Perros de 15-35 kg' }
            ],
            featured: true,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=400&fit=crop',
                    alt: 'Juguete Kong Classic',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop'
                }
            ]
        }
    ],
    'Gatos': [
        {
            name: 'Arena Sanitaria Bentonita Premium',
            description: 'Arena aglomerante de bentonita sódica 100% natural. Control superior de olores y fácil limpieza.',
            price: 280,
            originalPrice: 320,
            discount: 13,
            brand: 'Cat Clean',
            stock: 45,
            minStock: 10,
            weight: { value: 10, unit: 'kg' },
            tags: ['arena', 'bentonita', 'aglomerante', 'control olores'],
            specifications: [
                { name: 'Tipo', value: 'Bentonita sódica' },
                { name: 'Capacidad', value: '10 kg' },
                { name: 'Aglomerante', value: 'Sí' },
                { name: 'Control de olor', value: 'Superior' }
            ],
            featured: true,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=400&fit=crop',
                    alt: 'Arena sanitaria para gatos',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=300&h=300&fit=crop'
                }
            ]
        },
        {
            name: 'Rascador Torre con Hamaca',
            description: 'Torre rascadora de 120cm con múltiples niveles, hamaca y juguetes colgantes. Perfecto para el ejercicio y descanso.',
            price: 2150,
            brand: 'FelineTree',
            stock: 8,
            minStock: 2,
            weight: { value: 12, unit: 'kg' },
            dimensions: { length: 50, width: 50, height: 120, unit: 'cm' },
            tags: ['rascador', 'torre', 'hamaca', 'ejercicio'],
            specifications: [
                { name: 'Altura', value: '120 cm' },
                { name: 'Base', value: '50x50 cm' },
                { name: 'Material', value: 'Sisal natural + Felpa' },
                { name: 'Niveles', value: '4 plataformas' }
            ],
            featured: true,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1574231164645-d6f0e8553590?w=400&h=400&fit=crop',
                    alt: 'Torre rascadora para gatos',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1574231164645-d6f0e8553590?w=300&h=300&fit=crop'
                }
            ]
        },
        {
            name: 'Alimento Hills Science Diet Adult',
            description: 'Nutrición científicamente formulada para gatos adultos. Con antioxidantes naturales y proteína de alta calidad.',
            price: 950,
            brand: 'Hills',
            stock: 22,
            minStock: 5,
            weight: { value: 4, unit: 'kg' },
            tags: ['alimento', 'hills', 'premium', 'adulto'],
            specifications: [
                { name: 'Edad', value: 'Adulto (1-6 años)' },
                { name: 'Ingrediente principal', value: 'Pollo' },
                { name: 'Proteína', value: '32%' },
                { name: 'Grasa', value: '20%' }
            ],
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop',
                    alt: 'Alimento Hills para gatos',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=300&fit=crop'
                }
            ]
        },
        {
            name: 'Fuente de Agua Automática',
            description: 'Fuente de agua con filtro de carbón activado. Estimula el consumo de agua fresca y filtrada.',
            price: 1320,
            brand: 'PetSafe',
            stock: 15,
            minStock: 3,
            weight: { value: 1.2, unit: 'kg' },
            tags: ['fuente', 'agua', 'filtro', 'automatica'],
            specifications: [
                { name: 'Capacidad', value: '2.5 litros' },
                { name: 'Filtro', value: 'Carbón activado' },
                { name: 'Material', value: 'Plástico libre de BPA' },
                { name: 'Alimentación', value: 'Eléctrica' }
            ],
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=400&h=400&fit=crop',
                    alt: 'Fuente de agua para gatos',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=300&h=300&fit=crop'
                }
            ]
        }
    ],
    'Aves': [
        {
            name: 'Jaula Premium para Canarios',
            description: 'Jaula espaciosa con comederos incluidos y bandeja extraíble. Diseño elegante y funcional.',
            price: 1680,
            brand: 'Prevue',
            stock: 10,
            minStock: 2,
            weight: { value: 8, unit: 'kg' },
            dimensions: { length: 60, width: 40, height: 80, unit: 'cm' },
            tags: ['jaula', 'canarios', 'premium', 'espaciosa'],
            specifications: [
                { name: 'Dimensiones', value: '60x40x80 cm' },
                { name: 'Espaciado barras', value: '12 mm' },
                { name: 'Material', value: 'Acero inoxidable' },
                { name: 'Accesorios', value: '2 comederos + 1 bebedero' }
            ],
            featured: true,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1583523142097-dd81c8e6fb5e?w=400&h=400&fit=crop',
                    alt: 'Jaula para canarios',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1583523142097-dd81c8e6fb5e?w=300&h=300&fit=crop'
                }
            ]
        },
        {
            name: 'Alimento Semillas Mixtas Premium',
            description: 'Mezcla balanceada de semillas selectas para canarios y periquitos. Rica en vitaminas y minerales.',
            price: 185,
            brand: 'Vitakraft',
            stock: 35,
            minStock: 8,
            weight: { value: 1, unit: 'kg' },
            tags: ['semillas', 'alimento', 'canarios', 'premium'],
            specifications: [
                { name: 'Peso', value: '1 kg' },
                { name: 'Tipo', value: 'Semillas mixtas' },
                { name: 'Para', value: 'Canarios y periquitos' },
                { name: 'Vitaminas', value: 'A, D3, E' }
            ],
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&h=400&fit=crop',
                    alt: 'Alimento para aves',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=300&h=300&fit=crop'
                }
            ]
        }
    ],
    'Peces': [
        {
            name: 'Acuario Completo 100L con Filtro',
            description: 'Kit completo de acuario de 100 litros con filtro interno, calentador y iluminación LED.',
            price: 3250,
            originalPrice: 3800,
            discount: 14,
            brand: 'Tetra',
            stock: 6,
            minStock: 1,
            weight: { value: 15, unit: 'kg' },
            dimensions: { length: 80, width: 35, height: 40, unit: 'cm' },
            tags: ['acuario', 'completo', 'filtro', '100l'],
            specifications: [
                { name: 'Capacidad', value: '100 litros' },
                { name: 'Dimensiones', value: '80x35x40 cm' },
                { name: 'Filtro', value: 'Interno incluido' },
                { name: 'Iluminación', value: 'LED 18W' }
            ],
            featured: true,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
                    alt: 'Acuario completo con peces',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=300&fit=crop'
                }
            ]
        },
        {
            name: 'Alimento Escamas Tropicales',
            description: 'Alimento en escamas para peces tropicales. Fórmula equilibrada que realza los colores naturales.',
            price: 125,
            brand: 'Sera',
            stock: 28,
            minStock: 6,
            weight: { value: 250, unit: 'g' },
            tags: ['alimento', 'escamas', 'tropicales', 'colores'],
            specifications: [
                { name: 'Peso', value: '250g' },
                { name: 'Tipo', value: 'Escamas flotantes' },
                { name: 'Para', value: 'Peces tropicales' },
                { name: 'Proteína', value: '48%' }
            ],
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&h=400&fit=crop',
                    alt: 'Alimento para peces tropicales',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=300&h=300&fit=crop'
                }
            ]
        }
    ],
    'Accesorios': [
        {
            name: 'Transportadora Rígida Mediana',
            description: 'Transportadora segura y cómoda para viajes. Cumple con normativas de aerolíneas internacionales.',
            price: 1580,
            brand: 'Petmate',
            stock: 12,
            minStock: 3,
            weight: { value: 3.5, unit: 'kg' },
            dimensions: { length: 60, width: 40, height: 42, unit: 'cm' },
            tags: ['transportadora', 'viaje', 'segura', 'aerolinea'],
            specifications: [
                { name: 'Tamaño', value: '60x40x42 cm' },
                { name: 'Peso máximo', value: '18 kg' },
                { name: 'Material', value: 'Plástico resistente' },
                { name: 'Ventilación', value: '360°' }
            ],
            featured: true,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=400&fit=crop',
                    alt: 'Transportadora para mascotas',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=300&h=300&fit=crop'
                }
            ]
        },
        {
            name: 'Collar GPS Tracker',
            description: 'Collar inteligente con GPS para localizar a tu mascota en tiempo real. Resistente al agua.',
            price: 2890,
            originalPrice: 3200,
            discount: 10,
            brand: 'Whistle',
            stock: 8,
            minStock: 2,
            weight: { value: 85, unit: 'g' },
            tags: ['collar', 'gps', 'tracker', 'inteligente'],
            specifications: [
                { name: 'Batería', value: '7 días' },
                { name: 'Resistencia', value: 'IPX7 (agua)' },
                { name: 'Conectividad', value: '4G LTE' },
                { name: 'App', value: 'iOS/Android' }
            ],
            featured: true,
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
                    alt: 'Collar GPS para mascotas',
                    isPrimary: true,
                    optimizedUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop'
                }
            ]
        }
    ]
};

// 🚀 FUNCIÓN PRINCIPAL DE SEEDING
async function seedDatabase() {
    try {
        // Conectar a MongoDB
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petstyle', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Conectado a MongoDB');

        // Limpiar datos existentes
        console.log('🧹 Limpiando datos existentes...');
        await Product.deleteMany({});
        await Category.deleteMany({});
        console.log('✅ Datos limpiados');

        // Crear categorías
        console.log('📂 Creando categorías...');
        const createdCategories = {};
        
        for (const categoryData of categories) {
            const category = new Category(categoryData);
            const savedCategory = await category.save();
            createdCategories[categoryData.name] = savedCategory._id;
            console.log(`✅ Categoría creada: ${categoryData.name}`);
        }

        // Crear productos
        console.log('📦 Creando productos...');
        let totalProducts = 0;
        
        for (const [categoryName, products] of Object.entries(productsByCategory)) {
            const categoryId = createdCategories[categoryName];
            
            for (const productData of products) {
                // ✅ NUEVO: Generar publicIds automáticamente para las imágenes
                const processedImages = productData.images.map((image, index) => ({
                    ...image,
                    publicId: generatePublicId(categoryName, productData.name, index + 1)
                }));

                const product = new Product({
                    ...productData,
                    category: categoryId,
                    sku: generateSKU(categoryName, productData.name),
                    images: processedImages
                });
                
                await product.save();
                totalProducts++;
                console.log(`✅ Producto creado: ${productData.name}`);
            }
        }

        // Resumen final
        console.log('\n🎉 ¡SEEDING COMPLETADO EXITOSAMENTE!');
        console.log('==========================================');
        console.log(`📂 Categorías creadas: ${categories.length}`);
        console.log(`📦 Productos creados: ${totalProducts}`);
        console.log(`🌟 Productos destacados: ${Object.values(productsByCategory).flat().filter(p => p.featured).length}`);
        console.log('==========================================');
        console.log('🚀 ¡Tu base de datos está lista para usar!');
        console.log('📱 Ahora puedes probar tu frontend con datos reales');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error en el seeding:', error);
        process.exit(1);
    }
}

// Ejecutar el seeding
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };