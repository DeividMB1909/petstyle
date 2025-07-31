// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();

const UploadController = require('../controllers/UploadController');
const ProductController = require('../controllers/ProductController');
const UserController = require('../controllers/UserController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { uploadProduct, uploadAvatar, uploadCategory } = require('../config/cloudinary');
const { param, body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// ===============================
// MIDDLEWARE DE MANEJO DE ERRORES DE MULTER
// ===============================
const handleUploadErrors = (error, req, res, next) => {
    if (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'El archivo es demasiado grande',
                error: 'El tamaño máximo permitido es 5MB para productos, 2MB para avatares'
            });
        }

        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Demasiados archivos',
                error: 'Máximo 10 imágenes para productos, 1 para avatares'
            });
        }

        if (error.message === 'Solo se permiten archivos de imagen') {
            return res.status(400).json({
                success: false,
                message: 'Tipo de archivo no válido',
                error: 'Solo se permiten imágenes (JPG, PNG, WEBP)'
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Error al subir archivo',
            error: error.message
        });
    }
    next();
};

// ===============================
// RUTAS COMBINADAS (Datos + Imágenes)
// ===============================

// POST /api/upload/product-complete
router.post('/product-complete', [
    authenticateToken,
    authorizeRoles('admin'),
    uploadProduct.array('images', 10),
    handleUploadErrors,
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('description').trim().isLength({ min: 10, max: 1000 }),
    body('price').isFloat({ min: 0 }),
    body('category').isMongoId(),
    body('sku').trim().isLength({ min: 2, max: 20 }),
    body('stock').isInt({ min: 0 }),
    handleValidationErrors
], (req, res, next) => {
    if (req.files && req.files.length > 0) {
        req.body.images = req.files.map((file, index) => ({
            url: file.path,
            publicId: file.filename,
            alt: `${req.body.name} - Imagen ${index + 1}`,
            isPrimary: index === 0,
            optimizedUrl: file.path.replace('/upload/', '/upload/w_400,h_300,c_limit/')
        }));
    }
    next();
}, ProductController.createProduct);

// PUT /api/upload/user-avatar-complete
router.put('/user-avatar-complete', [
    authenticateToken,
    uploadAvatar.single('avatar'),
    handleUploadErrors,
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('phone').optional().matches(/^[0-9]{10}$/),
    handleValidationErrors
], (req, res, next) => {
    if (req.file) {
        req.body.avatar = {
            url: req.file.path,
            publicId: req.file.filename
        };
    }
    next();
}, UserController.updateProfile);

// ===============================
// RUTAS PARA SUBIDA INDIVIDUAL
// ===============================

// POST /api/upload/products - Solo imágenes
router.post('/products',
    authenticateToken,
    authorizeRoles('admin'),
    uploadProduct.array('images', 10),
    handleUploadErrors,
    UploadController.uploadProductImages
);

// POST /api/upload/avatar
router.post('/avatar',
    authenticateToken,
    uploadAvatar.single('avatar'),
    handleUploadErrors,
    UploadController.uploadAvatar
);

// POST /api/upload/category
router.post('/category',
    authenticateToken,
    authorizeRoles('admin'),
    uploadCategory.single('image'),
    handleUploadErrors,
    UploadController.uploadCategoryImage
);

// ===============================
// RUTAS DE GESTIÓN
// ===============================

// DELETE /api/upload/:publicId
router.delete('/:publicId', [
    authenticateToken,
    authorizeRoles('admin'),
    param('publicId').notEmpty().isLength({ min: 1, max: 100 }),
    handleValidationErrors
], UploadController.deleteImage);

// GET /api/upload/info/:publicId
router.get('/info/:publicId', [
    param('publicId').notEmpty().withMessage('ID público de la imagen es requerido'),
    handleValidationErrors
], UploadController.getImageInfo);

// ===============================
// MIDDLEWARE ADICIONAL (opcional si usas cleanup)
// ===============================
const cleanupUploadsOnError = (error, req, res, next) => {
    if (error) {
        const filesToClean = [];

        if (req.files) filesToClean.push(...req.files.map(f => f.filename));
        if (req.file) filesToClean.push(req.file.filename);

        if (filesToClean.length > 0) {
            Promise.all(
                filesToClean.map(publicId =>
                    require('../config/cloudinary').deleteImage(publicId)
                        .catch(err => console.warn('Error limpiando archivo:', err))
                )
            );
        }
    }

    next(error);
};

module.exports = router;
