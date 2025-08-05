class PetStyleApp {
    constructor() {
        this.currentPage = 'home';
        this.api = new API();
        this.auth = new AuthManager(this.api);
        this.cart = new CartManager(this.api);
        this.favorites = [];
        this.products = [];
        this.categories = [];
        
        this.init();
    }

    init() {
        this.loadFavorites();
        this.bindEvents();
        this.updateUI();
    }

    loadFavorites() {
        const favData = localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES);
        if (favData) {
            this.favorites = JSON.parse(favData);
        }
    }

    saveFavorites() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(this.favorites));
    }

    bindEvents() {
        // Navegación
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-page]')) {
                const page = e.target.getAttribute('data-page');
                this.navigateTo(page);
            }
        });

        // Búsqueda
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', 
                Utils.debounce((e) => this.handleSearch(e.target.value), 500)
            );
        }
    }

    updateUI() {
        this.cart.updateCartUI();
        this.updateAuthUI();
    }

    updateAuthUI() {
        const userElements = document.querySelectorAll('.user-name');
        const authButtons = document.querySelectorAll('.auth-required');
        
        if (this.auth.isAuthenticated()) {
            const user = this.auth.getCurrentUser();
            userElements.forEach(el => el.textContent = user.name);
            authButtons.forEach(el => el.style.display = 'block');
        } else {
            authButtons.forEach(el => el.style.display = 'none');
        }
    }

    async handleSearch(query) {
        if (query.length < 2) return;
        
        try {
            const results = await this.api.searchProducts(query);
            this.renderProducts(results);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    async loadHomeData() {
        try {
            Utils.showLoading(document.getElementById('productsGrid'));
            
            const [products, categories] = await Promise.all([
                this.api.getProducts(),
                this.api.getCategories()
            ]);
            
            this.products = products;
            this.categories = categories;
            
            this.renderFeaturedProducts();
            this.renderProducts(products);
            this.renderCategories(categories);
        } catch (error) {
            console.error('Error loading home data:', error);
            Utils.showToast('Error al cargar productos', 'error');
        }
    }

    renderFeaturedProducts() {
        const featured = this.products.slice(0, 6); // Primeros 6 productos
        const grid = document.getElementById('featuredProducts');
        if (!grid) return;
        
        grid.innerHTML = featured.map(product => this.createProductCard(product, true)).join('');
    }

    renderProducts(products) {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        
        grid.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product, isFeatured = false) {
        const isFavorite = this.favorites.includes(product._id);
        const cardClass = isFeatured ? 'product-card featured' : 'product-card';
        
        return `
            <div class="${cardClass}" data-id="${product._id}">
                <div class="product-image">
                    <img src="${product.images[0] || 'assets/images/placeholder.jpg'}" 
                         alt="${product.name}"
                         onerror="this.src='assets/images/placeholder.jpg'">
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="app.toggleFavorite('${product._id}')">
                        ❤️
                    </button>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${Utils.truncateText(product.name, 30)}</h3>
                    <p class="product-price">${Utils.formatPrice(product.price)}</p>
                    <button class="btn-add-cart" onclick="app.addToCart('${product._id}')">
                        Agregar
                    </button>
                </div>
            </div>
        `;
    }

    async addToCart(productId) {
        const product = this.products.find(p => p._id === productId);
        if (product) {
            this.cart.addItem(product);
        }
    }

    toggleFavorite(productId) {
        const index = this.favorites.indexOf(productId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            Utils.showToast('Eliminado de favoritos', 'info');
        } else {
            this.favorites.push(productId);
            Utils.showToast('Agregado a favoritos', 'success');
        }
        
        this.saveFavorites();
        this.updateFavoriteButtons();
    }

    updateFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const productId = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
            btn.classList.toggle('active', this.favorites.includes(productId));
        });
    }
}

// Inicializar app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PetStyleApp();
});

// Función global para navegación
function navigateToHome() {
    window.location.href = 'pages/main.html';
}