// ===============================
// ARCHIVO: test-examples/cloudinary-integration-tests.js
// ===============================

// Ejemplos de cómo usar la API con Cloudinary integrado

// ======================================
// 1. CREAR PRODUCTO CON IMÁGENES
// ======================================

/* 
ENDPOINT: POST /api/products/with-images
MÉTODO: Formulario multipart/form-data

Ejemplo con JavaScript/Fetch:
*/

async function createProductWithImages() {
    const formData = new FormData();
    
    // Datos del producto
    formData.append('name', 'Collar Premium para Perros');
    formData.append('description', 'Collar resistente y cómodo para perros de todos los tamaños');
    formData.append('price', '299.99');
    formData.append('category', '60f1b2b2b2b2b2b2b2b2b2b2'); // ID de categoría
    formData.append('sku', 'COL-PREM-001');
    formData.append('stock', '50');
    formData.append('brand', 'PetStyle');
    formData.append('featured', 'true');
    
    // Imágenes (hasta 10)
    const imageInput = document.getElementById('productImages');
    for (let i = 0; i < imageInput.files.length; i++) {
        formData.append('images', imageInput.files[i]);
    }
    
    try {
        const response = await fetch('/api/products/with-images', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        const result = await response.json();
        console.log('Producto creado:', result);
        
        // Ejemplo de respuesta exitosa:
        /*
        {
            "success": true,
            "message": "Producto creado exitosamente con imágenes",
            "data": {
                "_id": "...",
                "name": "Collar Premium para Perros",
                "images": [
                    {
                        "url": "https://res.cloudinary.com/dc5k61akp/image/upload/v1234567890/petstyle/products/petstyle_product_1234567890_abc123.jpg",
                        "publicId": "petstyle_product_1234567890_abc123",
                        "alt": "Collar Premium para Perros - Imagen 1",
                        "isPrimary": true,
                        "optimizedUrl": "https://res.cloudinary.com/dc5k61akp/image/upload/w_400,h_300,c_limit/petstyle_product_1234567890_abc123.jpg"
                    }
                ]
            }
        }
        */
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// ======================================
// 2. ACTUALIZAR AVATAR DE USUARIO
// ======================================

async function updateUserAvatar() {
    const formData = new FormData();
    const avatarInput = document.getElementById('avatarInput');
    
    formData.append('avatar', avatarInput.files[0]);
    
    try {
        const response = await fetch('/api/users/avatar', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        const result = await response.json();
        console.log('Avatar actualizado:', result);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// ======================================
// 3. CREAR CATEGORÍA CON IMAGEN
// ======================================

async function createCategoryWithImage() {
    const formData = new FormData();
    
    formData.append('name', 'Accesorios para Gatos');
    formData.append('description', 'Todo tipo de accesorios para el cuidado de gatos');
    formData.append('order', '1');
    
    const imageInput = document.getElementById('categoryImage');
    formData.append('image', imageInput.files[0]);
    
    try {
        const response = await fetch('/api/categories/with-image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        const result = await response.json();
        console.log('Categoría creada:', result);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// ======================================
// 4. SUBIR SOLO IMÁGENES (SEPARADO)
// ======================================

async function uploadProductImages() {
    const formData = new FormData();
    const imageInput = document.getElementById('productImages');
    
    for (let i = 0; i < imageInput.files.length; i++) {
        formData.append('images', imageInput.files[i]);
    }
    
    try {
        const response = await fetch('/api/upload/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        const result = await response.json();
        console.log('Imágenes subidas:', result);
        
        // Usar las imágenes para crear producto después
        return result.data.images;
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// ======================================
// 5. EJEMPLO DE COMPONENTE REACT
// ======================================

/*
import React, { useState } from 'react';

const ProductForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        sku: '',
        stock: ''
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        
        // Agregar datos del producto
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        
        // Agregar imágenes
        images.forEach(image => {
            data.append('images', image);
        });

        try {
            const response = await fetch('/api/products/with-images', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: data
            });

            const result = await response.json();
            
            if (result.success) {
                alert('Producto creado exitosamente');
                // Resetear formulario
                setFormData({
                    name: '', description: '', price: '',
                    category: '', sku: '', stock: ''
                });
                setImages([]);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Nombre del producto"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
            />
            
            <textarea
                placeholder="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
            />
            
            <input
                type="number"
                placeholder="Precio"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
            />
            
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImages(Array.from(e.target.files))}
            />
            
            <button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Producto'}
            </button>
        </form>
    );
};
*/

// ======================================
// 6. UTILIDADES PARA MANEJO DE ERRORES
// ======================================

const handleApiResponse = async (response) => {
    const data = await response.json();
    
    if (!response.ok) {
        // Manejar diferentes tipos de errores
        switch (response.status) {
            case 400:
                if (data.errors) {
                    // Errores de validación
                    const errorMessages = data.errors.map(err => err.msg).join(', ');
                    throw new Error(`Errores de validación: ${errorMessages}`);
                }
                throw new Error(data.message || 'Solicitud inválida');
                
            case 401:
                // Token expirado o inválido
                localStorage.removeItem('token');
                window.location.href = '/login';
                throw new Error('Sesión expirada');
                
            case 403:
                throw new Error('No tienes permisos para esta acción');
                
            case 413:
                throw new Error('Archivo demasiado grande');
                
            case 500:
                throw new Error('Error del servidor');
                
            default:
                throw new Error(data.message || 'Error desconocido');
        }
    }
    
    return data;
};

// ======================================
// 7. FUNCIONES DE VALIDACIÓN FRONTEND
// ======================================

const validateImage = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no válido. Solo se permiten JPG, PNG y WEBP');
    }
    
    if (file.size > maxSize) {
        throw new Error('Archivo demasiado grande. Máximo 5MB');
    }
    
    return true;
};

const validateProductImages = (files) => {
    if (files.length > 10) {
        throw new Error('Máximo 10 imágenes por producto');
    }
    
    files.forEach((file, index) => {
        try {
            validateImage(file);
        } catch (error) {
            throw new Error(`Imagen ${index + 1}: ${error.message}`);
        }
    });
    
    return true;
};

// ======================================
// 8. EJEMPLO DE PREVISUALIZACIÓN DE IMÁGENES
// ======================================

const previewImages = (input, previewContainer) => {
    const files = Array.from(input.files);
    previewContainer.innerHTML = '';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'image-preview';
            imageDiv.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${index + 1}" style="max-width: 100px; max-height: 100px;">
                <p>${file.name}</p>
                <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
                ${index === 0 ? '<span class="primary-badge">Principal</span>' : ''}
            `;
            previewContainer.appendChild(imageDiv);
        };
        
        reader.readAsDataURL(file);
    });
};

// ======================================
// 9. EJEMPLO CON AXIOS (ALTERNATIVA)
// ======================================

const axiosExample = async () => {
    const axios = require('axios'); // En Node.js
    // const axios = window.axios; // En navegador si tienes axios cargado
    
    const formData = new FormData();
    formData.append('name', 'Producto de prueba');
    formData.append('price', '199.99');
    // ... otros campos
    
    try {
        const response = await axios.post('/api/products/with-images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                console.log(`Upload: ${percentCompleted}%`);
            }
        });
        
        console.log('Éxito:', response.data);
        
    } catch (error) {
        if (error.response) {
            // Error de respuesta del servidor
            console.error('Error del servidor:', error.response.data);
        } else if (error.request) {
            // Error de red
            console.error('Error de conexión');
        } else {
            console.error('Error:', error.message);
        }
    }
};

// ======================================
// 10. EJEMPLO DE CARGA PROGRESIVA
// ======================================

const uploadWithProgress = async (formData, onProgress) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentCompleted = (e.loaded / e.total) * 100;
                onProgress(percentCompleted);
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
        });
        
        xhr.addEventListener('error', () => {
            reject(new Error('Error de red'));
        });
        
        xhr.open('POST', '/api/products/with-images');
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
        xhr.send(formData);
    });
};

// Uso:
const handleUploadWithProgress = async () => {
    const formData = new FormData();
    // ... llenar formData
    
    const progressBar = document.getElementById('progressBar');
    
    try {
        const result = await uploadWithProgress(formData, (progress) => {
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${Math.round(progress)}%`;
        });
        
        console.log('Upload completado:', result);
        
    } catch (error) {
        console.error('Error en upload:', error);
    }
};

// ======================================
// 11. TESTING CON POSTMAN/INSOMNIA
// ======================================

/*
COLECCIÓN POSTMAN - Endpoints Cloudinary:

1. Crear Producto con Imágenes
   POST {{baseUrl}}/api/products/with-images
   Headers: Authorization: Bearer {{token}}
   Body: form-data
   - name: "Collar Premium"
   - description: "Collar resistente..."
   - price: 299.99
   - category: {{categoryId}}
   - sku: "COL-001"
   - stock: 50
   - images: [file1.jpg, file2.jpg] (múltiples archivos)

2. Subir Avatar
   PUT {{baseUrl}}/api/users/avatar
   Headers: Authorization: Bearer {{token}}
   Body: form-data
   - avatar: avatar.jpg (single file)

3. Crear Categoría con Imagen
   POST {{baseUrl}}/api/categories/with-image
   Headers: Authorization: Bearer {{token}}
   Body: form-data
   - name: "Accesorios"
   - description: "Accesorios varios"
   - image: category.jpg (single file)

4. Solo Subir Imágenes
   POST {{baseUrl}}/api/upload/products
   Headers: Authorization: Bearer {{token}}
   Body: form-data
   - images: [file1.jpg, file2.jpg] (múltiples archivos)

Variables de entorno:
- baseUrl: http://localhost:3000
- token: [Tu JWT token]
- categoryId: [ID de una categoría existente]
*/

// ======================================
// 12. EJEMPLO DE MANEJO DE ESTADO GLOBAL
// ======================================

// Con Redux o Context API
const initialState = {
    products: [],
    loading: false,
    uploadProgress: 0,
    errors: null
};

const productReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'UPLOAD_START':
            return {
                ...state,
                loading: true,
                uploadProgress: 0,
                errors: null
            };
            
        case 'UPLOAD_PROGRESS':
            return {
                ...state,
                uploadProgress: action.payload
            };
            
        case 'UPLOAD_SUCCESS':
            return {
                ...state,
                loading: false,
                products: [...state.products, action.payload],
                uploadProgress: 100
            };
            
        case 'UPLOAD_ERROR':
            return {
                ...state,
                loading: false,
                errors: action.payload,
                uploadProgress: 0
            };
            
        default:
            return state;
    }
};

// Action creators
const uploadProductWithImages = (formData) => {
    return async (dispatch) => {
        dispatch({ type: 'UPLOAD_START' });
        
        try {
            const result = await uploadWithProgress(formData, (progress) => {
                dispatch({ type: 'UPLOAD_PROGRESS', payload: progress });
            });
            
            dispatch({ type: 'UPLOAD_SUCCESS', payload: result.data });
            
        } catch (error) {
            dispatch({ type: 'UPLOAD_ERROR', payload: error.message });
        }
    };
};

// ======================================
// 13. EJEMPLO DE VALIDACIÓN COMPLETA
// ======================================

const validateProductForm = (formData, images) => {
    const errors = {};
    
    // Validar campos requeridos
    if (!formData.name || formData.name.length < 2) {
        errors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.description || formData.description.length < 10) {
        errors.description = 'La descripción debe tener al menos 10 caracteres';
    }
    
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
        errors.price = 'El precio debe ser un número mayor a 0';
    }
    
    if (!formData.category) {
        errors.category = 'La categoría es obligatoria';
    }
    
    if (!formData.sku || formData.sku.length < 2) {
        errors.sku = 'El SKU debe tener al menos 2 caracteres';
    }
    
    if (!formData.stock || isNaN(formData.stock) || formData.stock < 0) {
        errors.stock = 'El stock debe ser un número mayor o igual a 0';
    }
    
    // Validar imágenes
    if (!images || images.length === 0) {
        errors.images = 'Debe subir al menos una imagen';
    } else {
        try {
            validateProductImages(images);
        } catch (error) {
            errors.images = error.message;
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ======================================
// 14. EJEMPLO DE COMPRESIÓN DE IMÁGENES
// ======================================

const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calcular nuevas dimensiones manteniendo aspecto
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convertir a blob
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
};

// Uso en el formulario:
const handleImageSelection = async (e) => {
    const files = Array.from(e.target.files);
    const compressedFiles = [];
    
    for (const file of files) {
        if (file.size > 1024 * 1024) { // Si es mayor a 1MB, comprimir
            const compressed = await compressImage(file);
            compressedFiles.push(compressed);
        } else {
            compressedFiles.push(file);
        }
    }
    
    setImages(compressedFiles);
};

// ======================================
// EXPORTAR FUNCIONES PARA USO
// ======================================

module.exports = {
    createProductWithImages,
    updateUserAvatar,
    createCategoryWithImage,
    uploadProductImages,
    handleApiResponse,
    validateImage,
    validateProductImages,
    previewImages,
    uploadWithProgress,
    validateProductForm,
    compressImage
};