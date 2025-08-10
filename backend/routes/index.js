const express = require('express');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');

const router = express.Router();

// Rutas principales de la API
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);

// Ruta base de la API
router.get('/', (req, res) => {
    res.json({
        message: 'PetStyle API v1.0',
        status: 'OK',
        endpoints: {
            users: '/api/users',
            categories: '/api/categories',
            products: '/api/products',
            cart: '/api/cart'
        },
        timestamp: new Date()
    });
});

module.exports = router;