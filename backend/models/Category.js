const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la categoría es obligatorio'],
        unique: true,
        trim: true,
        maxlength: [30, 'El nombre no puede exceder 30 caracteres']
    },
    description: {
        type: String,
        maxlength: [200, 'La descripción no puede exceder 200 caracteres']
    },
    // ✅ ACTUALIZADO: Ícono con integración Cloudinary
    icon: {
        url: {
            type: String,
            default: 'https://res.cloudinary.com/dc5k61akp/image/upload/v1234567890/petstyle/default/default-category-icon.png'
        },
        publicId: {
            type: String,
            default: null
        }
    },
    // ✅ ACTUALIZADO: Imagen principal con integración Cloudinary
    image: {
        url: {
            type: String,
            default: 'https://res.cloudinary.com/dc5k61akp/image/upload/v1234567890/petstyle/default/default-category-banner.png'
        },
        publicId: {
            type: String,
            default: null
        }
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    subcategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

categorySchema.index({ name: 1, parentCategory: 1 });

module.exports = mongoose.model('Category', categorySchema);