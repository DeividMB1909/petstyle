const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    originalPrice: {
        type: Number,
        min: [0, 'El precio original no puede ser negativo']
    },
    discount: {
        type: Number,
        min: [0, 'El descuento no puede ser negativo'],
        max: [100, 'El descuento no puede ser mayor a 100%'],
        default: 0
    },
    // ✅ ACTUALIZADO: Imágenes con integración completa Cloudinary
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: ''
        },
        isPrimary: {
            type: Boolean,
            default: false
        },
        optimizedUrl: {
            type: String // URL optimizada para thumbnails
        }
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'La categoría es obligatoria']
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    brand: {
        type: String,
        trim: true,
        maxlength: [50, 'La marca no puede exceder 50 caracteres']
    },
    sku: {
        type: String,
        unique: true,
        required: [true, 'El SKU es obligatorio'],
        uppercase: true
    },
    stock: {
        type: Number,
        required: [true, 'El stock es obligatorio'],
        min: [0, 'El stock no puede ser negativo'],
        default: 0
    },
    minStock: {
        type: Number,
        default: 5
    },
    weight: {
        value: { type: Number },
        unit: { type: String, enum: ['g', 'kg', 'lb'], default: 'kg' }
    },
    dimensions: {
        length: { type: Number },
        width: { type: Number },
        height: { type: Number },
        unit: { type: String, enum: ['cm', 'm', 'in'], default: 'cm' }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    specifications: [{
        name: { type: String, required: true },
        value: { type: String, required: true }
    }],
    featured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    views: {
        type: Number,
        default: 0
    },
    sales: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Índices para mejorar consultas
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ price: 1 });

// Virtual para verificar si está en stock
productSchema.virtual('inStock').get(function() {
    return this.stock > 0;
});

// Virtual para verificar stock bajo
productSchema.virtual('lowStock').get(function() {
    return this.stock <= this.minStock && this.stock > 0;
});

// ✅ NUEVO: Virtual para obtener imagen principal
productSchema.virtual('primaryImage').get(function() {
    const primaryImg = this.images.find(img => img.isPrimary);
    return primaryImg || this.images[0] || null;
});

// Middleware para actualizar el precio con descuento
productSchema.pre('save', function(next) {
    if (this.originalPrice && this.discount > 0) {
        this.price = this.originalPrice * (1 - this.discount / 100);
    }
    
    // ✅ NUEVO: Asegurar que hay una imagen principal
    if (this.images && this.images.length > 0) {
        const hasPrimary = this.images.some(img => img.isPrimary);
        if (!hasPrimary) {
            this.images[0].isPrimary = true;
        }
    }
    
    next();
});

module.exports = mongoose.model('Product', productSchema);