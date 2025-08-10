// Main App JavaScript - PetStyle
class PetStyleApp {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.categories = [];
        this.filteredProducts = [];
        this.currentCategory = 'all';
        this.currentSort = 'newest';
        this.searchTerm = '';
        this.currentPage = 1;
        this.productsPerPage = 10;
        this.selectedProduct = null;
        this.selectedQuantity = 1;
        
        this.init();
    }

    async init() {
        try {
            await this.showLoading();
            await this.checkAuthStatus();
            await this.loadCategories();
            await this.loadProducts();
            await this.setupEventListeners();
            await this.updateUI();
            
            setTimeout(() => {
                this.hideLoading();
            }, 1000);
        } catch (error) {
            console.error('Error initializing app:', error);
            this.hideLoading();
            this.showToast('Error al cargar la aplicación', 'error');
        }
    }

    // Loading Management
    showLoading() {
        document.getElementById('loading-screen').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }

    // Authentication
    async checkAuthStatus() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.currentUser = null;
                return;
            }

            const response = await API.verifyToken();
            if (response.success) {
                this.currentUser = response.data.user;
                await this.loadUserData();
            } else {
                localStorage.removeItem('token');
                this.currentUser = null;
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            localStorage.removeItem('token');
            this.currentUser = null;
        }
    }

    async loadUserData() {
        if (!this.currentUser) return;

        try {
            // Load user favorites and cart
            await Favorites.loadFavorites();
            await Cart.loadCart();
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    // Categories
    async loadCategories() {
        try {
            const response = await API.getCategories();
            if (response.success) {
                this.categories = response.data;
                this.renderCategories();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    renderCategories() {
        const container = document.getElementById('categories-container');
        const allCategory = container.querySelector('[data-category="all"]');
        
        // Clear existing categories except "all"
        const existingCategories = container.querySelectorAll('[data-category]:not([data-category="all"])');
        existingCategories.forEach(cat => cat.remove());

        this.categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';
            categoryElement.setAttribute('data-category', category._id);
            categoryElement.innerHTML = `
                <div class="category-icon">${this.getCategoryIcon(category.name)}</div>
                <div class="category-name">${category.name}</div>
            `;
            
            categoryElement.addEventListener('click', () => this.filterByCategory(category._id));
            container.appendChild(categoryElement);
        });
    }

    getCategoryIcon(categoryName) {
        const icons = {
            'Perros': '🐕',
            'Gatos': '🐱',
            'Aves': '🐦',
            'Peces': '🐠',
            'Accesorios': '🎾',
            'Collares': '🦴',
            'Juguetes': '🧸',
            'Camas': '🛏️',
            'Alimentación': '🍖',
            'Cuidado': '🧴'
        };
        return icons[categoryName] || '🐾';
    }

    // Products
    async loadProducts() {
        try {
            const response = await API.getProducts({
                page: 1,
                limit: 50,
                sortBy: this.currentSort
            });
            
            if (response.success) {
                this.products = response.data;
                this.filteredProducts = [...this.products];
                this.renderProducts();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showToast('Error al cargar productos', 'error');
        }
    }

    renderProducts() {
        this.renderFeaturedProducts();
        this.renderAllProducts();
        this.updateNoProductsDisplay();
    }

    renderFeaturedProducts() {
        const container = document.getElementById('featured-products');
        const featuredProducts = this.filteredProducts.filter(product => product.featured).slice(0, 4);
        
        if (featuredProducts.length === 0) {
            document.getElementById('featured-section').classList.add('hidden');
            return;
        }
        
        document.getElementById('featured-section').classList.remove('hidden');
        container.innerHTML = featuredProducts.map(product => this.createProductCard(product)).join('');
    }

    renderAllProducts() {
        const container = document.getElementById('all-products');
        const productsToShow = this.filteredProducts.slice(0, this.currentPage * this.productsPerPage);
        
        container.innerHTML = productsToShow.map(product => this.createProductCard(product)).join('');
        this.updateLoadMoreButton();
    }

    createProductCard(product) {
        const isFavorite = Favorites.isFavorite(product._id);
        const mainImage = product.images && product.images.length > 0 
            ? product.images.find(img => img.isPrimary)?.url || product.images[0].url
            : 'https://via.placeholder.com/200/8B5FBF/ffffff?text=🐾';

        const stockClass = product.stock === 0 ? 'stock-out' : 
                          product.stock <= product.minStock ? 'stock-low' : '';

        return `
            <div class="product-card" onclick="openProductModal('${product._id}')">
                <div class="product-image">
                    <img src="${mainImage}" alt="${product.name}" loading="lazy">
                    <div class="product-actions">
                        <button class="action-btn favorite-btn ${isFavorite ? 'active' : ''}" 
                                onclick="event.stopPropagation(); toggleFavorite('${product._id}')">
                            <span class="heart">${isFavorite ? '❤️' : '♡'}</span>
                        </button>
                        <button class="action-btn cart-btn" 
                                onclick="event.stopPropagation(); quickAddToCart('${product._id}')">
                            <span>🛒</span>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-brand">${product.brand || 'PetStyle'}</div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-stock ${stockClass}">
                        ${product.stock === 0 ? 'Agotado' : 
                          product.stock <= product.minStock ? `Quedan ${product.stock}` : 
                          `${product.stock} disponibles`}
                    </div>
                </div>
            </div>
        `;
    }

    updateLoadMoreButton() {
        const container = document.getElementById('load-more-container');
        const button = document.getElementById('load-more-btn');
        
        const totalShown = this.currentPage * this.productsPerPage;
        const hasMore = totalShown < this.filteredProducts.length;
        
        if (hasMore) {
            container.classList.remove('hidden');
            button.textContent = `Cargar más (${this.filteredProducts.length - totalShown} restantes)`;
        } else {
            container.classList.add('hidden');
        }
    }

    updateNoProductsDisplay() {
        const noProducts = document.getElementById('no-products');
        const productsSection = document.querySelector('.products-section');
        
        if (this.filteredProducts.length === 0) {
            noProducts.classList.remove('hidden');
            productsSection.style.display = 'none';
        } else {
            noProducts.classList.add('hidden');
            productsSection.style.display = 'block';
        }
    }

    // Filtering and Sorting
    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.currentPage = 1;
        
        // Update active category UI
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-category="${categoryId}"]`).classList.add('active');
        
        this.applyFilters();
        this.updateProductsTitle();
    }

    applyFilters() {
        let filtered = [...this.products];
        
        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(product => 
                product.category === this.currentCategory ||
                product.subcategory === this.currentCategory
            );
        }
        
        // Filter by search term
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchLower) ||
                product.description.toLowerCase().includes(searchLower) ||
                (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
                (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
        }
        
        // Sort products
        this.sortProducts(filtered);
        
        this.filteredProducts = filtered;
        this.renderProducts();
    }

    sortProducts(products = this.filteredProducts) {
        switch (this.currentSort) {
            case 'price-asc':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                products.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
            default:
                products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }
    }

    updateProductsTitle() {
        const title = document.getElementById('products-title');
        const category = this.categories.find(cat => cat._id === this.currentCategory);
        
        if (this.currentCategory === 'all') {
            title.textContent = 'Todos los Productos';
        } else if (category) {
            title.textContent = `Productos de ${category.name}`;
        }
        
        if (this.searchTerm) {
            title.textContent = `Resultados para "${this.searchTerm}"`;
        }
    }

    // Product Modal
    openProductModal(productId) {
        const product = this.products.find(p => p._id === productId);
        if (!product) return;
        
        this.selectedProduct = product;
        this.selectedQuantity = 1;
        
        this.renderProductModal(product);
        document.getElementById('product-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    renderProductModal(product) {
        const modal = document.getElementById('product-modal');
        const isFavorite = Favorites.isFavorite(product._id);
        
        // Update favorite button
        const favoriteBtn = document.getElementById('product-favorite-btn');
        favoriteBtn.querySelector('.heart').textContent = isFavorite ? '❤️' : '♡';
        favoriteBtn.classList.toggle('active', isFavorite);
        
        // Update product images
        this.renderProductImages(product);
        
        // Update product info
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-brand').textContent = product.brand || 'PetStyle';
        document.getElementById('product-price').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('product-stock').textContent = product.stock;
        document.getElementById('product-description').textContent = product.description;
        
        // Handle discount
        const originalPriceEl = document.getElementById('product-original-price');
        const discountEl = document.getElementById('product-discount');
        
        if (product.discount && product.originalPrice) {
            originalPriceEl.textContent = `$${product.originalPrice.toFixed(2)}`;
            originalPriceEl.classList.remove('hidden');
            discountEl.textContent = `-${product.discount}%`;
            discountEl.classList.remove('hidden');
        } else {
            originalPriceEl.classList.add('hidden');
            discountEl.classList.add('hidden');
        }
        
        // Update specifications
        this.renderProductSpecs(product);
        
        // Update quantity controls
        this.updateQuantityControls(product);
        this.updateTotalPrice();
    }

    renderProductImages(product) {
        const mainImage = document.getElementById('main-image-img');
        const thumbnails = document.getElementById('image-thumbnails');
        
        if (product.images && product.images.length > 0) {
            const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
            mainImage.src = primaryImage.url;
            mainImage.alt = primaryImage.alt || product.name;
            
            if (product.images.length > 1) {
                thumbnails.innerHTML = product.images.map((image, index) => `
                    <div class="thumbnail ${index === 0 ? 'active' : ''}" 
                         onclick="switchProductImage('${image.url}', ${index})">
                        <img src="${image.url}" alt="${image.alt || product.name}">
                    </div>
                `).join('');
            } else {
                thumbnails.innerHTML = '';
            }
        } else {
            mainImage.src = 'https://via.placeholder.com/300/8B5FBF/ffffff?text=🐾';
            thumbnails.innerHTML = '';
        }
    }

    renderProductSpecs(product) {
        const specsContainer = document.getElementById('product-specs');
        const specsList = document.getElementById('specs-list');
        
        if (product.specifications && product.specifications.length > 0) {
            specsList.innerHTML = product.specifications.map(spec => `
                <div class="spec-item">
                    <span class="spec-label">${spec.name}</span>
                    <span class="spec-value">${spec.value}</span>
                </div>
            `).join('');
            specsContainer.classList.remove('hidden');
        } else {
            specsContainer.classList.add('hidden');
        }
    }

    updateQuantityControls(product) {
        const quantityValue = document.getElementById('quantity-value');
        const maxQuantity = document.getElementById('max-quantity');
        const decreaseBtn = document.querySelector('.quantity-btn:first-child');
        const increaseBtn = document.querySelector('.quantity-btn:last-child');
        
        quantityValue.textContent = this.selectedQuantity;
        maxQuantity.textContent = `Máximo: ${product.stock}`;
        
        decreaseBtn.disabled = this.selectedQuantity <= 1;
        increaseBtn.disabled = this.selectedQuantity >= product.stock;
        
        const addToCartBtn = document.getElementById('add-to-cart-modal-btn');
        addToCartBtn.disabled = product.stock === 0;
        
        if (product.stock === 0) {
            addToCartBtn.textContent = 'Producto Agotado';
            addToCartBtn.classList.add('disabled');
        } else {
            addToCartBtn.classList.remove('disabled');
        }
    }

    updateTotalPrice() {
        if (!this.selectedProduct) return;
        
        const totalPrice = this.selectedProduct.price * this.selectedQuantity;
        document.getElementById('total-price').textContent = totalPrice.toFixed(2);
    }

    // Event Handlers
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('search-input');
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchTerm = e.target.value.trim();
                this.currentPage = 1;
                this.applyFilters();
            }, 300);
        });
        
        // Sort
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.applyFilters();
        });
        
        // Close modals on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
        
        // Close user dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-status')) {
                document.getElementById('user-dropdown').classList.add('hidden');
            }
        });
    }

    // UI Updates
    updateUI() {
        this.updateUserStatus();
        this.updateNavigationBadges();
    }

    updateUserStatus() {
        const loginBtn = document.getElementById('login-btn');
        const userMenuTrigger = document.getElementById('user-menu-trigger');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (this.currentUser) {
            loginBtn.classList.add('hidden');
            userMenuTrigger.classList.remove('hidden');
            
            const userName = document.getElementById('header-user-name');
            userName.textContent = this.currentUser.name.split(' ')[0];
            
            // Show admin menu if user is admin
            if (this.currentUser.role === 'admin') {
                document.body.classList.add('user-admin');
            }
        } else {
            loginBtn.classList.remove('hidden');
            userMenuTrigger.classList.add('hidden');
            userDropdown.classList.add('hidden');
            document.body.classList.remove('user-admin');
        }
    }

    updateNavigationBadges() {
        const favoritesCount = document.getElementById('favorites-count');
        const cartCount = document.getElementById('cart-count');
        
        if (this.currentUser) {
            const favCount = Favorites.getCount();
            const cartItemCount = Cart.getItemCount();
            
            if (favCount > 0) {
                favoritesCount.textContent = favCount;
                favoritesCount.classList.remove('hidden');
            } else {
                favoritesCount.classList.add('hidden');
            }
            
            if (cartItemCount > 0) {
                cartCount.textContent = cartItemCount;
                cartCount.classList.remove('hidden');
            } else {
                cartCount.classList.add('hidden');
            }
        } else {
            favoritesCount.classList.add('hidden');
            cartCount.classList.add('hidden');
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        document.body.style.overflow = '';
    }

    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }
}

// Global Functions for HTML onclick events
let app;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new PetStyleApp();
});

// Navigation Functions
function setActiveTab(tab) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    switch (tab) {
        case 'home':
            document.querySelector('.nav-item').classList.add('active');
            break;
        case 'favorites':
            goToFavorites();
            break;
        case 'cart':
            goToCart();
            break;
        case 'profile':
            goToProfile();
            break;
    }
}

function goToLogin() {
    window.location.href = 'login.html';
}

function goToRegister() {
    window.location.href = 'register.html';
}

function goToProfile() {
    window.location.href = 'profile.html';
}

function goToFavorites() {
    if (!app.currentUser) {
        showLoginRequiredModal();
        return;
    }
    window.location.href = 'favorites.html';
}

function goToCart() {
    if (!app.currentUser) {
        showLoginRequiredModal();
        return;
    }
    window.location.href = 'cart.html';
}

function goToAdmin() {
    if (app.currentUser && app.currentUser.role === 'admin') {
        window.location.href = 'admin.html';
    }
}

// User Menu Functions
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('hidden');
}

async function logout() {
    try {
        await Auth.logout();
        app.currentUser = null;
        localStorage.removeItem('token');
        app.updateUI();
        app.showToast('Sesión cerrada exitosamente', 'success');
        
        // Reload page to reset state
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error('Error logging out:', error);
        app.showToast('Error al cerrar sesión', 'error');
    }
}

// Login Required Modal
function showLoginRequiredModal() {
    document.getElementById('login-required-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeLoginRequiredModal() {
    document.getElementById('login-required-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

// Product Functions
function openProductModal(productId) {
    app.openProductModal(productId);
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.body.style.overflow = '';
    app.selectedProduct = null;
    app.selectedQuantity = 1;
}

function switchProductImage(imageUrl, index) {
    document.getElementById('main-image-img').src = imageUrl;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

function increaseQuantity() {
    if (!app.selectedProduct) return;
    
    if (app.selectedQuantity < app.selectedProduct.stock) {
        app.selectedQuantity++;
        app.updateQuantityControls(app.selectedProduct);
        app.updateTotalPrice();
    }
}

function decreaseQuantity() {
    if (app.selectedQuantity > 1) {
        app.selectedQuantity--;
        app.updateQuantityControls(app.selectedProduct);
        app.updateTotalPrice();
    }
}

// Product Actions
async function toggleFavorite(productId) {
    if (!app.currentUser) {
        showLoginRequiredModal();
        return;
    }
    
    try {
        const isFavorite = Favorites.isFavorite(productId);
        
        if (isFavorite) {
            await Favorites.removeFavorite(productId);
            app.showToast('Removido de favoritos', 'info');
        } else {
            await Favorites.addFavorite(productId);
            app.showToast('Agregado a favoritos', 'success');
        }
        
        // Update UI
        app.updateNavigationBadges();
        
        // Update favorite buttons in product cards
        document.querySelectorAll(`[onclick*="${productId}"]`).forEach(btn => {
            if (btn.classList.contains('favorite-btn')) {
                const heart = btn.querySelector('.heart');
                const isNowFavorite = Favorites.isFavorite(productId);
                heart.textContent = isNowFavorite ? '❤️' : '♡';
                btn.classList.toggle('active', isNowFavorite);
            }
        });
        
        // Update modal if open
        if (app.selectedProduct && app.selectedProduct._id === productId) {
            const modalFavoriteBtn = document.getElementById('product-favorite-btn');
            const heart = modalFavoriteBtn.querySelector('.heart');
            const isNowFavorite = Favorites.isFavorite(productId);
            heart.textContent = isNowFavorite ? '❤️' : '♡';
            modalFavoriteBtn.classList.toggle('active', isNowFavorite);
        }
        
    } catch (error) {
        console.error('Error toggling favorite:', error);
        app.showToast('Error al actualizar favoritos', 'error');
    }
}

async function toggleProductFavorite() {
    if (!app.selectedProduct) return;
    await toggleFavorite(app.selectedProduct._id);
}

async function quickAddToCart(productId) {
    if (!app.currentUser) {
        showLoginRequiredModal();
        return;
    }
    
    const product = app.products.find(p => p._id === productId);
    if (!product) return;
    
    if (product.stock === 0) {
        app.showToast('Producto agotado', 'warning');
        return;
    }
    
    try {
        await Cart.addItem(productId, 1);
        app.showToast(`${product.name} agregado al carrito`, 'success');
        app.updateNavigationBadges();
    } catch (error) {
        console.error('Error adding to cart:', error);
        app.showToast('Error al agregar al carrito', 'error');
    }
}

async function addToCartFromModal() {
    if (!app.selectedProduct || !app.currentUser) {
        showLoginRequiredModal();
        return;
    }
    
    if (app.selectedProduct.stock === 0) {
        app.showToast('Producto agotado', 'warning');
        return;
    }
    
    try {
        await Cart.addItem(app.selectedProduct._id, app.selectedQuantity);
        app.showToast(`${app.selectedProduct.name} agregado al carrito`, 'success');
        app.updateNavigationBadges();
        closeProductModal();
    } catch (error) {
        console.error('Error adding to cart:', error);
        app.showToast('Error al agregar al carrito', 'error');
    }
}

// Filtering and Sorting
function sortProducts() {
    const sortSelect = document.getElementById('sort-select');
    app.currentSort = sortSelect.value;
    app.applyFilters();
}

function loadMoreProducts() {
    app.currentPage++;
    app.renderAllProducts();
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    app.searchTerm = '';
    app.currentCategory = 'all';
    app.currentPage = 1;
    
    // Reset active category
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('[data-category="all"]').classList.add('active');
    
    app.applyFilters();
}

// Utility Functions
function formatPrice(price) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(price);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function debounce(func, wait) {
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

// Error Handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (app) {
        app.showToast('Ha ocurrido un error inesperado', 'error');
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    if (app) {
        app.showToast('Conexión restablecida', 'success');
    }
});

window.addEventListener('offline', () => {
    if (app) {
        app.showToast('Sin conexión a internet', 'warning');
    }
});

// Export app instance for debugging
window.PetStyleApp = app;