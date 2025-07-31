class CartManager {
    constructor(api) {
        this.api = api;
        this.cart = [];
        this.loadCart();
    }

    loadCart() {
        const cartData = localStorage.getItem(CONFIG.STORAGE_KEYS.CART);
        if (cartData) {
            this.cart = JSON.parse(cartData);
        }
    }

    saveCart() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(this.cart));
        this.updateCartUI();
    }

    addItem(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.product._id === product._id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                product,
                quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        Utils.showToast(`${product.name} agregado al carrito`, 'success');
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.product._id !== productId);
        this.saveCart();
        Utils.showToast('Producto eliminado del carrito', 'info');
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.product._id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        Utils.showToast('Carrito vaciado', 'info');
    }

    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    updateCartUI() {
        // Actualizar contador en navbar
        const cartBadge = document.querySelector('.cart-badge');
        if (cartBadge) {
            const totalItems = this.getTotalItems();
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }
}
