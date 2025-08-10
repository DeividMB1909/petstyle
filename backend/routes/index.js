const express = require('express');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');

const router = express.Router();

// Middleware para logging de todas las rutas API
router.use((req, res, next) => {
    console.log(`📡 API ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    next();
});

// Rutas principales de la API
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);

// Ruta base de la API con información completa
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'PetStyle API v1.0',
        status: 'OK',
        server: 'Express.js',
        database: 'MongoDB',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                logout: 'POST /api/auth/logout'
            },
            users: {
                getAll: 'GET /api/users',
                getById: 'GET /api/users/:id',
                create: 'POST /api/users',
                update: 'PUT /api/users/:id',
                delete: 'DELETE /api/users/:id'
            },
            categories: {
                getAll: 'GET /api/categories',
                getById: 'GET /api/categories/:id',
                create: 'POST /api/categories',
                update: 'PUT /api/categories/:id',
                delete: 'DELETE /api/categories/:id'
            },
            products: {
                getAll: 'GET /api/products',
                getById: 'GET /api/products/:id',
                create: 'POST /api/products',
                update: 'PUT /api/products/:id',
                delete: 'DELETE /api/products/:id',
                search: 'GET /api/products?search=term',
                byCategory: 'GET /api/products?category=categoryId'
            },
            cart: {
                get: 'GET /api/cart',
                add: 'POST /api/cart/add',
                update: 'PUT /api/cart/update',
                remove: 'DELETE /api/cart/remove',
                clear: 'DELETE /api/cart/clear'
            }
        },
        documentation: {
            baseUrl: `${req.protocol}://${req.get('host')}/api`,
            health: `${req.protocol}://${req.get('host')}/health`,
            seed: `${req.protocol}://${req.get('host')}/seed`,
            stats: `${req.protocol}://${req.get('host')}/stats`
        },
        timestamp: new Date(),
        version: '1.0.0'
    });
});

// Ruta para healthcheck específica de la API
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'API funcionando correctamente',
        timestamp: new Date(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        routes: ['users', 'categories', 'products', 'cart']
    });
});

module.exports = router;