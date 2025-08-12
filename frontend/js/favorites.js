// ===== FAVORITES PAGE - INTEGRATED & OPTIMIZED =====
console.log('❤️ Favorites Page Script Loading...');

class FavoritesPage {
    constructor() {
        this.favorites = [];
        this.products = [];
        this.favoriteProducts = [];
        this.initialized = false;
        this.productToRemove = null;
        this.currentModalProduct = null;
    }

    // ================================
    // INITIALIZATION
    // ================================

    async initialize() {
        try {
            console.log('🚀 Initializing Favorites Page...');
            
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load data
            await this.loadFavoritesData();
            
            // Initial render
            await this.renderPage();
            
            // Update counters
            utils.storage.updateCounters();
            
            this.initialized = true;
            console.log('✅ Favorites Page initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Favorites Page:', error);
            this.showError('Error cargando favoritos');
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

    async loadFavoritesData() {
        try {
            utils.showLoading('#favorites-grid', 'Cargando favoritos...');
            
            // Get favorites from storage
            this.favorites = utils.storage.getFavorites();
            console.log(`💖 Found ${this.favorites.length} favorites in storage`);
            
            if (this.favorites.length === 0) {
                this.favoriteProducts = [];
                return;
            }
            
            // Get all products to match with favorites
            this.products = await api.getAllProducts();
            
            // Filter products that are in favorites
            this.favoriteProducts = this.products.filter(product =>
                this.favorites.some(fav => fav.id === product._id)
            );
            
            console.log(`📦 Found ${this.favoriteProducts.length} favorite products from API`);
            
            // Clean up favorites that no longer exist in products
            this.cleanupMissingFavorites();
            
        } catch (error) {
            console.error('❌ Error loading favorites data:', error);
            utils.notifications.error('Error cargando favoritos');
        } finally {
            utils.hideLoading('#favorites-grid');
        }
    }

    cleanupMissingFavorites() {
        // Remove favorites that no longer exist in the product database
        const existingProductIds = this.products.map(p => p._id);
        const validFavorites = this.favorites.filter(fav => 
            existingProductIds.includes(fav.id)
        );
        
        if (validFavorites.length !== this.favorites.length) {
            console.log(`🧹 Cleaned ${this.favorites.length - validFavorites.length} invalid favorites`);
            utils.storage.saveFavorites(validFavorites);
            this.favorites = validFavorites;
        }
    }

    // ================================
    // EVENT LISTENERS SETUP
    // ================================

    setupEventListeners() {
        // Action buttons
        this.setupActionButtons();
        
        // Modal events
        this.setupModalEvents();
        
        // Navigation events
        this.setupNavigationEvents();
        
        // Storage sync between tabs
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.includes('favorites_')) {
                console.log('🔄 Favorites changed in another tab, reloading...');
                this.reloadFavorites();
            }
        });

        console.log('✅ Event listeners configured');
    }

    setupActionButtons() {
        // Clear all button
        const clearAllBtn = document.getElementById('clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                utils.showModal('clear-all-modal');
            });
        }

        // Add all to cart button
        const addAllToCartBtn = document.getElementById('add-all-to-cart-btn');
        if (addAllToCartBtn) {
            addAllToCartBtn.addEventListener('click', () => {
                this.addAllToCart();
            });
        }

        // Continue shopping button (in empty state)
        const continueShoppingBtn = document.querySelector('#empty-state .btn');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                utils.showLoading('body', 'Navegando...');
            });
        }
    }

    setupModalEvents() {
        // Remove confirmation modal
        const confirmRemoveBtn = document.getElementById('confirm-remove');
        const cancelRemoveBtn = document.getElementById('cancel-remove');
        
        if (confirmRemoveBtn) {
            confirmRemoveBtn.addEventListener('click', () => {
                this.confirmRemoveFavorite();
            });
        }
        
        if (cancelRemoveBtn) {
            cancelRemoveBtn.addEventListener('click', () => {
                utils.hideModal('remove-modal');
                this.productToRemove = null;
            });
        }

        // Clear all confirmation modal
        const confirmClearAllBtn = document.getElementById('confirm-clear-all');
        const cancelClearAllBtn = document.getElementById('cancel-clear-all');
        
        if (confirmClearAllBtn) {
            confirmClearAllBtn.addEventListener('click', () => {
                this.confirmClearAll();
            });
        }
        
        if (cancelClearAllBtn) {
            cancelClearAllBtn.addEventListener('click', () => {
                utils.hideModal('clear-all-modal');
            });
        }

        // Product details modal events
        this.setupProductModalEvents();
        
        // Close modals on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                utils.modals.hideAll();
                this.productToRemove = null;
                this.currentModalProduct = null;
            }
        });
    }

    setupProductModalEvents() {
        // Modal close events
        const productModal = document.getElementById('product-modal');
        if (productModal) {
            productModal.addEventListener('click', (e) => {
                if (e.target === productModal) {
                    this.closeProductModal();
                }
            });
        }

        // Quantity controls
        const quantityMinus = document.getElementById('quantity-minus');
        const quantityPlus = document.getElementById('quantity-plus');
        const quantityInput = document.getElementById('quantity-input');

        if (quantityMinus) {
            quantityMinus.addEventListener('click', () => this.updateModalQuantity(-1));
        }
        
        if (quantityPlus) {
            quantityPlus.addEventListener('click', () => this.updateModalQuantity(1));
        }
        
        if (quantityInput) {
            quantityInput.addEventListener('change', (e) => {
                const value = Math.max(1, Math.min(99, parseInt(e.target.value) || 1));
                e.target.value = value;
            });
        }

        // Modal action buttons
        const modalRemoveFromFavorites = document.getElementById('modal-remove-from-favorites');
        const modalAddToCart = document.getElementById('modal-add-to-cart');

        if (modalRemoveFromFavorites) {
            modalRemoveFromFavorites.addEventListener('click', () => {
                this.showRemoveConfirmation(this.currentModalProduct._id);
            });
        }
        
        if (modalAddToCart) {
            modalAddToCart.addEventListener('click', () => {
                this.addModalToCart();
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
        // Update favorites count
        this.updateFavoritesCount();
        
        // Show/hide action bar
        this.updateActionsBar();
        
        // Render favorites or empty state
        if (this.favoriteProducts.length === 0) {
            this.showEmptyState();
        } else {
            this.showFavoritesGrid();
        }
    }

    updateFavoritesCount() {
        const countElement = document.getElementById('favorites-count');
        const navCountElement = document.getElementById('nav-favorites-count');
        
        const count = this.favorites.length;
        const text = `${count} producto${count !== 1 ? 's' : ''}`;
        
        if (countElement) {
            countElement.textContent = text;
        }
        
        if (navCountElement) {
            navCountElement.textContent = count;
            navCountElement.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    updateActionsBar() {
        const actionsBar = document.getElementById('actions-bar');
        if (actionsBar) {
            actionsBar.style.display = this.favoriteProducts.length > 0 ? 'flex' : 'none';
        }
    }

    showEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const favoritesGrid = document.getElementById('favorites-grid');
        
        if (emptyState) emptyState.style.display = 'block';
        if (favoritesGrid) favoritesGrid.classList.add('hidden');
    }

    showFavoritesGrid() {
        const emptyState = document.getElementById('empty-state');
        const favoritesGrid = document.getElementById('favorites-grid');
        
        if (emptyState) emptyState.style.display = 'none';
        if (favoritesGrid) {
            favoritesGrid.classList.remove('hidden');
            this.renderFavoriteProducts(favoritesGrid);
        }
    }

    renderFavoriteProducts(container) {
        const favoritesHTML = this.favoriteProducts.map(product => 
            this.createFavoriteCard(product)
        ).join('');
        
        container.innerHTML = favoritesHTML;
        
        console.log(`✅ Rendered ${this.favoriteProducts.length} favorite products`);
    }

    createFavoriteCard(product) {
        const isOutOfStock = !product.stock || product.stock <= 0;
        const favoriteData = this.favorites.find(fav => fav.id === product._id);
        
        return `
            <div class="favorite-card ${isOutOfStock ? 'out-of-stock' : ''}" data-product-id="${product._id}">
                <div class="product-image" onclick="favoritesPage.openProductModal('${product._id}')">
                    <img src="${utils.storage.getProductImage(product)}" 
                         alt="${product.name || product.nombre}"
                         onerror="this.src='https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop'">
                    
                    ${isOutOfStock ? '<div class="stock-badge">Agotado</div>' : ''}
                    
                    <button class="remove-favorite-btn" 
                            onclick="event.stopPropagation(); favoritesPage.showRemoveConfirmation('${product._id}')"
                            title="Remover de favoritos">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="product-info" onclick="favoritesPage.openProductModal('${product._id}')">
                    <div class="product-header">
                        <h3 class="product-name">${product.name || product.nombre}</h3>
                        <div class="favorite-date">
                            Agregado ${favoriteData ? utils.storage.formatDate(favoriteData.addedAt) : ''}
                        </div>
                    </div>
                    
                    <p class="product-description">
                        ${this.truncateText(product.description || product.descripcion || 'Sin descripción', 80)}
                    </p>
                    
                    <div class="product-price">
                        ${utils.formatPrice(product.price || product.precio)}
                        ${product.originalPrice && product.originalPrice > product.price ? 
                            `<span class="original-price">${utils.formatPrice(product.originalPrice)}</span>` 
                            : ''
                        }
                    </div>
                    
                    ${product.stock ? `<div class="product-stock">${product.stock} disponibles</div>` : ''}
                </div>
                
                <div class="product-actions">
                    <button class="btn btn-outline btn-small" 
                            onclick="event.stopPropagation(); favoritesPage.showRemoveConfirmation('${product._id}')"
                            title="Remover de favoritos">
                        <i class="fas fa-heart-broken"></i>
                        Remover
                    </button>
                    
                    <button class="btn btn-primary btn-small ${isOutOfStock ? 'disabled' : ''}" 
                            onclick="event.stopPropagation(); favoritesPage.addToCart('${product._id}')"
                            ${isOutOfStock ? 'disabled' : ''}
                            title="${isOutOfStock ? 'Producto agotado' : 'Agregar al carrito'}">
                        <i class="fas fa-${isOutOfStock ? 'times' : 'shopping-cart'}"></i>
                        ${isOutOfStock ? 'Agotado' : 'Agregar'}
                    </button>
                </div>
            </div>
        `;
    }

    // ================================
    // FAVORITES ACTIONS
    // ================================

    showRemoveConfirmation(productId) {
        const product = this.favoriteProducts.find(p => p._id === productId);
        if (!product) return;

        this.productToRemove = productId;
        
        // Populate remove modal with product info
        const productImage = document.getElementById('remove-product-image');
        const productName = document.getElementById('remove-product-name');
        const productPrice = document.getElementById('remove-product-price');
        
        if (productImage) productImage.src = utils.storage.getProductImage(product);
        if (productName) productName.textContent = product.name || product.nombre;
        if (productPrice) productPrice.textContent = utils.formatPrice(product.price || product.precio);
        
        utils.showModal('remove-modal');
    }

    async confirmRemoveFavorite() {
        if (!this.productToRemove) return;

        try {
            const result = utils.storage.removeFromFavorites(this.productToRemove);
            
            if (result.success) {
                utils.notifications.success(result.message);
                await this.reloadFavorites();
            }
            
        } catch (error) {
            console.error('❌ Error removing favorite:', error);
            utils.notifications.error('Error al remover favorito');
        } finally {
            utils.hideModal('remove-modal');
            this.productToRemove = null;
        }
    }

    async confirmClearAll() {
        try {
            const result = utils.storage.saveFavorites([]);
            
            if (result) {
                utils.notifications.success('Todos los favoritos han sido eliminados');
                await this.reloadFavorites();
            }
            
        } catch (error) {
            console.error('❌ Error clearing favorites:', error);
            utils.notifications.error('Error al limpiar favoritos');
        } finally {
            utils.hideModal('clear-all-modal');
        }
    }

    async addToCart(productId) {
        try {
            const product = this.favoriteProducts.find(p => p._id === productId);
            if (!product) return;

            const result = utils.storage.addToCart(product, 1);
            
            if (result.success) {
                utils.notifications.success(result.message);
                this.animateAddToCart(productId);
            } else {
                utils.notifications.warning(result.message);
            }
            
        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            utils.notifications.error('Error al agregar al carrito');
        }
    }

    async addAllToCart() {
        try {
            let successCount = 0;
            let failCount = 0;
            
            const availableProducts = this.favoriteProducts.filter(product => 
                product.stock && product.stock > 0
            );
            
            if (availableProducts.length === 0) {
                utils.notifications.warning('No hay productos con stock disponible');
                return;
            }
            
            for (const product of availableProducts) {
                const result = utils.storage.addToCart(product, 1);
                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            }
            
            if (successCount > 0) {
                utils.notifications.success(`${successCount} producto(s) agregado(s) al carrito`);
            }
            
            if (failCount > 0) {
                utils.notifications.warning(`${failCount} producto(s) no pudieron agregarse`);
            }
            
        } catch (error) {
            console.error('❌ Error adding all to cart:', error);
            utils.notifications.error('Error al agregar productos al carrito');
        }
    }

    // ================================
    // UTILITY METHODS
    // ================================

    async reloadFavorites() {
        try {
            utils.showLoading('#favorites-grid', 'Actualizando favoritos...');
            await this.loadFavoritesData();
            await this.renderPage();
        } catch (error) {
            console.error('❌ Error reloading favorites:', error);
        } finally {
            utils.hideLoading('#favorites-grid');
        }
    }

    animateAddToCart(productId) {
        const card = document.querySelector(`[data-product-id="${productId}"]`);
        const button = card?.querySelector('.btn-primary');
        
        if (button && !button.disabled) {
            button.style.transform = 'scale(0.95)';
            button.style.background = '#10b981';
            
            setTimeout(() => {
                button.style.transform = 'scale(1)';
                button.style.background = '';
            }, 200);
        }
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    showError(message) {
        const container = document.getElementById('favorites-grid');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Error al cargar favoritos</h3>
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

let favoritesPage;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('❤️ DOM loaded, initializing Favorites Page...');
    
    favoritesPage = new FavoritesPage();
    await favoritesPage.initialize();
    
    // Export for debugging
    if (window.location.hostname === 'localhost') {
        window.favoritesPage = favoritesPage;
    }
});

// Export for global access
window.favoritesPage = favoritesPage;

console.log('✅ Favorites Page Script loaded successfully');