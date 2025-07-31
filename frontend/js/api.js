class API {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.token = this.getToken();
    }

    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearToken();
                    throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ========== AUTENTICACIÓN ==========
    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.token) {
            this.setToken(response.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.user));
        }
        
        return response;
    }

    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.token) {
            this.setToken(response.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.user));
        }
        
        return response;
    }

    async logout() {
        this.clearToken();
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        return { success: true };
    }

    // ========== PRODUCTOS ==========
    async getProducts(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        return this.request(endpoint);
    }

    async getProductById(id) {
        return this.request(`/products/${id}`);
    }

    async searchProducts(query) {
        return this.request(`/products/search?q=${encodeURIComponent(query)}`);
    }

    // ========== CATEGORÍAS ==========
    async getCategories() {
        return this.request('/categories');
    }

    async getProductsByCategory(categoryId) {
        return this.request(`/products?category=${categoryId}`);
    }

    // ========== CARRITO ==========
    async getCart() {
        return this.request('/cart');
    }

    async addToCart(productId, quantity = 1) {
        return this.request('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    }

    async updateCartItem(productId, quantity) {
        return this.request('/cart/update', {
            method: 'PUT',
            body: JSON.stringify({ productId, quantity })
        });
    }

    async removeFromCart(productId) {
        return this.request('/cart/remove', {
            method: 'DELETE',
            body: JSON.stringify({ productId })
        });
    }

    async clearCart() {
        return this.request('/cart/clear', {
            method: 'DELETE'
        });
    }

    // ========== PEDIDOS ==========
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getUserOrders() {
        return this.request('/orders');
    }

    // ========== USUARIO ==========
    async getUserProfile() {
        return this.request('/users/profile');
    }

    async updateUserProfile(userData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // ========== SUBIDA DE ARCHIVOS ==========
    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('image', file);

        return this.request('/upload/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });
    }
}