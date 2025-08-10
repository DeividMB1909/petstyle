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
// Configuración de CORS más permisiva
app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8080',
            'http://127.0.0.1:5500',
            'http://127.0.0.1:3000',
            'http://192.168.1.100:8080'
        ];
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Origen no permitido por CORS:', origin);
            callback(null, true); // Temporal: permitir todos los orígenes
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares básicos
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(cookieParser());

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

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
            database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
        });
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
        timestamp: new Date()
    });
});

// ========================================
// RUTAS DE API
// ========================================
const apiRoutes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Ruta para poblar datos de prueba
const { SeedController } = require('./controllers');
app.get('/seed', SeedController.seedDatabase);
app.get('/stats', SeedController.getStats);

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
            'POST /api/auth/register'
        ]
    });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor PetStyle corriendo en http://localhost:${PORT}`);
    console.log(`📚 API Base: http://localhost:${PORT}/api`);
    console.log(`🔑 Auth: http://localhost:${PORT}/api/auth`);
    console.log(`⚙️  Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor PetStyle...');
    mongoose.connection.close();
    process.exit(0);
});