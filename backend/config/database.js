const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
        console.log(`📊 Base de datos: ${conn.connection.name}`);
        
        // Eventos de conexión
        mongoose.connection.on('connected', () => {
            console.log('🔗 Mongoose conectado a MongoDB');
        });
        
        mongoose.connection.on('error', (err) => {
            console.error('❌ Error de conexión MongoDB:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('📡 Mongoose desconectado');
        });
        
        // Cerrar conexión limpiamente al terminar la app
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('🔌 Conexión MongoDB cerrada correctamente');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error cerrando conexión:', error);
                process.exit(1);
            }
        });
        
        // También manejar SIGTERM (usado por algunos servicios de hosting)
        process.on('SIGTERM', async () => {
            try {
                await mongoose.connection.close();
                console.log('🔌 Conexión MongoDB cerrada por SIGTERM');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error cerrando conexión:', error);
                process.exit(1);
            }
        });
        
        return conn;
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
};