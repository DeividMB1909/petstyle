// backend/models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'La cantidad debe ser al menos 1'],
        default: 1
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'El precio no puede ser negativo']
    },
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'El subtotal no puede ser negativo']
    }
}, {
    _id: true
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0,
        min: [0, 'El total no puede ser negativo']
    },
    totalItems: {
        type: Number,
        default: 0,
        min: [0, 'El total de items no puede ser negativo']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índices
cartSchema.index({ user: 1 });
cartSchema.index({ 'items.product': 1 });

// Virtual para obtener el número total de items
cartSchema.virtual('itemCount').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Middleware para actualizar totales antes de guardar
cartSchema.pre('save', function(next) {
    // Calcular total de items
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    
    // Calcular total amount
    this.totalAmount = this.items.reduce((total, item) => total + item.subtotal, 0);
    
    // Actualizar fecha de modificación
    this.lastModified = new Date();
    
    next();
});

// Método para limpiar items inválidos
cartSchema.methods.cleanInvalidItems = async function() {
    const Product = mongoose.model('Product');
    const validItems = [];
    
    for (const item of this.items) {
        const product = await Product.findById(item.product);
        if (product && product.isActive && product.stock >= item.quantity) {
            validItems.push(item);
        }
    }
    
    this.items = validItems;
    return this.save();
};

// Método para agregar producto
cartSchema.methods.addProduct = function(productId, quantity, price) {
    const existingItemIndex = this.items.findIndex(
        item => item.product.toString() === productId.toString()
    );
    
    if (existingItemIndex > -1) {
        // Actualizar cantidad del producto existente
        this.items[existingItemIndex].quantity += quantity;
        this.items[existingItemIndex].subtotal = 
            this.items[existingItemIndex].quantity * this.items[existingItemIndex].price;
    } else {
        // Agregar nuevo producto
        this.items.push({
            product: productId,
            quantity: quantity,
            price: price,
            subtotal: quantity * price
        });
    }
    
    return this;
};

// Método para remover producto
cartSchema.methods.removeProduct = function(productId) {
    this.items = this.items.filter(
        item => item.product.toString() !== productId.toString()
    );
    return this;
};

// Método para vaciar carrito
cartSchema.methods.clear = function() {
    this.items = [];
    this.totalAmount = 0;
    this.totalItems = 0;
    return this;
};

module.exports = mongoose.model('Cart', cartSchema);