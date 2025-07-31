// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar storage para productos
const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'petstyle/products', // Carpeta en Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 800, height: 600, crop: 'limit', quality: 'auto' }, // Imagen principal
            { width: 400, height: 300, crop: 'limit', quality: 'auto', fetch_format: 'auto' } // Thumbnail
        ],
        public_id: (req, file) => {
            // Generar nombre único: petstyle_product_timestamp_random
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 8);
            return `petstyle_product_${timestamp}_${random}`;
        }
    }
});

// Configurar storage para avatares de usuarios
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'petstyle/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto' }
        ],
        public_id: (req, file) => {
            const timestamp = Date.now();
            const userId = req.user?.userId || 'anonymous';
            return `petstyle_avatar_${userId}_${timestamp}`;
        }
    }
});

// Configurar storage para categorías
const categoryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'petstyle/categories',
        allowed_formats: ['jpg', 'jpeg', 'png', 'svg'],
        transformation: [
            { width: 300, height: 300, crop: 'fill', quality: 'auto' }
        ],
        public_id: (req, file) => {
            const timestamp = Date.now();
            return `petstyle_category_${timestamp}`;
        }
    }
});

// Filtros de archivos
const imageFilter = (req, file, cb) => {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

// Configurar multer para productos
const uploadProduct = multer({
    storage: productStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB por archivo
        files: 10 // Máximo 10 archivos por vez
    }
});

// Configurar multer para avatares
const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
        files: 1 // Solo un archivo
    }
});

// Configurar multer para categorías
const uploadCategory = multer({
    storage: categoryStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB
        files: 1 // Solo un archivo
    }
});

// Función para eliminar imagen de Cloudinary
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        throw error;
    }
};

// Función para obtener URL optimizada
const getOptimizedUrl = (publicId, options = {}) => {
    return cloudinary.url(publicId, {
        fetch_format: 'auto',
        quality: 'auto',
        ...options
    });
};

module.exports = {
    cloudinary,
    uploadProduct,
    uploadAvatar,
    uploadCategory,
    deleteImage,
    getOptimizedUrl
};