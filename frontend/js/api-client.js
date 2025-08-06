class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.token = localStorage.getItem('authToken');
    }

    // Configurar headers por defecto
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Método genérico para hacer peticiones
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(options.auth !== false),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expirado, redirigir al login
                    this.handleAuthError();
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Manejo de errores de autenticación
    handleAuthError() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/pages/login.html';
    }

    // Métodos de autenticación
    async login(email, password) {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            auth: false
        });
        
        if (response && response.token) {
            this.token = response.token;
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
        }
        
        return response;
    }

    async register(userData) {
        return await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            auth: false
        });
    }

    async logout() {
        await this.request('/api/auth/logout', {
            method: 'POST'
        });
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        this.token = null;
    }

    // Métodos para productos
    async getProducts(page = 1, limit = 12) {
        return await this.request(`/api/products?page=${page}&limit=${limit}`, {
            auth: false
        });
    }

    async getProduct(id) {
        return await this.request(`/api/products/${id}`, {
            auth: false
        });
    }

    async createProduct(productData) {
        return await this.request('/api/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    // Métodos para el carrito
    async getCart() {
        return await this.request('/api/cart');
    }

    async addToCart(productId, quantity = 1) {
        return await this.request('/api/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    }

    async updateCartItem(itemId, quantity) {
        return await this.request(`/api/cart/update/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    }

    async removeFromCart(itemId) {
        return await this.request(`/api/cart/remove/${itemId}`, {
            method: 'DELETE'
        });
    }

    // Métodos para perfil de usuario
    async getProfile() {
        return await this.request('/api/auth/profile');
    }

    async updateProfile(profileData) {
        return await this.request('/api/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }
}

// Instancia global del cliente
const apiClient = new APIClient();