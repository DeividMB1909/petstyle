// backend/server.js - Actualización con CORS configurado para Cordova

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { SeedController } = require('./controllers');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const uploadRoutes = require('./routes/uploadRoutes');

// ========== CONFIGURACIÓN CORS PARA CORDOVA ==========
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Lista de orígenes permitidos
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8000',
            'http://localhost:8080',
            'http://127.0.0.1:8000',
            'http://127.0.0.1:8080',
            'http://192.168.1.100:8000', // Cambia por tu IP local
            'file://', // Para Cordova
            'https://tu-dominio-produccion.com' // Tu dominio en producción
        ];
        
        // Permitir cualquier origen que contenga 'localhost' o sea file://
        if (origin.includes('localhost') || 
            origin.includes('127.0.0.1') || 
            origin.includes('192.168.') || 
            origin.startsWith('file://') ||
            allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Origen bloqueado por CORS:', origin);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true, // Permitir cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma'
    ],
    exposedHeaders: ['set-cookie'],
    maxAge: 86400 // 24 horas
};

// Aplicar CORS antes que otros middlewares
app.use(cors(corsOptions));

// Middleware para manejar preflight requests
app.options('*', cors(corsOptions));

// ========== CONFIGURACIÓN DE SEGURIDAD ==========
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
        },
    },
}));

// ========== CONEXIÓN A MONGODB ==========
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petstyle');
        console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
        console.log(`📊 Base de datos: ${conn.connection.name}`);
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        console.log('⚠️  Continuando sin base de datos...');
    }
};

connectDB();

// ========== MIDDLEWARES BÁSICOS ==========
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use(cookieParser());

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Archivos estáticos con CORS headers
app.use('/public', express.static('public', {
    setHeaders: (res, path) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

// ========== MIDDLEWARE DE LOGGING PARA DEBUG ==========
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    next();
});

// ========== RUTAS PRINCIPALES ==========
// Ruta raíz
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
            timestamp: new Date(),
            cors: 'enabled',
            database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
        });
    }
});

// Ruta de health check para Cordova
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date(),
        database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
        cors: 'enabled'
    });
});

// Ruta de test específica
app.get('/test', (req, res) => {
    res.json({
        message: 'Servidor PetStyle funcionando correctamente',
        database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
        timestamp: new Date(),
        version: '1.0.0',
        status: 'OK',
        cors: 'enabled',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Documentación
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
                'GET /test - Test del servidor',
                'GET /health - Health check',
                'GET /api/products - Obtener productos',
                'GET /api/categories - Obtener categorías',
                'POST /api/auth/login - Iniciar sesión',
                'POST /api/auth/register - Registrarse'
            ]
        });
    }
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

// ========== API ROUTES ==========
// Rutas de upload
app.use('/api/upload', uploadRoutes);

// Rutas principales de API
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Rutas de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rutas para poblar y estadísticas
app.get('/seed', SeedController.seedDatabase);
app.get('/stats', SeedController.getStats);

// ========== MIDDLEWARE DE MANEJO DE ERRORES ==========
// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date(),
        availableRoutes: [
            'GET /',
            'GET /docs', 
            'GET /test',
            'GET /health',
            'GET /api/products',
            'GET /api/categories'
        ]
    });
});

// Manejo de errores generales
app.use((error, req, res, next) => {
    console.error('❌ Error en el servidor:', error);
    
    // Error de CORS
    if (error.message.includes('CORS')) {
        return res.status(403).json({
            error: 'Error de CORS',
            message: 'Origen no permitido',
            origin: req.get('origin')
        });
    }
    
    // Error de JSON malformado
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
            error: 'JSON malformado',
            message: 'El cuerpo de la petición contiene JSON inválido'
        });
    }
    
    // Error general
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal',
        timestamp: new Date()
    });
});

// ========== INICIAR SERVIDOR ==========
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor PetStyle corriendo en http://localhost:${PORT}`);
    console.log(`🌐 Accesible desde red local en http://192.168.1.100:${PORT}`); // Cambia por tu IP
    console.log(`📚 Documentación: http://localhost:${PORT}/docs`);
    console.log(`🧪 Test: http://localhost:${PORT}/test`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
    console.log(`⚙️  Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS habilitado para desarrollo y Cordova`);
});

// ========== MANEJO DE CIERRE GRACEFUL ==========
process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor PetStyle...');
    server.close(() => {
        console.log('🔥 Servidor cerrado');
        mongoose.connection.close(false, () => {
            console.log('🔌 Conexión a MongoDB cerrada');
            process.exit(0);
        });
    });
});

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM recibido, cerrando servidor...');
    server.close(() => {
        mongoose.connection.close(false, () => {
            process.exit(0);
        });
    });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

module.exports = app;