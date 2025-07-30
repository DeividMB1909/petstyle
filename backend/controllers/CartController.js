const { Cart, Product, User } = require('../models');

class CartController {
    // Obtener carrito del usuario
    static async getCart(req, res) {
        try {
            const { userId } = req.params;
            
            let cart = await Cart.findOne({ user: userId })
                .populate('user', 'name email')
                .populate('items.product', 'name price images isActive');

            if (!cart) {
                // Crear carrito vacío si no existe
                cart = new Cart({
                    user: userId,
                    items: [],
                    totalAmount: 0
                });
                await cart.save();
                await cart.populate('user', 'name email');
            }

            res.status(200).json({
                success: true,
                data: cart,
                message: 'Carrito obtenido exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener carrito',
                error: error.message
            });
        }
    }

    // Agregar producto al carrito
    static async addToCart(req, res) {
        try {
            const { userId } = req.params;
            const { productId, quantity = 1 } = req.body;

            // Verificar que el producto existe y está activo
            const product = await Product.findById(productId);
            if (!product || !product.isActive) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado o no disponible'
                });
            }

            // Verificar stock
            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock insuficiente'
                });
            }

            // Buscar o crear carrito
            let cart = await Cart.findOne({ user: userId });
            if (!cart) {
                cart = new Cart({
                    user: userId,
                    items: [],
                    totalAmount: 0
                });
            }

            // Verificar si el producto ya está en el carrito
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (existingItemIndex > -1) {
                // Actualizar cantidad del producto existente
                const newQuantity = cart.items[existingItemIndex].quantity + quantity;
                
                if (product.stock < newQuantity) {
                    return res.status(400).json({
                        success: false,
                        message: 'Stock insuficiente para la cantidad solicitada'
                    });
                }
                
                cart.items[existingItemIndex].quantity = newQuantity;
                cart.items[existingItemIndex].subtotal = newQuantity * product.price;
            } else {
                // Agregar nuevo producto al carrito
                cart.items.push({
                    product: productId,
                    quantity: quantity,
                    price: product.price,
                    subtotal: quantity * product.price
                });
            }

            // Recalcular total
            cart.totalAmount = cart.items.reduce((total, item) => total + item.subtotal, 0);

            await cart.save();
            await cart.populate('items.product', 'name price images isActive');

            res.status(200).json({
                success: true,
                data: cart,
                message: 'Producto agregado al carrito exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al agregar producto al carrito',
                error: error.message
            });
        }
    }

    // Actualizar cantidad de producto en carrito
    static async updateCartItem(req, res) {
        try {
            const { userId, productId } = req.params;
            const { quantity } = req.body;

            if (quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La cantidad debe ser mayor a 0'
                });
            }

            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrito no encontrado'
                });
            }

            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (itemIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado en el carrito'
                });
            }

            // Verificar stock
            const product = await Product.findById(productId);
            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock insuficiente'
                });
            }

            // Actualizar cantidad
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].subtotal = quantity * cart.items[itemIndex].price;

            // Recalcular total
            cart.totalAmount = cart.items.reduce((total, item) => total + item.subtotal, 0);

            await cart.save();
            await cart.populate('items.product', 'name price images isActive');

            res.status(200).json({
                success: true,
                data: cart,
                message: 'Carrito actualizado exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error al actualizar carrito',
                error: error.message
            });
        }
    }

    // Remover producto del carrito
    static async removeFromCart(req, res) {
        try {
            const { userId, productId } = req.params;

            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrito no encontrado'
                });
            }

            cart.items = cart.items.filter(
                item => item.product.toString() !== productId
            );

            // Recalcular total
            cart.totalAmount = cart.items.reduce((total, item) => total + item.subtotal, 0);

            await cart.save();
            await cart.populate('items.product', 'name price images isActive');

            res.status(200).json({
                success: true,
                data: cart,
                message: 'Producto removido del carrito exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al remover producto del carrito',
                error: error.message
            });
        }
    }

    // Limpiar carrito
    static async clearCart(req, res) {
        try {
            const { userId } = req.params;

            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrito no encontrado'
                });
            }

            cart.items = [];
            cart.totalAmount = 0;

            await cart.save();

            res.status(200).json({
                success: true,
                data: cart,
                message: 'Carrito limpiado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al limpiar carrito',
                error: error.message
            });
        }
    }
}

module.exports = CartController;