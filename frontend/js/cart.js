// ===== CART PAGE - INTEGRATED & OPTIMIZED =====
console.log('🛒 Cart Page Script Loading...');

class CartPage {
    constructor() {
        this.cartItems = [];
        this.products = [];
        this.cartProducts = [];
        this.couponCodes = this.initializeCoupons();
        this.appliedCoupon = null;
        this.initialized = false;
        this.itemToRemove = null;
        this.isProcessingCheckout = false;
    }

    initializeCoupons() {
        return {
            'PETSTYLE10': { 
                discount: 0.10, 
                minAmount: 30000, 
                description: '10% de descuento',
                type: 'percentage'
            },
            'PRIMERA20': { 
                discount: 0.20, 
                minAmount: 50000, 
                description: '20% primera compra',
                type: 'percentage'
            },
            'ENVIOGRATIS': { 
                discount: 0, 
                minAmount: 25000, 
                description: 'Envío gratis',
                type: 'free_shipping'
            },
            'DESCUENTO5000': {
                discount: 5000,
                minAmount: 40000,
                description: '$5.000 de descuento',
                type: 'fixed'
            }
        };
    }

    // ================================
    // INITIALIZATION
    // ================================

    async initialize() {
        try {
            console.log('🚀 Initializing Cart Page...');
            
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load data
            await this.loadCartData();
            
            // Initial render
            await this.renderPage();
            
            // Update counters
            utils.storage.updateCounters();
            
            this.initialized = true;
            console.log('✅ Cart Page initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Cart Page:', error);
            this.showError('Error cargando el carrito');
        }
    }

    async waitForDependencies() {
        let retries = 0;
        const maxRetries = 10;
        
        while ((!window.api || !window.utils) && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (!window.api || !window.utils) {
            throw new Error('Required dependencies not available');
        }
    }

    async loadCartData() {
        try {
            utils.showLoading('#cart-items', 'Cargando carrito...');
            
            // Get cart from storage
            this.cartItems = utils.storage.getCart();
            console.log(`🛒 Found ${this.cartItems.length} items in cart`);
            
            if (this.cartItems.length === 0) {
                this.cartProducts = [];
                return;
            }
            
            // Get current product data from API to verify stock and prices
            this.products = await api.getAllProducts();
            
            // Match cart items with current product data
            this.cartProducts = this.cartItems.map(cartItem => {
                const currentProduct = this.products.find(p => p._id === cartItem.productId);
                
                if (!currentProduct) {
                    console.warn(`⚠️ Product ${cartItem.productId} not found in API`);
                    return { ...cartItem, notFound: true };
                }
                
                // Update with current price and stock
                return {
                    ...cartItem,
                    currentPrice: currentProduct.price || currentProduct.precio,
                    currentStock: currentProduct.stock || 0,
                    productData: currentProduct,
                    priceChanged: cartItem.price !== (currentProduct.price || currentProduct.precio)
                };
            });
            
            // Clean up items that no longer exist
            await this.cleanupMissingItems();
            
            console.log(`📦 Processed ${this.cartProducts.length} cart items`);
            
        } catch (error) {
            console.error('❌ Error loading cart data:', error);
            utils.notifications.error('Error cargando datos del carrito');
        } finally {
            utils.hideLoading('#cart-items');
        }
    }

    async cleanupMissingItems() {
        const validItems = this.cartProducts.filter(item => !item.notFound);
        
        if (validItems.length !== this.cartItems.length) {
            console.log(`🧹 Cleaning ${this.cartItems.length - validItems.length} missing items`);
            utils.storage.saveCart(validItems);
            this.cartItems = validItems;
            this.cartProducts = validItems;
            
            if (this.cartItems.length !== this.cartProducts.length) {
                utils.notifications.info('Algunos productos ya no están disponibles');
            }
        }
    }

    // ================================
    // EVENT LISTENERS SETUP
    // ================================

    setupEventListeners() {
        // Action buttons
        this.setupActionButtons();
        
        // Coupon system
        this.setupCouponSystem();
        
        // Modal events
        this.setupModalEvents();
        
        // Navigation events
        this.setupNavigationEvents();
        
        // Storage sync between tabs
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.includes('cart_')) {
                console.log('🔄 Cart changed in another tab, reloading...');
                this.reloadCart();
            }
        });

        console.log('✅ Event listeners configured');
    }

    setupActionButtons() {
        // Clear cart button
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                utils.showModal('clear-cart-modal');
            });
        }

        // Continue shopping button
        const continueShoppingBtn = document.getElementById('continue-shopping-btn');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                utils.showLoading('body', 'Navegando...');
                window.location.href = 'main.html';
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.proceedToCheckout();
            });
        }
    }

    setupCouponSystem() {
        // Apply coupon button
        const applyCouponBtn = document.getElementById('apply-coupon-btn');
        const couponInput = document.getElementById('coupon-code');
        
        if (applyCouponBtn) {
            applyCouponBtn.addEventListener('click', () => {
                const code = couponInput?.value.trim();
                if (code) {
                    this.applyCoupon(code);
                }
            });
        }
        
        if (couponInput) {
            couponInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const code = e.target.value.trim();
                    if (code) {
                        this.applyCoupon(code);
                    }
                }
            });
        }
    }

    setupModalEvents() {
        // Remove item modal
        const confirmRemoveBtn = document.getElementById('confirm-remove-item');
        const cancelRemoveBtn = document.getElementById('cancel-remove-item');
        
        if (confirmRemoveBtn) {
            confirmRemoveBtn.addEventListener('click', () => {
                this.confirmRemoveItem();
            });
        }
        
        if (cancelRemoveBtn) {
            cancelRemoveBtn.addEventListener('click', () => {
                utils.hideModal('remove-item-modal');
                this.itemToRemove = null;
            });
        }

        // Clear cart modal
        const confirmClearBtn = document.getElementById('confirm-clear-cart');
        const cancelClearBtn = document.getElementById('cancel-clear-cart');
        
        if (confirmClearBtn) {
            confirmClearBtn.addEventListener('click', () => {
                this.confirmClearCart();
            });
        }
        
        if (cancelClearBtn) {
            cancelClearBtn.addEventListener('click', () => {
                utils.hideModal('clear-cart-modal');
            });
        }

        // Checkout modal
        this.setupCheckoutModalEvents();
    }

    setupCheckoutModalEvents() {
        // Checkout form events
        const cancelCheckoutBtn = document.getElementById('cancel-checkout');
        const confirmPurchaseBtn = document.getElementById('confirm-purchase');
        
        if (cancelCheckoutBtn) {
            cancelCheckoutBtn.addEventListener('click', () => {
                utils.hideModal('checkout-modal');
            });
        }
        
        if (confirmPurchaseBtn) {
            confirmPurchaseBtn.addEventListener('click', () => {
                this.processPurchase();
            });
        }

        // Success modal
        const continueShoppingSuccessBtn = document.getElementById('continue-shopping-success');
        if (continueShoppingSuccessBtn) {
            continueShoppingSuccessBtn.addEventListener('click', () => {
                utils.hideModal('success-modal');
                window.location.href = 'main.html';
            });
        }
    }

    setupNavigationEvents() {
        // Update counters on page focus
        window.addEventListener('focus', () => {
            utils.storage.updateCounters();
        });
    }

    // ================================
    // RENDERING METHODS
    // ================================

    async renderPage() {
        // Update cart items count
        this.updateCartItemsCount();
        
        // Show/hide action bar
        this.updateActionsBar();
        
        // Render cart items or empty state
        if (this.cartProducts.length === 0) {
            this.showEmptyState();
        } else {
            this.showCartContent();
        }
        
        // Update totals
        this.updateTotals();
    }

    updateCartItemsCount() {
        const countElement = document.getElementById('cart-items-count');
        const navCountElement = document.getElementById('nav-cart-count');
        
        const totalItems = this.cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
        const text = `${totalItems} producto${totalItems !== 1 ? 's' : ''}`;
        
        if (countElement) {
            countElement.textContent = text;
        }
        
        if (navCountElement) {
            navCountElement.textContent = totalItems;
            navCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    updateActionsBar() {
        const actionsBar = document.getElementById('actions-bar');
        if (actionsBar) {
            actionsBar.style.display = this.cartProducts.length > 0 ? 'flex' : 'none';
        }
    }

    showEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const cartContent = document.getElementById('cart-content');
        
        if (emptyState) emptyState.style.display = 'block';
        if (cartContent) cartContent.classList.add('hidden');
    }

    showCartContent() {
        const emptyState = document.getElementById('empty-state');
        const cartContent = document.getElementById('cart-content');
        
        if (emptyState) emptyState.style.display = 'none';
        if (cartContent) {
            cartContent.classList.remove('hidden');
            this.renderCartItems();
        }
    }

    renderCartItems() {
        const container = document.getElementById('cart-items');
        if (!container) return;

        const itemsHTML = this.cartProducts.map(item => 
            this.createCartItemCard(item)
        ).join('');
        
        container.innerHTML = itemsHTML;
        
        console.log(`✅ Rendered ${this.cartProducts.length} cart items`);
    }

    createCartItemCard(item) {
        const isOutOfStock = item.currentStock <= 0;
        const priceChanged = item.priceChanged;
        const maxQuantity = Math.min(99, item.currentStock || 0);
        
        return `
            <div class="cart-item ${isOutOfStock ? 'out-of-stock' : ''}" data-product-id="${item.productId}">
                <div class="item-image">
                    <img src="${utils.storage.getProductImage(item.productData || item)}" 
                         alt="${item.name}"
                         onerror="this.src='https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop'">
                    
                    ${isOutOfStock ? '<div class="stock-badge">Agotado</div>' : ''}
                    ${priceChanged ? '<div class="price-changed-badge">Precio actualizado</div>' : ''}
                </div>
                
                <div class="item-details">
                    <div class="item-header">
                        <h3 class="item-name">${item.name}</h3>
                        <button class="favorite-btn ${utils.storage.isInFavorites(item.productId) ? 'active' : ''}" 
                                onclick="cartPage.toggleFavorite('${item.productId}')"
                                title="Agregar a favoritos">
                            <i class="${utils.storage.isInFavorites(item.productId) ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                    
                    <div class="item-price-info">
                        <div class="current-price">
                            ${utils.formatPrice(item.currentPrice || item.price)}
                            ${priceChanged ? `<span class="old-price">${utils.formatPrice(item.price)}</span>` : ''}
                        </div>
                        ${item.currentStock ? `<div class="stock-info">${item.currentStock} disponibles</div>` : ''}
                    </div>
                    
                    <div class="quantity-controls">
                        <button class="quantity-btn" 
                                onclick="cartPage.updateQuantity('${item.productId}', ${item.quantity - 1})"
                                ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        
                        <input type="number" 
                               class="quantity-input" 
                               value="${item.quantity}" 
                               min="1" 
                               max="${maxQuantity}"
                               onchange="cartPage.updateQuantity('${item.productId}', this.value)"
                               ${isOutOfStock ? 'disabled' : ''}>
                        
                        <button class="quantity-btn" 
                                onclick="cartPage.updateQuantity('${item.productId}', ${item.quantity + 1})"
                                ${item.quantity >= maxQuantity || isOutOfStock ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <div class="item-total">
                        <div class="subtotal">
                            ${utils.formatPrice((item.currentPrice || item.price) * item.quantity)}
                        </div>
                    </div>
                    
                    <div class="item-actions">
                        <button class="btn-remove" 
                                onclick="cartPage.showRemoveItemConfirmation('${item.productId}')"
                                title="Eliminar producto">
                            <i class="fas fa-trash"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ================================
    // CART ACTIONS
    // ================================

    async updateQuantity(productId, newQuantity) {
        try {
            newQuantity = parseInt(newQuantity) || 1;
            
            if (newQuantity <= 0) {
                this.showRemoveItemConfirmation(productId);
                return;
            }

            const result = utils.storage.updateCartQuantity(productId, newQuantity);
            
            if (result.success) {
                await this.reloadCart();
                this.updateTotals();
                utils.notifications.success('Cantidad actualizada');
            } else {
                utils.notifications.warning(result.message);
            }
            
        } catch (error) {
            console.error('❌ Error updating quantity:', error);
            utils.notifications.error('Error al actualizar cantidad');
        }
    }

    showRemoveItemConfirmation(productId) {
        const item = this.cartProducts.find(item => item.productId === productId);
        if (!item) return;

        this.itemToRemove = productId;
        
        // Populate remove modal with item info
        const itemImage = document.getElementById('remove-item-image');
        const itemName = document.getElementById('remove-item-name');
        const itemPrice = document.getElementById('remove-item-price');
        
        if (itemImage) itemImage.src = utils.storage.getProductImage(item.productData || item);
        if (itemName) itemName.textContent = item.name;
        if (itemPrice) itemPrice.textContent = utils.formatPrice(item.currentPrice || item.price);
        
        utils.showModal('remove-item-modal');
    }

    async confirmRemoveItem() {
        if (!this.itemToRemove) return;

        try {
            const result = utils.storage.removeFromCart(this.itemToRemove);
            
            if (result.success) {
                utils.notifications.success(result.message);
                await this.reloadCart();
            }
            
        } catch (error) {
            console.error('❌ Error removing item:', error);
            utils.notifications.error('Error al eliminar producto');
        } finally {
            utils.hideModal('remove-item-modal');
            this.itemToRemove = null;
        }
    }

    async confirmClearCart() {
        try {
            const result = utils.storage.clearCart();
            
            if (result.success) {
                utils.notifications.success('Carrito vaciado');
                await this.reloadCart();
            }
            
        } catch (error) {
            console.error('❌ Error clearing cart:', error);
            utils.notifications.error('Error al vaciar carrito');
        } finally {
            utils.hideModal('clear-cart-modal');
        }
    }

    async toggleFavorite(productId) {
        try {
            const item = this.cartProducts.find(item => item.productId === productId);
            if (!item || !item.productData) return;

            const result = utils.storage.toggleFavorite(item.productData);
            
            if (result.success) {
                utils.notifications.success(result.message);
                
                // Update heart icon
                const heartBtn = document.querySelector(`[data-product-id="${productId}"] .favorite-btn`);
                const heartIcon = heartBtn?.querySelector('i');
                
                if (heartIcon) {
                    const isFavorite = utils.storage.isInFavorites(productId);
                    heartIcon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
                    heartBtn.classList.toggle('active', isFavorite);
                }
            }
            
        } catch (error) {
            console.error('❌ Error toggling favorite:', error);
            utils.notifications.error('Error al actualizar favoritos');
        }
    }

    // ================================
    // COUPON SYSTEM
    // ================================

    applyCoupon(code) {
        const upperCode = code.toUpperCase();
        const coupon = this.couponCodes[upperCode];
        
        if (!coupon) {
            utils.notifications.error('Código de descuento no válido');
            return;
        }

        const totals = this.calculateTotals();
        
        if (totals.subtotal < coupon.minAmount) {
            utils.notifications.warning(
                `Compra mínima requerida: ${utils.formatPrice(coupon.minAmount)}`
            );
            return;
        }

        this.appliedCoupon = { code: upperCode, ...coupon };
        
        // Clear input
        const couponInput = document.getElementById('coupon-code');
        if (couponInput) couponInput.value = '';
        
        // Update totals
        this.updateTotals();
        
        // Show coupon message
        this.updateCouponDisplay();
        
        utils.notifications.success(`Cupón aplicado: ${coupon.description}`);
        
        console.log('🎫 Applied coupon:', upperCode);
    }

    removeCoupon() {
        this.appliedCoupon = null;
        this.updateTotals();
        this.updateCouponDisplay();
        utils.notifications.success('Cupón removido');
    }

    updateCouponDisplay() {
        const couponMessage = document.getElementById('coupon-message');
        if (!couponMessage) return;

        if (this.appliedCoupon) {
            couponMessage.innerHTML = `
                <div class="coupon-applied">
                    <span class="coupon-info">
                        <i class="fas fa-tag"></i>
                        ${this.appliedCoupon.code} - ${this.appliedCoupon.description}
                    </span>
                    <button class="btn-remove-coupon" onclick="cartPage.removeCoupon()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            couponMessage.style.display = 'block';
        } else {
            couponMessage.style.display = 'none';
        }
    }

    // ================================
    // TOTALS CALCULATION
    // ================================

    calculateTotals() {
        const subtotal = this.cartProducts.reduce((total, item) => {
            return total + ((item.currentPrice || item.price) * item.quantity);
        }, 0);

        let discount = 0;
        let shipping = subtotal >= 50000 ? 0 : 5000; // Free shipping over $50,000

        if (this.appliedCoupon) {
            switch (this.appliedCoupon.type) {
                case 'percentage':
                    discount = Math.floor(subtotal * this.appliedCoupon.discount);
                    break;
                case 'fixed':
                    discount = this.appliedCoupon.discount;
                    break;
                case 'free_shipping':
                    shipping = 0;
                    break;
            }
        }

        const total = Math.max(0, subtotal - discount + shipping);

        return {
            subtotal,
            discount,
            shipping,
            total,
            itemCount: this.cartProducts.reduce((sum, item) => sum + item.quantity, 0)
        };
    }

    updateTotals() {
        const totals = this.calculateTotals();
        
        // Update summary elements
        const elements = {
            'summary-items-count': totals.itemCount,
            'subtotal': utils.formatPrice(totals.subtotal),
            'shipping-cost': totals.shipping === 0 ? 'GRATIS' : utils.formatPrice(totals.shipping),
            'discount-amount': totals.discount > 0 ? `-${utils.formatPrice(totals.discount)}` : utils.formatPrice(0),
            'total': utils.formatPrice(totals.total)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Show/hide discount row
        const discountRow = document.getElementById('discount-row');
        if (discountRow) {
            discountRow.style.display = totals.discount > 0 ? 'flex' : 'none';
        }

        console.log('💰 Updated totals:', totals);
    }

    // ================================
    // CHECKOUT PROCESS
    // ================================

    proceedToCheckout() {
        if (this.cartProducts.length === 0) {
            utils.notifications.warning('El carrito está vacío');
            return;
        }

        if (this.isProcessingCheckout) {
            utils.notifications.info('Ya se está procesando el checkout');
            return;
        }

        // Validate stock before checkout
        const outOfStockItems = this.cartProducts.filter(item => 
            item.currentStock < item.quantity
        );

        if (outOfStockItems.length > 0) {
            const itemNames = outOfStockItems.map(item => item.name).join(', ');
            utils.notifications.error(`Sin stock suficiente: ${itemNames}`);
            return;
        }

        this.populateCheckoutModal();
        utils.showModal('checkout-modal');
    }

    populateCheckoutModal() {
        const totals = this.calculateTotals();
        
        // Update checkout summary
        const checkoutItems = document.getElementById('checkout-items');
        if (checkoutItems) {
            const itemsHTML = this.cartProducts.map(item => `
                <div class="checkout-item">
                    <span class="item-name">${item.name} × ${item.quantity}</span>
                    <span class="item-price">${utils.formatPrice((item.currentPrice || item.price) * item.quantity)}</span>
                </div>
            `).join('');
            
            checkoutItems.innerHTML = itemsHTML;
        }
        
        // Update total
        const checkoutTotal = document.getElementById('checkout-total');
        if (checkoutTotal) {
            checkoutTotal.textContent = utils.formatPrice(totals.total);
        }
    }

    async processPurchase() {
        if (this.isProcessingCheckout) return;
        
        try {
            this.isProcessingCheckout = true;
            
            // Validate form
            const form = document.getElementById('shipping-form');
            if (form && !form.checkValidity()) {
                utils.notifications.warning('Por favor completa todos los campos requeridos');
                return;
            }
            
            // Show processing state
            const confirmBtn = document.getElementById('confirm-purchase');
            if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            }
            
            // Simulate purchase processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success
            const orderNumber = this.generateOrderNumber();
            this.showPurchaseSuccess(orderNumber);
            
            // Clear cart after successful purchase
            utils.storage.clearCart();
            
        } catch (error) {
            console.error('❌ Error processing purchase:', error);
            utils.notifications.error('Error procesando la compra');
            
        } finally {
            this.isProcessingCheckout = false;
            
            // Reset button
            const confirmBtn = document.getElementById('confirm-purchase');
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirmar Compra';
            }
        }
    }

    generateOrderNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PS-${timestamp}-${random}`;
    }

    showPurchaseSuccess(orderNumber) {
        utils.hideModal('checkout-modal');
        
        // Populate success modal
        const orderNumberElement = document.getElementById('order-number');
        const orderTotalElement = document.getElementById('order-total');
        
        if (orderNumberElement) orderNumberElement.textContent = orderNumber;
        if (orderTotalElement) {
            const totals = this.calculateTotals();
            orderTotalElement.textContent = utils.formatPrice(totals.total);
        }
        
        utils.showModal('success-modal');
        
        // Auto-reload cart
        setTimeout(() => {
            this.reloadCart();
        }, 1000);
        
        console.log('🎉 Purchase completed successfully!');
    }

    // ================================
    // UTILITY METHODS
    // ================================

    async reloadCart() {
        try {
            await this.loadCartData();
            await this.renderPage();
        } catch (error) {
            console.error('❌ Error reloading cart:', error);
        }
    }

    showError(message) {
        const container = document.getElementById('cart-items');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Error al cargar el carrito</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Recargar página
                    </button>
                </div>
            `;
        }
    }
}

// ================================
// INITIALIZATION & GLOBAL EXPORT
// ================================

let cartPage;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🛒 DOM loaded, initializing Cart Page...');
    
    cartPage = new CartPage();
    await cartPage.initialize();
    
    // Export for debugging
    if (window.location.hostname === 'localhost') {
        window.cartPage = cartPage;
    }
});

// Export for global access
window.cartPage = cartPage;

console.log('✅ Cart Page Script loaded successfully');