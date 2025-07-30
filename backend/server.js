const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { SeedController } = require('./controllers');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petstyle');
        console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
        console.log(`📊 Base de datos: ${conn.connection.name}`);
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        // No salir del proceso por ahora, para debugging
        console.log('⚠️  Continuando sin base de datos...');
    }
};

// Conectar a la base de datos
connectDB();

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Archivos estáticos
app.use(express.static('public'));

// Ruta principal simple
app.get('/', (req, res) => {
    try {
        res.render('index', { 
            title: 'PetStyle - Accesorios para Mascotas',
            message: '¡Bienvenido a PetStyle!',
            dbStatus: mongoose.connection.readyState === 1 ? 'Conectado ✅' : 'Desconectado ❌'
        });
    } catch (error) {
        res.json({
            message: 'PetStyle Server funcionando',
            status: 'OK',
            timestamp: new Date()
        });
    }
});

// Ruta de documentación
app.get('/docs', (req, res) => {
    try {
        res.render('docs', { 
            title: 'PetStyle API - Documentación' 
        });
    } catch (error) {
        res.json({
            message: 'Documentación de PetStyle API',
            endpoints: [
                'GET / - Página principal',
                'GET /docs - Esta documentación',
                'GET /test - Test del servidor'
            ]
        });
    }
});

// Ruta de prueba simple
app.get('/test', (req, res) => {
    res.json({
        message: 'Servidor PetStyle funcionando correctamente',
        database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
        timestamp: new Date(),
        version: '1.0.0',
        status: 'OK'
    });
});

// Ruta para probar modelos
app.get('/test-models', async (req, res) => {
    try {
        const { User, Category, Product, Cart } = require('./models');
        
        res.json({
            message: 'Modelos cargados correctamente',
            models: {
                User: User.modelName,
                Category: Category.modelName,
                Product: Product.modelName,
                Cart: Cart.modelName
            },
            database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error cargando modelos',
            details: error.message
        });
    }
});

// API Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Ruta para poblar la base de datos con datos de prueba
app.get('/seed', SeedController.seedDatabase);

// Ruta para obtener estadísticas de la base de datos
app.get('/stats', SeedController.getStats);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        availableRoutes: ['/', '/docs', '/test']
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor PetStyle corriendo en http://localhost:${PORT}`);
    console.log(`📚 Documentación: http://localhost:${PORT}/docs`);
    console.log(`🧪 Test: http://localhost:${PORT}/test`);
    console.log(`⚙️  Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor PetStyle...');
    mongoose.connection.close();
    process.exit(0);
});