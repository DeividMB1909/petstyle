require('dotenv').config(); 
const mongoose = require('mongoose'); 
 
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Configurado' : 'No configurado'); 
 
mongoose.connect(process.env.MONGODB_URI) 
    .then(() => { 
        console.log('? Conectado a MongoDB Atlas!'); 
        console.log('Base de datos:', mongoose.connection.name); 
        mongoose.disconnect(); 
    }) 
    .catch((error) => { 
        console.error('? Error:', error.message); 
    }); 
