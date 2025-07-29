const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Archivos estáticos
app.use(express.static('public'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'PetStyle - Accesorios para Mascotas',
        message: '¡Bienvenido a PetStyle!' 
    });
});

// Ruta para documentación API
app.get('/docs', (req, res) => {
    res.render('docs', { 
        title: 'PetStyle API - Documentación' 
    });
});

// Conexión a MongoDB (por ahora comentada)
/*
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petstyle')
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));
*/

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📚 Documentación API: http://localhost:${PORT}/docs`);
});