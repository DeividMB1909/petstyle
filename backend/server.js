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
        // Usar localhost como fallback si no hay MONGODB_URI
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/petstyle_db';
        
        console.log('🔍 Conectando a MongoDB...');
        
        const conn = await mongoose.connect(mongoURI);
        
        console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
        console.log(`📊 Base de datos: ${conn.connection.name}`);
        console.log(`📡 Estado de conexión: ${conn.connection.readyState}`);
        
        // Verificar qué colecciones tenemos
        try {
            const collections = await conn.connection.db.listCollections().toArray();
            console.log(`📋 Colecciones disponibles: ${collections.map(c => c.name).join(', ')}`);
            
            // Contar documentos en cada colección
            for (const collection of collections) {
                const count = await conn.connection.db.collection(collection.name).countDocuments();
                console.log(`📦 ${collection.name}: ${count} documentos`);
            }
        } catch (listError) {
            console.log('⚠️  No se pudieron listar las colecciones:', listError.message);
        }
        
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
    origin: true, // Permitir todos los orígenes temporalmente
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
            database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
            databaseName: mongoose.connection.name || 'No conectado'
        });
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
        databaseName: mongoose.connection.name || 'No conectado',
        timestamp: new Date()
    });
});

// Ruta de debug para verificar la base de datos
app.get('/debug/db', async (req, res) => {
    try {
        const dbInfo = {
            connected: mongoose.connection.readyState === 1,
            databaseName: mongoose.connection.name,
            host: mongoose.connection.host,
            collections: []
        };
        
        if (mongoose.connection.readyState === 1) {
            try {
                const collections = await mongoose.connection.db.listCollections().toArray();
                for (const collection of collections) {
                    const count = await mongoose.connection.db.collection(collection.name).countDocuments();
                    dbInfo.collections.push({
                        name: collection.name,
                        documents: count
                    });
                }
            } catch (error) {
                dbInfo.error = error.message;
            }
        }
        
        res.json(dbInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// RUTAS DIRECTAS DE API (TEMPORAL - HASTA QUE SE ARREGLEN LOS CONTROLADORES)
// ========================================

// Ruta de productos
app.get('/api/productos', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Base de datos no conectada' });
        }
        
        const productos = await mongoose.connection.db.collection('products').find({}).toArray();
        console.log(`📦 Enviando ${productos.length} productos`);
        res.json(productos);
        
    } catch (error) {
        console.error('❌ Error obteniendo productos:', error);
        res.status(500).json({ error: 'Error obteniendo productos', details: error.message });
    }
});

// Ruta de producto específico
app.get('/api/productos/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Base de datos no conectada' });
        }
        
        const { ObjectId } = require('mongodb');
        const producto = await mongoose.connection.db.collection('products').findOne({
            _id: new ObjectId(req.params.id)
        });
        
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        console.log(`📦 Enviando producto: ${producto.name || producto.nombre}`);
        res.json(producto);
        
    } catch (error) {
        console.error('❌ Error obteniendo producto:', error);
        res.status(500).json({ error: 'Error obteniendo producto', details: error.message });
    }
});

// Ruta de categorías
app.get('/api/categorias', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Base de datos no conectada' });
        }
        
        const categorias = await mongoose.connection.db.collection('categories').find({}).toArray();
        console.log(`📂 Enviando ${categorias.length} categorías`);
        res.json(categorias);
        
    } catch (error) {
        console.error('❌ Error obteniendo categorías:', error);
        res.status(500).json({ error: 'Error obteniendo categorías', details: error.message });
    }
});

// ========================================
// RUTAS DE API OPCIONALES (SI EXISTEN LOS ARCHIVOS)
// ========================================
try {
    const apiRoutes = require('./routes');
    app.use('/api', apiRoutes);
} catch (error) {
    console.log('⚠️  Routes/index.js no encontrado, usando rutas directas');
}

try {
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/auth', authRoutes);
} catch (error) {
    console.log('⚠️  AuthRoutes no encontrado');
}

try {
    const uploadRoutes = require('./routes/uploadRoutes');
    app.use('/api/upload', uploadRoutes);
} catch (error) {
    console.log('⚠️  UploadRoutes no encontrado');
}

try {
    const productRoutes = require('./routes/productRoutes');
    app.use('/api/products-admin', productRoutes); // Usar para rutas admin
} catch (error) {
    console.log('⚠️  ProductRoutes no encontrado');
}

// Ruta para poblar datos de prueba (opcional)
try {
    const { SeedController } = require('./controllers');
    app.get('/seed', SeedController.seedDatabase);
    app.get('/stats', SeedController.getStats);
} catch (error) {
    console.log('⚠️  SeedController no encontrado');
}

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
            'GET /debug/db',
            'GET /api/productos',
            'GET /api/productos/:id',
            'GET /api/categorias',
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
    console.log(`📦 Productos: http://localhost:${PORT}/api/productos`);
    console.log(`📂 Categorías: http://localhost:${PORT}/api/categorias`);
    console.log(`🔍 Debug DB: http://localhost:${PORT}/debug/db`);
    console.log(`⚙️  Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor PetStyle...');
    mongoose.connection.close();
    process.exit(0);
});