// ===== PETSTYLE UTILITIES SYSTEM - INTEGRATED =====
console.log('🔧 PetStyle Utils System Loading...');

// ================================
// STORAGE MANAGEMENT SYSTEM
// ================================

class PetStyleStorage {
    constructor() {
        this.KEYS = {
            USER: 'petstyle_user',
            TOKEN: 'petstyle_token',
            CART: 'petstyle_cart',
            FAVORITES: 'petstyle_favorites'
        };
    }

    // Get current user
    getCurrentUser() {
        try {
            const userData = localStorage.getItem(this.KEYS.USER);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Get user-specific key for data isolation
    getUserKey(dataType) {
        const user = this.getCurrentUser();
        const userIdentifier = user?.email || user?._id || 'guest';
        return `${dataType}_${userIdentifier}`;
    }

    // ================================
    // FAVORITES MANAGEMENT
    // ================================

    getFavorites() {
        try {
            const favoritesKey = this.getUserKey('favorites');
            const favorites = localStorage.getItem(favoritesKey);
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('Error getting favorites:', error);
            return [];
        }
    }

    saveFavorites(favorites) {
        try {
            const favoritesKey = this.getUserKey('favorites');
            localStorage.setItem(favoritesKey, JSON.stringify(favorites));
            this.updateCounters();
            return true;
        } catch (error) {
            console.error('Error saving favorites:', error);
            return false;
        }
    }

    addToFavorites(product) {
        try {
            const favorites = this.getFavorites();
            
            // Check if already in favorites
            if (favorites.some(fav => fav.id === product._id)) {
                return { success: false, message: 'Ya está en favoritos' };
            }

            const favoriteItem = {
                id: product._id,
                name: product.name || product.nombre,
                price: product.price || product.precio,
                image: this.getProductImage(product),
                category: product.category || product.categoria,
                addedAt: new Date().toISOString()
            };

            favorites.push(favoriteItem);
            this.saveFavorites(favorites);

            console.log('💖 Added to favorites:', product.name);
            return { success: true, message: 'Agregado a favoritos' };
            
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return { success: false, message: 'Error al agregar a favoritos' };
        }
    }

    removeFromFavorites(productId) {
        try {
            let favorites = this.getFavorites();
            const originalLength = favorites.length;
            
            favorites = favorites.filter(fav => fav.id !== productId);
            
            if (favorites.length < originalLength) {
                this.saveFavorites(favorites);
                console.log('💔 Removed from favorites:', productId);
                return { success: true, message: 'Removido de favoritos' };
            }
            
            return { success: false, message: 'No encontrado en favoritos' };
            
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return { success: false, message: 'Error al remover de favoritos' };
        }
    }

    toggleFavorite(product) {
        const favorites = this.getFavorites();
        const isInFavorites = favorites.some(fav => fav.id === product._id);
        
        if (isInFavorites) {
            return this.removeFromFavorites(product._id);
        } else {
            return this.addToFavorites(product);
        }
    }

    isInFavorites(productId) {
        const favorites = this.getFavorites();
        return favorites.some(fav => fav.id === productId);
    }

    // ================================
    // CART MANAGEMENT
    // ================================

    getCart() {
        try {
            const cartKey = this.getUserKey('cart');
            const cart = localStorage.getItem(cartKey);
            return cart ? JSON.parse(cart) : [];
        } catch (error) {
            console.error('Error getting cart:', error);
            return [];
        }
    }

    saveCart(cartItems) {
        try {
            const cartKey = this.getUserKey('cart');
            localStorage.setItem(cartKey, JSON.stringify(cartItems));
            this.updateCounters();
            return true;
        } catch (error) {
            console.error('Error saving cart:', error);
            return false;
        }
    }

    addToCart(product, quantity = 1) {
        try {
            const cart = this.getCart();
            
            // Check stock availability
            if (!product.stock || product.stock <= 0) {
                return { success: false, message: 'Producto sin stock' };
            }

            const existingItem = cart.find(item => item.productId === product._id);

            if (existingItem) {
                // Update quantity if product already in cart
                const newQuantity = existingItem.quantity + quantity;
                
                if (newQuantity > product.stock) {
                    return { success: false, message: 'Stock insuficiente' };
                }
                
                existingItem.quantity = newQuantity;
                existingItem.subtotal = existingItem.price * newQuantity;
                existingItem.updatedAt = new Date().toISOString();
            } else {
                // Add new item to cart
                const cartItem = {
                    productId: product._id,
                    name: product.name || product.nombre,
                    price: product.price || product.precio,
                    quantity: quantity,
                    subtotal: (product.price || product.precio) * quantity,
                    image: this.getProductImage(product),
                    category: product.category || product.categoria,
                    addedAt: new Date().toISOString()
                };
                
                cart.push(cartItem);
            }

            this.saveCart(cart);
            console.log('🛒 Added to cart:', product.name);
            return { success: true, message: 'Agregado al carrito' };
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, message: 'Error al agregar al carrito' };
        }
    }

    updateCartQuantity(productId, newQuantity) {
        try {
            const cart = this.getCart();
            const item = cart.find(item => item.productId === productId);
            
            if (!item) {
                return { success: false, message: 'Producto no encontrado en el carrito' };
            }

            if (newQuantity <= 0) {
                return this.removeFromCart(productId);
            }

            item.quantity = newQuantity;
            item.subtotal = item.price * newQuantity;
            item.updatedAt = new Date().toISOString();
            
            this.saveCart(cart);
            return { success: true, message: 'Cantidad actualizada' };
            
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            return { success: false, message: 'Error al actualizar cantidad' };
        }
    }

    removeFromCart(productId) {
        try {
            let cart = this.getCart();
            const originalLength = cart.length;
            
            cart = cart.filter(item => item.productId !== productId);
            
            if (cart.length < originalLength) {
                this.saveCart(cart);
                console.log('🗑️ Removed from cart:', productId);
                return { success: true, message: 'Removido del carrito' };
            }
            
            return { success: false, message: 'No encontrado en el carrito' };
            
        } catch (error) {
            console.error('Error removing from cart:', error);
            return { success: false, message: 'Error al remover del carrito' };
        }
    }

    clearCart() {
        try {
            this.saveCart([]);
            console.log('🧹 Cart cleared');
            return { success: true, message: 'Carrito vaciado' };
        } catch (error) {
            console.error('Error clearing cart:', error);
            return { success: false, message: 'Error al vaciar carrito' };
        }
    }

    getCartTotals() {
        const cart = this.getCart();
        
        const subtotal = cart.reduce((total, item) => total + (item.subtotal || 0), 0);
        const itemCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
        const shipping = subtotal >= 50000 ? 0 : 5000; // Free shipping over $50,000
        const total = subtotal + shipping;

        return {
            subtotal,
            shipping,
            total,
            itemCount,
            isEmpty: cart.length === 0
        };
    }

    // ================================
    // COUNTER UPDATES
    // ================================

    updateCounters() {
        const favorites = this.getFavorites();
        const cart = this.getCart();
        
        // Update favorites counters
        const favCounters = document.querySelectorAll('[id*="favorites-count"], [id*="nav-favorites"]');
        favCounters.forEach(counter => {
            counter.textContent = favorites.length;
            counter.style.display = favorites.length > 0 ? 'flex' : 'none';
        });

        // Update cart counters
        const cartCounters = document.querySelectorAll('[id*="cart-count"], [id*="nav-cart"]');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        cartCounters.forEach(counter => {
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'flex' : 'none';
        });

        console.log(`🔄 Counters updated - Favorites: ${favorites.length}, Cart: ${totalItems}`);
    }

    // ================================
    // UTILITY HELPERS
    // ================================

    getProductImage(product) {
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            return product.images[0].url || product.images[0];
        }
        if (product.image) {
            return product.image;
        }
        return 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop';
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// ================================
// NOTIFICATION SYSTEM
// ================================

class PetStyleNotifications {
    constructor() {
        this.container = null;
        this.createContainer();
    }

    createContainer() {
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
                max-width: 400px;
            `;
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            line-height: 1.4;
        `;

        toast.innerHTML = `
            <i class="fas ${this.getIcon(type)}"></i>
            <span>${message}</span>
        `;

        this.container.appendChild(toast);

        // Show animation
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 100);

        // Auto-remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);

        return toast;
    }

    getBackgroundColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// ================================
// MODAL SYSTEM
// ================================

class PetStyleModals {
    constructor() {
        this.activeModals = new Set();
    }

    show(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal ${modalId} not found`);
            return false;
        }

        modal.classList.add('active');
        modal.style.display = 'flex';
        this.activeModals.add(modalId);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Add close event listeners
        this.addCloseListeners(modal);
        
        return true;
    }

    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        modal.classList.remove('active');
        modal.style.display = 'none';
        this.activeModals.delete(modalId);
        
        // Restore body scroll if no modals active
        if (this.activeModals.size === 0) {
            document.body.style.overflow = 'auto';
        }
        
        return true;
    }

    hideAll() {
        this.activeModals.forEach(modalId => {
            this.hide(modalId);
        });
    }

    addCloseListeners(modal) {
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hide(modal.id);
            }
        });

        // Close on close button click
        const closeButtons = modal.querySelectorAll('.modal-close, [data-modal-close]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.hide(modal.id);
            });
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.has(modal.id)) {
                this.hide(modal.id);
            }
        });
    }
}

// ================================
// LOADING SYSTEM
// ================================

class PetStyleLoading {
    show(target = 'body', message = 'Cargando...') {
        const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
        if (!targetElement) return;

        const loader = document.createElement('div');
        loader.className = 'petstyle-loader';
        loader.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                padding: 40px;
                color: #6b7280;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 3px solid #e5e7eb;
                    border-top: 3px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
                <span>${message}</span>
            </div>
        `;

        loader.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        // Add spin animation if not exists
        if (!document.getElementById('spin-keyframes')) {
            const style = document.createElement('style');
            style.id = 'spin-keyframes';
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        targetElement.style.position = 'relative';
        targetElement.appendChild(loader);

        return loader;
    }

    hide(target = 'body') {
        const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
        if (!targetElement) return;

        const loader = targetElement.querySelector('.petstyle-loader');
        if (loader) {
            loader.remove();
        }
    }
}

// ================================
// INITIALIZE SYSTEMS
// ================================

// Create global instances
const storage = new PetStyleStorage();
const notifications = new PetStyleNotifications();
const modals = new PetStyleModals();
const loading = new PetStyleLoading();

// Global utilities object
const utils = {
    storage,
    notifications,
    modals,
    loading,
    
    // Quick access methods
    showToast: (message, type, duration) => notifications.show(message, type, duration),
    showModal: (modalId) => modals.show(modalId),
    hideModal: (modalId) => modals.hide(modalId),
    showLoading: (target, message) => loading.show(target, message),
    hideLoading: (target) => loading.hide(target),
    
    // Helper functions
    formatPrice: (price) => storage.formatPrice(price),
    formatDate: (date) => storage.formatDate(date),
    
    // Common DOM helpers
    createElement: (tag, className, innerHTML) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Export to global scope
window.storage = storage;
window.notifications = notifications;
window.modals = modals;
window.loading = loading;
window.utils = utils;

// Auto-initialize counters when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    storage.updateCounters();
});

// Sync between tabs
window.addEventListener('storage', (e) => {
    if (e.key && (e.key.includes('cart_') || e.key.includes('favorites_'))) {
        storage.updateCounters();
    }
});

console.log('✅ PetStyle Utils System loaded successfully');