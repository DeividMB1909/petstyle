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
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            ...options.headers
        };

        // Solo agregar Content-Type si no es FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include' // Para cookies
            });

            console.log(`📡 Response Status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                
                if (response.status === 401) {
                    this.clearToken();
                    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                }
                
                let errorMessage = `Error ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('🚨 API Error:', error);
            throw error;
        }
    }

    // ========== AUTENTICACIÓN ==========
    async login(credentials) {
        console.log('🔑 Attempting login...');
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.data.user));
            console.log('✅ Login successful');
        }
        
        return response;
    }

    async register(userData) {
        console.log('📝 Attempting registration...');
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.data.user));
            console.log('✅ Registration successful');
        }
        
        return response;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            this.clearToken();
        }
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

    async createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(id, productData) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }

    // ========== SUBIDA DE ARCHIVOS ==========
    async uploadProductImages(productData, imageFiles) {
        const formData = new FormData();
        
        // Agregar campos del producto
        Object.keys(productData).forEach(key => {
            if (Array.isArray(productData[key])) {
                formData.append(key, JSON.stringify(productData[key]));
            } else {
                formData.append(key, productData[key]);
            }
        });

        // Agregar archivos de imagen
        if (imageFiles && imageFiles.length > 0) {
            for (let file of imageFiles) {
                formData.append('images', file);
            }
        }

        return this.request('/products/with-images', {
            method: 'POST',
            body: formData // No establecer Content-Type para FormData
        });
    }

    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        return this.request('/users/avatar', {
            method: 'PUT',
            body: formData
        });
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

    // ========== CATEGORÍAS ==========
    async getCategories() {
        return this.request('/categories');
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
}