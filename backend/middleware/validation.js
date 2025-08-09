// backend/middleware/validation.js
const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array().map(error => ({
                field: error.path || error.param,
                message: error.msg,
                value: error.value
            }))
        });
    }
    
    next();
};

// Middleware para validar ObjectId de MongoDB
const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];
        
        // Verificar que sea un ObjectId válido de MongoDB
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: `${paramName} inválido`,
                error: 'Debe ser un ID válido de MongoDB'
            });
        }
        
        next();
    };
};

// Middleware para sanitizar datos de entrada
const sanitizeInput = (req, res, next) => {
    // Limpiar espacios en blanco de strings
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].trim();
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };
    
    if (req.body) {
        sanitize(req.body);
    }
    
    next();
};

module.exports = {
    handleValidationErrors,
    validateObjectId,
    sanitizeInput
};