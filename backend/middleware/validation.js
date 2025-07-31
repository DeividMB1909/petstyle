// middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));

        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: formattedErrors
        });
    }
    
    next();
};

// ======================================
// VALIDACIONES PARA USUARIOS
// ======================================

const validateUserRegistration = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail()
        .matches(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
        .withMessage('Formato de email inválido'),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    
    body('phone')
        .matches(/^[0-9]{10}$/)
        .withMessage('El teléfono debe tener exactamente 10 dígitos'),
    
    body('role')
        .optional()
        .isIn(['customer', 'admin'])
        .withMessage('El rol debe ser "customer" o "admin"'),
    
    // Address es opcional completamente
    body('address.street')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('La calle debe tener entre 1 y 100 caracteres'),
    
    body('address.city')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('La ciudad debe tener entre 1 y 50 caracteres'),
    
    body('address.state')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('El estado debe tener entre 1 y 50 caracteres'),
    
    body('address.zipCode')
        .optional()
        .matches(/^[0-9]{5}$/)
        .withMessage('El código postal debe tener 5 dígitos'),
    
    body('address.country')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('El país debe tener entre 1 y 50 caracteres'),
    
    handleValidationErrors
];

const validateUserLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida'),
    
    handleValidationErrors
];

const validateUserUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    body('phone')
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage('El teléfono debe tener exactamente 10 dígitos'),
    
    body('address.street')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('La calle debe tener entre 1 y 100 caracteres'),
    
    body('address.city')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('La ciudad debe tener entre 1 y 50 caracteres'),
    
    body('address.state')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('El estado debe tener entre 1 y 50 caracteres'),
    
    body('address.zipCode')
        .optional()
        .matches(/^[0-9]{5}$/)
        .withMessage('El código postal debe tener 5 dígitos'),
    
    handleValidationErrors
];

// ======================================
// VALIDACIONES PARA PRODUCTOS
// ======================================

const validateProductCreation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre del producto debe tener entre 2 y 100 caracteres'),
    
    body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
    
    body('price')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo')
        .toFloat(),
    
    body('originalPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio original debe ser un número positivo')
        .toFloat(),
    
    body('discount')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('El descuento debe ser entre 0 y 100%')
        .toFloat(),
    
    body('category')
        .isMongoId()
        .withMessage('Debe ser un ID de categoría válido'),
    
    body('subcategory')
        .optional()
        .isMongoId()
        .withMessage('Debe ser un ID de subcategoría válido'),
    
    body('brand')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('La marca no puede exceder 50 caracteres'),
    
    body('sku')
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('El SKU debe tener entre 1 y 20 caracteres')
        .matches(/^[A-Z0-9-_]+$/)
        .withMessage('El SKU solo puede contener letras mayúsculas, números, guiones y guión bajo'),
    
    body('stock')
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero positivo')
        .toInt(),
    
    body('minStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock mínimo debe ser un número entero positivo')
        .toInt(),
    
    // Validaciones para imágenes
    body('images')
        .optional()
        .isArray({ max: 10 })
        .withMessage('Máximo 10 imágenes permitidas'),
    
    body('images.*.url')
        .if(body('images').exists())
        .isURL()
        .withMessage('La URL de la imagen debe ser válida'),
    
    body('images.*.alt')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('El texto alternativo no puede exceder 100 caracteres'),
    
    body('images.*.isPrimary')
        .optional()
        .isBoolean()
        .withMessage('isPrimary debe ser verdadero o falso'),
    
    // Validaciones para peso
    body('weight.value')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El peso debe ser un número positivo')
        .toFloat(),
    
    body('weight.unit')
        .optional()
        .isIn(['g', 'kg', 'lb'])
        .withMessage('La unidad de peso debe ser g, kg o lb'),
    
    // Validaciones para dimensiones
    body('dimensions.length')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La longitud debe ser un número positivo')
        .toFloat(),
    
    body('dimensions.width')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El ancho debe ser un número positivo')
        .toFloat(),
    
    body('dimensions.height')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La altura debe ser un número positivo')
        .toFloat(),
    
    body('dimensions.unit')
        .optional()
        .isIn(['cm', 'm', 'in'])
        .withMessage('La unidad de dimensión debe ser cm, m o in'),
    
    // Validaciones para tags
    body('tags')
        .optional()
        .isArray({ max: 20 })
        .withMessage('Máximo 20 tags permitidos'),
    
    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Cada tag debe tener entre 1 y 30 caracteres'),
    
    // Validaciones para especificaciones
    body('specifications')
        .optional()
        .isArray({ max: 20 })
        .withMessage('Máximo 20 especificaciones permitidas'),
    
    body('specifications.*.name')
        .if(body('specifications').exists())
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('El nombre de la especificación debe tener entre 1 y 50 caracteres'),
    
    body('specifications.*.value')
        .if(body('specifications').exists())
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('El valor de la especificación debe tener entre 1 y 100 caracteres'),
    
    body('featured')
        .optional()
        .isBoolean()
        .withMessage('Featured debe ser verdadero o falso'),
    
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive debe ser verdadero o falso'),
    
    handleValidationErrors
];

const validateProductUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre del producto debe tener entre 2 y 100 caracteres'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
    
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo')
        .toFloat(),
    
    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero positivo')
        .toInt(),
    
    body('category')
        .optional()
        .isMongoId()
        .withMessage('Debe ser un ID de categoría válido'),
    
    handleValidationErrors
];

// ======================================
// VALIDACIONES PARA CATEGORÍAS
// ======================================

const validateCategoryCreation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 30 })
        .withMessage('El nombre de la categoría debe tener entre 2 y 30 caracteres'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La descripción no puede exceder 200 caracteres'),
    
    body('icon')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('El icono debe tener entre 1 y 100 caracteres'),
    
    body('image')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('La imagen debe tener entre 1 y 100 caracteres'),
    
    body('parentCategory')
        .optional()
        .isMongoId()
        .withMessage('Debe ser un ID de categoría padre válido'),
    
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive debe ser verdadero o falso'),
    
    body('order')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El orden debe ser un número entero positivo')
        .toInt(),
    
    handleValidationErrors
];

const validateCategoryUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 30 })
        .withMessage('El nombre de la categoría debe tener entre 2 y 30 caracteres'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La descripción no puede exceder 200 caracteres'),
    
    handleValidationErrors
];

// ======================================
// VALIDACIONES PARA CARRITO
// ======================================

const validateAddToCart = [
    body('product')
        .isMongoId()
        .withMessage('Debe ser un ID de producto válido'),
    
    body('quantity')
        .isInt({ min: 1, max: 99 })
        .withMessage('La cantidad debe ser un número entero entre 1 y 99')
        .toInt(),
    
    handleValidationErrors
];

const validateUpdateCartItem = [
    body('quantity')
        .isInt({ min: 1, max: 99 })
        .withMessage('La cantidad debe ser un número entero entre 1 y 99')
        .toInt(),
    
    handleValidationErrors
];

// ======================================
// VALIDACIONES PARA ÓRDENES
// ======================================

const validateOrderCreation = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('Debe haber al menos un item en la orden'),
    
    body('items.*.product')
        .isMongoId()
        .withMessage('Cada item debe tener un ID de producto válido'),
    
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser al menos 1')
        .toInt(),
    
    body('shippingAddress.street')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('La calle es obligatoria y no puede exceder 100 caracteres'),
    
    body('shippingAddress.city')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('La ciudad es obligatoria y no puede exceder 50 caracteres'),
    
    body('shippingAddress.state')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('El estado es obligatorio y no puede exceder 50 caracteres'),
    
    body('shippingAddress.zipCode')
        .matches(/^[0-9]{5}$/)
        .withMessage('El código postal debe tener 5 dígitos'),
    
    body('paymentMethod')
        .isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'])
        .withMessage('Método de pago inválido'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres'),
    
    handleValidationErrors
];

const validateOrderUpdate = [
    body('orderStatus')
        .optional()
        .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Estado de orden inválido'),
    
    body('paymentStatus')
        .optional()
        .isIn(['pending', 'paid', 'failed', 'refunded'])
        .withMessage('Estado de pago inválido'),
    
    body('trackingNumber')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('El número de seguimiento debe tener entre 1 y 50 caracteres'),
    
    handleValidationErrors
];

// ======================================
// VALIDACIONES PARA PARÁMETROS
// ======================================

const validateMongoId = [
    param('id')
        .isMongoId()
        .withMessage('ID inválido'),
    
    handleValidationErrors
];

const validateUserId = [
    param('userId')
        .isMongoId()
        .withMessage('ID de usuario inválido'),
    
    handleValidationErrors
];

const validateProductId = [
    param('productId')
        .isMongoId()
        .withMessage('ID de producto inválido'),
    
    handleValidationErrors
];

// ======================================
// VALIDACIONES PARA QUERIES
// ======================================

const validateProductQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número positivo')
        .toInt(),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser entre 1 y 100')
        .toInt(),
    
    query('category')
        .optional()
        .isMongoId()
        .withMessage('ID de categoría inválido'),
    
    query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio mínimo debe ser positivo')
        .toFloat(),
    
    query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio máximo debe ser positivo')
        .toFloat(),
    
    query('search')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('La búsqueda debe tener entre 1 y 100 caracteres'),
    
    query('featured')
        .optional()
        .isBoolean()
        .withMessage('Featured debe ser verdadero o falso'),
    
    query('inStock')
        .optional()
        .isBoolean()
        .withMessage('inStock debe ser verdadero o falso'),
    
    handleValidationErrors
];

module.exports = {
    // Usuario
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdate,
    
    // Producto
    validateProductCreation,
    validateProductUpdate,
    validateProductQuery,
    
    // Categoría
    validateCategoryCreation,
    validateCategoryUpdate,
    
    // Carrito
    validateAddToCart,
    validateUpdateCartItem,
    
    // Órdenes
    validateOrderCreation,
    validateOrderUpdate,
    
    // Parámetros
    validateMongoId,
    validateUserId,
    validateProductId,
    
    // Utilidades
    handleValidationErrors
};