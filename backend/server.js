const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// CONEXIÓN A BASE DE DATOS
// ========================================
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

// ========================================
// MIDDLEWARES
// ========================================
// Configuración de CORS optimizada para desarrollo
app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8080',
            'http://localhost:5000',
            'http://127.0.0.1:5500',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:8080',
            'http://192.168.1.100:8080',
            'file://' // Para archivos locales
        ];
        
        // En desarrollo, permitir todos los orígenes que empiecen con localhost o 127.0.0.1
        if (process.env.NODE_ENV !== 'production') {
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                return callback(null, true);
            }
        }
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Origen no permitido por CORS:', origin);
            callback(null, true); // Temporal: permitir todos los orígenes en desarrollo
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Middlewares básicos
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Desactivar para desarrollo
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(cookieParser());

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Servir archivos estáticos con configuración optimizada
app.use(express.static('public', {
    setHeaders: (res, path) => {
        res.set('Access-Control-Allow-Origin', '*');
    }
}));

// Servir frontend estático (NUEVO - para servir tus HTMLs)
app.use('/frontend', express.static('frontend', {
    setHeaders: (res, path) => {
        res.set('Access-Control-Allow-Origin', '*');
    }
}));

// ========================================
// RUTAS DE PRUEBA
// ========================================
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
            database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
            apiBaseUrl: `http://localhost:${PORT}/api`
        });
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
        timestamp: new Date(),
        port: PORT,
        apiUrl: `http://localhost:${PORT}/api`
    });
});

// ========================================
// RUTAS DE API
// ========================================
const apiRoutes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Middleware para logging de requests API
app.use('/api', (req, res, next) => {
    console.log(`📡 API Request: ${req.method} ${req.originalUrl}`);
    next();
});

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Ruta para poblar datos de prueba
const { SeedController } = require('./controllers');
app.get('/seed', SeedController.seedDatabase);
app.get('/stats', SeedController.getStats);

// ========================================
// RUTAS PARA SERVIR FRONTEND (NUEVO)
// ========================================
// Servir las páginas HTML principales
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/frontend/login.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/frontend/register.html');
});

app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/frontend/administradores.html');
});

app.get('/cart', (req, res) => {
    res.sendFile(__dirname + '/frontend/carrito.html');
});

app.get('/favorites', (req, res) => {
    res.sendFile(__dirname + '/frontend/favoritos.html');
});

app.get('/profile', (req, res) => {
    res.sendFile(__dirname + '/frontend/profile.html');
});

app.get('/main', (req, res) => {
    res.sendFile(__dirname + '/frontend/main.html');
});

// ========================================
// MANEJO DE ERRORES
// ========================================
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        availableRoutes: [
            'GET /',
            'GET /health',
            'GET /api',
            'POST /api/auth/login',
            'POST /api/auth/register',
            'GET /login',
            'GET /register',
            'GET /admin',
            'GET /cart',
            'GET /favorites',
            'GET /profile'
        ]
    });
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('❌ Error en servidor:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor PetStyle corriendo en http://localhost:${PORT}`);
    console.log(`📚 API Base: http://localhost:${PORT}/api`);
    console.log(`🔑 Auth: http://localhost:${PORT}/api/auth`);
    console.log(`🌐 Frontend: http://localhost:${PORT}/frontend`);
    console.log(`⚙️  Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📱 Páginas disponibles:`);
    console.log(`   • Login: http://localhost:${PORT}/login`);
    console.log(`   • Register: http://localhost:${PORT}/register`);
    console.log(`   • Admin: http://localhost:${PORT}/admin`);
    console.log(`   • Cart: http://localhost:${PORT}/cart`);
    console.log(`   • Favorites: http://localhost:${PORT}/favorites`);
    console.log(`   • Profile: http://localhost:${PORT}/profile`);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor PetStyle...');
    mongoose.connection.close();
    process.exit(0);
});