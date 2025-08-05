// backend/test-connection.js
require('dotenv').config();

console.log('🔍 Verificando configuración...');
console.log('📁 Directorio actual:', process.cwd());
console.log('🔑 Variables de entorno:');
console.log('  - MONGODB_URI:', process.env.MONGODB_URI ? '✅ Definida' : '❌ NO definida');
console.log('  - PORT:', process.env.PORT || 'No definida');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'No definida');

if (!process.env.MONGODB_URI) {
    console.log('\n❌ ERROR: MONGODB_URI no está definida en el archivo .env');
    console.log('📝 Asegúrate de:');
    console.log('  1. Crear el archivo .env en la carpeta backend/');
    console.log('  2. Añadir: MONGODB_URI=tu_connection_string_aqui');
    console.log('  3. El archivo .env debe estar en la misma carpeta que este script');
    process.exit(1);
}

console.log('\n🚀 Intentando conectar a MongoDB...');
const connectDB = require('./config/database');
connectDB();