// controllers/UploadController.js
const { deleteImage, getOptimizedUrl } = require('../config/cloudinary');

class UploadController {
    // Subir imágenes de productos
    static uploadProductImages = async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se encontraron archivos para subir'
                });
            }

            // Procesar las imágenes subidas
            const uploadedImages = req.files.map((file, index) => ({
                url: file.path,
                publicId: file.filename,
                alt: `Imagen del producto ${index + 1}`,
                isPrimary: index === 0, // La primera imagen es la principal
                optimizedUrl: getOptimizedUrl(file.filename, { width: 400, height: 300 })
            }));

            res.status(200).json({
                success: true,
                message: `${uploadedImages.length} imágenes subidas correctamente`,
                data: {
                    images: uploadedImages,
                    count: uploadedImages.length
                }
            });

        } catch (error) {
            console.error('Error al subir imágenes de producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al subir imágenes',
                error: error.message
            });
        }
    };

    // Subir avatar de usuario
    static uploadAvatar = async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se encontró archivo para subir'
                });
            }

            const avatarData = {
                url: req.file.path,
                publicId: req.file.filename,
                optimizedUrl: getOptimizedUrl(req.file.filename, { width: 200, height: 200 })
            };

            res.status(200).json({
                success: true,
                message: 'Avatar subido correctamente',
                data: avatarData
            });

        } catch (error) {
            console.error('Error al subir avatar:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al subir avatar',
                error: error.message
            });
        }
    };

    // Subir imagen de categoría
    static uploadCategoryImage = async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se encontró archivo para subir'
                });
            }

            const categoryImageData = {
                url: req.file.path,
                publicId: req.file.filename,
                optimizedUrl: getOptimizedUrl(req.file.filename, { width: 300, height: 300 })
            };

            res.status(200).json({
                success: true,
                message: 'Imagen de categoría subida correctamente',
                data: categoryImageData
            });

        } catch (error) {
            console.error('Error al subir imagen de categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al subir imagen',
                error: error.message
            });
        }
    };

    // Eliminar imagen
    static deleteImage = async (req, res) => {
        try {
            const { publicId } = req.params;

            if (!publicId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID público de la imagen es requerido'
                });
            }

            const result = await deleteImage(publicId);

            if (result.result === 'ok') {
                res.status(200).json({
                    success: true,
                    message: 'Imagen eliminada correctamente',
                    data: { publicId, result: result.result }
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Imagen no encontrada o ya eliminada',
                    data: { publicId, result: result.result }
                });
            }

        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al eliminar imagen',
                error: error.message
            });
        }
    };

    // Obtener información de imagen
    static getImageInfo = async (req, res) => {
        try {
            const { publicId } = req.params;

            // Generar diferentes versiones de la imagen
            const imageVersions = {
                original: getOptimizedUrl(publicId),
                thumbnail: getOptimizedUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
                medium: getOptimizedUrl(publicId, { width: 400, height: 300, crop: 'limit' }),
                large: getOptimizedUrl(publicId, { width: 800, height: 600, crop: 'limit' })
            };

            res.status(200).json({
                success: true,
                message: 'Información de imagen obtenida',
                data: {
                    publicId,
                    versions: imageVersions
                }
            });

        } catch (error) {
            console.error('Error al obtener información de imagen:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    };
}

module.exports = UploadController;