// ===== MAIN PAGE - INTEGRATED & OPTIMIZED =====
console.log('🏠 Main Page Script Loading...');

class MainPage {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.currentSort = 'newest';
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.currentModalProduct = null;
        
        this.initialized = false;
    }

    // ================================
    // INITIALIZATION
    // ================================

    async initialize() {
        try {
            console.log('🚀 Initializing Main Page...');
            
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load data
            await this.loadInitialData();
            
            // Initial render
            await this.renderPage();
            
            // Update counters
            utils.storage.updateCounters();
            
            this.initialized = true;
            console.log('✅ Main Page initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Main Page:', error);
            this.showError('Error cargando la página');
        }
    }

    async waitForDependencies() {
        // Wait for required systems to be available
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

    async loadInitialData() {
        try {
            utils.showLoading('#products-grid', 'Cargando productos...');
            
            // Load products and categories in parallel
            const [products, categories] = await Promise.all([
                api.getAllProducts(),
                api.getAllCategories()
            ]);
            
            this.products = products || [];
            this.categories = categories || [];
            this.filteredProducts = [...this.products];
            
            console.log(`📦 Loaded ${this.products.length} products and ${this.categories.length} categories`);
            
            // Render categories filter
            this.renderCategoriesFilter();
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.showError('Error cargando productos');
        } finally {
            utils.hideLoading('#products-grid');
        }
    }

    // ================================
    // EVENT LISTENERS SETUP
    // ================================

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const searchTerm = searchInput?.value || '';
                this.handleSearch(searchTerm);
            });
        }

        // Category filters
        this.setupCategoryListeners();

        // Modal events
        this.setupModalEvents();

        // Navigation counters
        this.setupNavigationEvents();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModalProduct) {
                this.closeProductModal();
            }
        });

        console.log('✅ Event listeners configured');
    }

    setupCategoryListeners() {
        // Will be called after categories are rendered
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCategoryFilter(e.target.dataset.category);
                
                // Update active state
                categoryButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    setupModalEvents() {
        // Modal close events
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeProductModal();
                }
            });
        }

        // Modal buttons
        const modalCloseBtn = modal?.querySelector('.modal-close');
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => this.closeProductModal());
        }

        // Quantity controls in modal
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
        const modalAddToFavorites = document.getElementById('modal-add-to-favorites');
        const modalAddToCart = document.getElementById('modal-add-to-cart');

        if (modalAddToFavorites) {
            modalAddToFavorites.addEventListener('click', () => this.toggleModalFavorite());
        }
        
        if (modalAddToCart) {
            modalAddToCart.addEventListener('click', () => this.addModalToCart());
        }
    }

    setupNavigationEvents() {
        // Update counters on page focus (for cross-tab sync)
        window.addEventListener('focus', () => {
            utils.storage.updateCounters();
        });

        // Navigation clicks
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Add loading state for better UX
                const href = item.getAttribute('href');
                if (href && href !== '#') {
                    utils.showLoading('body', 'Navegando...');
                }
            });
        });
    }

    // ================================
    // RENDERING METHODS
    // ================================

    renderCategoriesFilter() {
        const container = document.querySelector('.categories-filter');
        if (!container) return;

        const categoriesHTML = [
            `<button class="category-btn active" data-category="all">Todos</button>`,
            ...this.categories.map(category => `
                <button class="category-btn" data-category="${category._id}">
                    ${category.name || category.nombre}
                </button>
            `)
        ].join('');

        container.innerHTML = categoriesHTML;
        
        // Re-setup category listeners after rendering
        this.setupCategoryListeners();
        
        console.log(`✅ Rendered ${this.categories.length + 1} category filters`);
    }

    async renderPage() {
        // Update results info
        this.updateResultsInfo();
        
        // Render products
        this.renderProducts();
        
        // Render pagination if needed
        this.renderPagination();
    }

    updateResultsInfo() {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            const total = this.filteredProducts.length;
            const categoryName = this.getCurrentCategoryName();
            
            let text = `${total} producto${total !== 1 ? 's' : ''}`;
            if (categoryName !== 'Todos') {
                text += ` en ${categoryName}`;
            }
            if (this.currentSearch) {
                text += ` para "${this.currentSearch}"`;
            }
            
            resultsCount.textContent = text;
        }
    }

    renderProducts() {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        if (this.filteredProducts.length === 0) {
            this.renderEmptyState(grid);
            return;
        }

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

        // Render products
        const productsHTML = productsToShow.map(product => this.createProductCard(product)).join('');
        grid.innerHTML = productsHTML;

        console.log(`✅ Rendered ${productsToShow.length} products (page ${this.currentPage})`);
    }

    renderEmptyState(container) {
        const emptyStateHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No se encontraron productos</h3>
                <p>
                    ${this.currentSearch 
                        ? `No hay resultados para "${this.currentSearch}"` 
                        : 'No hay productos en esta categoría'
                    }
                </p>
                <button class="btn btn-primary" onclick="mainPage.clearFilters()">
                    <i class="fas fa-refresh"></i>
                    Ver todos los productos
                </button>
            </div>
        `;
        
        container.innerHTML = emptyStateHTML;
    }

    createProductCard(product) {
        const isFavorite = utils.storage.isInFavorites(product._id);
        const isOutOfStock = !product.stock || product.stock <= 0;
        
        return `
            <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" data-product-id="${product._id}">
                <div class="product-image" onclick="mainPage.openProductModal('${product._id}')">
                    <img src="${utils.storage.getProductImage(product)}" 
                         alt="${product.name || product.nombre}"
                         onerror="this.src='https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop'">
                    
                    ${isOutOfStock ? '<div class="stock-badge">Agotado</div>' : ''}
                    ${product.discount ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
                    
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="event.stopPropagation(); mainPage.toggleFavorite('${product._id}')"
                            title="${isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos'}">
                        <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                
                <div class="product-info" onclick="mainPage.openProductModal('${product._id}')">
                    <div class="product-category">${this.getCategoryName(product.category)}</div>
                    <h3 class="product-name">${product.name || product.nombre}</h3>
                    <p class="product-description">${this.truncateText(product.description || product.descripcion || '', 60)}</p>
                    
                    <div class="product-footer">
                        <div class="product-price">
                            ${utils.formatPrice(product.price || product.precio)}
                            ${product.originalPrice && product.originalPrice > product.price ? 
                                `<span class="original-price">${utils.formatPrice(product.originalPrice)}</span>` 
                                : ''
                            }
                        </div>
                        
                        <button class="add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}" 
                                onclick="event.stopPropagation(); mainPage.addToCart('${product._id}')"
                                ${isOutOfStock ? 'disabled' : ''}
                                title="${isOutOfStock ? 'Producto agotado' : 'Agregar al carrito'}">
                            <i class="fas fa-${isOutOfStock ? 'times' : 'shopping-cart'}"></i>
                            ${isOutOfStock ? 'Agotado' : 'Agregar'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderPagination() {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.classList.add('hidden');
            return;
        }

        paginationContainer.classList.remove('hidden');
        
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pageInfo = document.getElementById('page-info');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
            prevBtn.onclick = () => this.goToPage(this.currentPage - 1);
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
            nextBtn.onclick = () => this.goToPage(this.currentPage + 1);
        }
        
        if (pageInfo) {
            pageInfo.textContent = `Página ${this.currentPage} de ${totalPages}`;
        }
    }

    // ================================
    // FILTERING & SEARCH
    // ================================

    async handleSearch(searchTerm) {
        this.currentSearch = searchTerm.toLowerCase().trim();
        this.currentPage = 1;
        
        console.log('🔍 Searching for:', this.currentSearch);
        
        this.applyFilters();
        await this.renderPage();
    }

    async handleCategoryFilter(categoryId) {
        console.log('🏷️ Filtering by category:', categoryId);
        
        this.currentCategory = categoryId;
        this.currentPage = 1;
        
        this.applyFilters();
        await this.renderPage();
    }

    applyFilters() {
        let filtered = [...this.products];
        
        // Apply search filter
        if (this.currentSearch) {
            filtered = filtered.filter(product => {
                const searchFields = [
                    product.name || product.nombre || '',
                    product.description || product.descripcion || '',
                    this.getCategoryName(product.category) || ''
                ];
                
                const searchText = searchFields.join(' ').toLowerCase();
                return searchText.includes(this.currentSearch);
            });
        }
        
        // Apply category filter
        if (this.currentCategory && this.currentCategory !== 'all') {
            filtered = filtered.filter(product => 
                product.category === this.currentCategory || product.categoria === this.currentCategory
            );
        }
        
        // Apply sorting
        this.sortProducts(filtered);
        
        this.filteredProducts = filtered;
        
        console.log(`📊 Filtered: ${filtered.length}/${this.products.length} products`);
    }

    sortProducts(products) {
        products.sort((a, b) => {
            switch (this.currentSort) {
                case 'price-low':
                    return (a.price || 0) - (b.price || 0);
                case 'price-high':
                    return (b.price || 0) - (a.price || 0);
                case 'name':
                    return (a.name || a.nombre || '').localeCompare(b.name || b.nombre || '');
                case 'newest':
                default:
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
        });
    }

    clearFilters() {
        this.currentSearch = '';
        this.currentCategory = 'all';
        this.currentPage = 1;
        
        // Reset UI
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'all');
        });
        
        this.applyFilters();
        this.renderPage();
    }

    // ================================
    // PRODUCT MODAL
    // ================================

    async openProductModal(productId) {
        try {
            const product = this.products.find(p => p._id === productId);
            if (!product) {
                utils.notifications.error('Producto no encontrado');
                return;
            }

            this.currentModalProduct = product;
            this.populateModal(product);
            utils.showModal('product-modal');
            
            console.log('👁️ Opened product modal:', product.name);
            
        } catch (error) {
            console.error('❌ Error opening modal:', error);
            utils.notifications.error('Error al cargar el producto');
        }
    }

    populateModal(product) {
        const elements = {
            'modal-product-image': { attr: 'src', value: utils.storage.getProductImage(product) },
            'modal-product-name': { text: product.name || product.nombre },
            'modal-product-price': { text: utils.formatPrice(product.price || product.precio) },
            'modal-product-description': { text: product.description || product.descripcion || 'Sin descripción' },
            'modal-product-stock': { text: product.stock || 0 }
        };

        Object.entries(elements).forEach(([id, config]) => {
            const element = document.getElementById(id);
            if (element) {
                if (config.attr) {
                    element.setAttribute(config.attr, config.value);
                } else if (config.text !== undefined) {
                    element.textContent = config.text;
                }
            }
        });

        // Update quantity input
        const quantityInput = document.getElementById('quantity-input');
        if (quantityInput) {
            quantityInput.value = 1;
            quantityInput.max = product.stock || 1;
        }

        // Update favorite button
        this.updateModalFavoriteButton(product._id);

        // Update add to cart button state
        const addToCartBtn = document.getElementById('modal-add-to-cart');
        if (addToCartBtn) {
            const isOutOfStock = !product.stock || product.stock <= 0;
            addToCartBtn.disabled = isOutOfStock;
            addToCartBtn.innerHTML = isOutOfStock 
                ? '<i class="fas fa-times"></i> Sin stock'
                : '<i class="fas fa-shopping-cart"></i> Agregar al Carrito';
        }
    }

    updateModalFavoriteButton(productId) {
        const favoriteBtn = document.getElementById('modal-add-to-favorites');
        if (favoriteBtn) {
            const isFavorite = utils.storage.isInFavorites(productId);
            favoriteBtn.className = `btn btn-outline ${isFavorite ? 'active' : ''}`;
            favoriteBtn.innerHTML = isFavorite 
                ? '<i class="fas fa-heart"></i> En favoritos'
                : '<i class="far fa-heart"></i> Favoritos';
        }
    }

    closeProductModal() {
        utils.hideModal('product-modal');
        this.currentModalProduct = null;
    }

    updateModalQuantity(change) {
        const quantityInput = document.getElementById('quantity-input');
        if (!quantityInput || !this.currentModalProduct) return;

        const currentQuantity = parseInt(quantityInput.value) || 1;
        const newQuantity = Math.max(1, Math.min(this.currentModalProduct.stock || 1, currentQuantity + change));
        
        quantityInput.value = newQuantity;
    }

    // ================================
    // FAVORITES & CART ACTIONS
    // ================================

    async toggleFavorite(productId) {
        try {
            const product = this.products.find(p => p._id === productId);
            if (!product) return;

            const result = utils.storage.toggleFavorite(product);
            
            if (result.success) {
                utils.notifications.success(result.message);
                this.updateProductCardFavorite(productId);
                
                // Update modal if it's open for this product
                if (this.currentModalProduct && this.currentModalProduct._id === productId) {
                    this.updateModalFavoriteButton(productId);
                }
            }
            
        } catch (error) {
            console.error('❌ Error toggling favorite:', error);
            utils.notifications.error('Error al actualizar favoritos');
        }
    }

    async toggleModalFavorite() {
        if (this.currentModalProduct) {
            await this.toggleFavorite(this.currentModalProduct._id);
        }
    }

    async addToCart(productId) {
        try {
            const product = this.products.find(p => p._id === productId);
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

    async addModalToCart() {
        if (!this.currentModalProduct) return;

        try {
            const quantityInput = document.getElementById('quantity-input');
            const quantity = parseInt(quantityInput?.value) || 1;

            const result = utils.storage.addToCart(this.currentModalProduct, quantity);
            
            if (result.success) {
                utils.notifications.success(`${quantity} producto(s) agregado(s) al carrito`);
                this.closeProductModal();
            } else {
                utils.notifications.warning(result.message);
            }
            
        } catch (error) {
            console.error('❌ Error adding to cart from modal:', error);
            utils.notifications.error('Error al agregar al carrito');
        }
    }

    // ================================
    // UI HELPERS
    // ================================

    updateProductCardFavorite(productId) {
        const card = document.querySelector(`[data-product-id="${productId}"]`);
        if (!card) return;

        const favoriteBtn = card.querySelector('.favorite-btn');
        const icon = favoriteBtn?.querySelector('i');
        
        if (icon) {
            const isFavorite = utils.storage.isInFavorites(productId);
            icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
            favoriteBtn.classList.toggle('active', isFavorite);
            favoriteBtn.title = isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos';
        }
    }

    animateAddToCart(productId) {
        const card = document.querySelector(`[data-product-id="${productId}"]`);
        const button = card?.querySelector('.add-to-cart-btn');
        
        if (button) {
            button.style.transform = 'scale(0.95)';
            button.style.background = '#10b981';
            
            setTimeout(() => {
                button.style.transform = 'scale(1)';
                button.style.background = '';
            }, 200);
        }
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderPage();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showError(message) {
        const grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Error al cargar</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Recargar página
                    </button>
                </div>
            `;
        }
    }

    // ================================
    // UTILITY METHODS
    // ================================

    getCurrentCategoryName() {
        if (this.currentCategory === 'all') return 'Todos';
        
        const category = this.categories.find(cat => cat._id === this.currentCategory);
        return category ? (category.name || category.nombre) : 'Categoría';
    }

    getCategoryName(categoryId) {
        if (!categoryId) return 'Sin categoría';
        
        const category = this.categories.find(cat => cat._id === categoryId);
        return category ? (category.name || category.nombre) : 'Categoría';
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }
}

// ================================
// INITIALIZATION & GLOBAL EXPORT
// ================================

let mainPage;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏠 DOM loaded, initializing Main Page...');
    
    mainPage = new MainPage();
    await mainPage.initialize();
    
    // Export for debugging
    if (window.location.hostname === 'localhost') {
        window.mainPage = mainPage;
    }
});

// Export for global access
window.mainPage = mainPage;

console.log('✅ Main Page Script loaded successfully');