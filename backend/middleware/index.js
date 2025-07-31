// middleware/index.js
const auth = require('./auth');
const validation = require('./validation');

module.exports = {
    // Middlewares de autenticación
    ...auth,
    
    // Middlewares de validación
    ...validation
};