// frontend/js/api-client.js
class APIClient {
    constructor() {
        // Usar CONFIG global si está disponible, sino usar localhost por defecto
        this.baseURL = (typeof CONFIG !== 'undefined') ? CONFIG.API_BASE_URL : 'http://localhost:3000/api';
        this.token = localStorage.getItem(CONFIG?.STORAGE_KEYS?.TOKEN || 'petstyle_auth_token');
        this.timeout = CONFIG?.APP?.TIMEOUT || 10000;
        this.retryAttempts = CONFIG?.APP?.RETRY_ATTEMPTS || 3;
        
        console.log('🚀 APIClient initialized with baseURL:', this.baseURL);
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

    // Método genérico para hacer peticiones con retry y timeout
    async request(endpoint, options = {}) {
        // No agregar /api aquí porque ya está en baseURL
        const url = `${this.baseURL}${endpoint}`;
        let lastError = null;
        
        const config = {
            headers: this.getHeaders(options.auth !== false),
            ...options
        };

        console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);

        // Intentos con retry
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await this.fetchWithTimeout(url, config);
                
                if (!response.ok) {
                    if (response.status === 401) {
                        console.warn('🔐 Token expirado o inválido');
                        this.handleAuthError();
                        return null;
                    }
                    
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log(`✅ API Response: ${config.method || 'GET'} ${url}`);
                return data;

            } catch (error) {
                lastError = error;
                console.error(`❌ API Error (intento ${attempt}/${this.retryAttempts}):`, error.message);
                
                // Si es el último intento, lanzar el error
                if (attempt === this.retryAttempts) {
                    break;
                }
                
                // Esperar antes del siguiente intento (backoff exponencial)
                await this.delay(1000 * attempt);
            }
        }

        throw lastError;
    }

    // Fetch con timeout personalizado
    async fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Timeout: La petición tardó demasiado');
            }
            throw error;
        }
    }

    // Utilidad para delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Manejo de errores de autenticación
    handleAuthError() {
        const tokenKey = CONFIG?.STORAGE_KEYS?.TOKEN || 'petstyle_auth_token';
        const userKey = CONFIG?.STORAGE_KEYS?.USER || 'petstyle_user_data';
        
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        this.token = null;
        
        // Redirigir al login
        if (window.location.pathname !== '/pages/login.html' && 
            window.location.pathname !== '/login.html') {
            window.location.href = '/pages/login.html';
        }
    }

    // =================== MÉTODOS DE AUTENTICACIÓN ===================
    async login(email, password) {
        try {
            const response = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                auth: false
            });
            
            if (response && response.token) {
                this.token = response.token;
                const tokenKey = CONFIG?.STORAGE_KEYS?.TOKEN || 'petstyle_auth_token';
                const userKey = CONFIG?.STORAGE_KEYS?.USER || 'petstyle_user_data';
                
                localStorage.setItem(tokenKey, response.token);
                localStorage.setItem(userKey, JSON.stringify(response.user));
                
                console.log('✅ Login exitoso');
            }
            
            return response;
        } catch (error) {
            console.error('❌ Error en login:', error);
            throw new Error(`Error en login: ${error.message}`);
        }
    }

    async register(userData) {
        try {
            return await this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData),
                auth: false
            });
        } catch (error) {
            console.error('❌ Error en registro:', error);
            throw new Error(`Error en registro: ${error.message}`);
        }
    }

    async logout() {
        try {
            await this.request('/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.warn('⚠️ Error cerrando sesión en el servidor:', error);
        } finally {
            // Limpiar datos locales siempre
            const tokenKey = CONFIG?.STORAGE_KEYS?.TOKEN || 'petstyle_auth_token';
            const userKey = CONFIG?.STORAGE_KEYS?.USER || 'petstyle_user_data';
            const cartKey = CONFIG?.STORAGE_KEYS?.CART || 'petstyle_cart';
            
            localStorage.removeItem(tokenKey);
            localStorage.removeItem(userKey);
            localStorage.removeItem(cartKey);
            this.token = null;
            
            console.log('✅ Sesión cerrada localmente');
        }
    }

    // =================== MÉTODOS PARA PRODUCTOS ===================
    async getProducts(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const endpoint = queryString ? `/products?${queryString}` : '/products';
            
            return await this.request(endpoint, { auth: false });
        } catch (error) {
            console.error('❌ Error obteniendo productos:', error);
            throw error;
        }
    }

    async getProduct(id) {
        try {
            return await this.request(`/products/${id}`, { auth: false });
        } catch (error) {
            console.error(`❌ Error obteniendo producto ${id}:`, error);
            throw error;
        }
    }

    async createProduct(productData) {
        try {
            return await this.request('/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
        } catch (error) {
            console.error('❌ Error creando producto:', error);
            throw error;
        }
    }

    async updateProduct(id, productData) {
        try {
            return await this.request(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
        } catch (error) {
            console.error(`❌ Error actualizando producto ${id}:`, error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            return await this.request(`/products/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error(`❌ Error eliminando producto ${id}:`, error);
            throw error;
        }
    }

    // =================== MÉTODOS PARA CATEGORÍAS ===================
    async getCategories() {
        try {
            return await this.request('/categories', { auth: false });
        } catch (error) {
            console.error('❌ Error obteniendo categorías:', error);
            throw error;
        }
    }

    async createCategory(categoryData) {
        try {
            return await this.request('/categories', {
                method: 'POST',
                body: JSON.stringify(categoryData)
            });
        } catch (error) {
            console.error('❌ Error creando categoría:', error);
            throw error;
        }
    }

    // =================== MÉTODOS PARA EL CARRITO ===================
    async getCart() {
        try {
            return await this.request('/cart');
        } catch (error) {
            console.error('❌ Error obteniendo carrito:', error);
            throw error;
        }
    }

    async addToCart(productId, quantity = 1) {
        try {
            return await this.request('/cart', {
                method: 'POST',
                body: JSON.stringify({ productId, quantity })
            });
        } catch (error) {
            console.error('❌ Error agregando al carrito:', error);
            throw error;
        }
    }

    async updateCartItem(productId, quantity) {
        try {
            return await this.request(`/cart/${productId}`, {
                method: 'PUT',
                body: JSON.stringify({ quantity })
            });
        } catch (error) {
            console.error('❌ Error actualizando item del carrito:', error);
            throw error;
        }
    }

    async removeFromCart(productId) {
        try {
            return await this.request(`/cart/${productId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('❌ Error eliminando del carrito:', error);
            throw error;
        }
    }

    async clearCart() {
        try {
            return await this.request('/cart', {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('❌ Error limpiando carrito:', error);
            throw error;
        }
    }

    // =================== MÉTODOS PARA PERFIL DE USUARIO ===================
    async getProfile() {
        try {
            return await this.request('/users/profile');
        } catch (error) {
            console.error('❌ Error obteniendo perfil:', error);
            throw error;
        }
    }

    async updateProfile(profileData) {
        try {
            return await this.request('/users/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });
        } catch (error) {
            console.error('❌ Error actualizando perfil:', error);
            throw error;
        }
    }

    // =================== MÉTODOS DE UPLOAD ===================
    async uploadImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            return await this.request('/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    // No establecer Content-Type para FormData
                    'Authorization': this.token ? `Bearer ${this.token}` : undefined
                }
            });
        } catch (error) {
            console.error('❌ Error subiendo imagen:', error);
            throw error;
        }
    }

    // =================== UTILIDADES ===================
    async checkHealth() {
        try {
            const healthUrl = this.baseURL.replace('/api', '/health');
            const response = await fetch(healthUrl, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return false;
        }
    }

    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        const userKey = CONFIG?.STORAGE_KEYS?.USER || 'petstyle_user_data';
        const userData = localStorage.getItem(userKey);
        return userData ? JSON.parse(userData) : null;
    }

    // Método para actualizar el token
    updateToken(newToken) {
        this.token = newToken;
        const tokenKey = CONFIG?.STORAGE_KEYS?.TOKEN || 'petstyle_auth_token';
        localStorage.setItem(tokenKey, newToken);
    }
}

// Crear instancia global
const apiClient = new APIClient();

// Para debugging en desarrollo
if (typeof CONFIG !== 'undefined' && CONFIG.getEnvironment() === 'development') {
    window.apiClient = apiClient;
    console.log('🔧 APIClient disponible globalmente para debugging');
}

// Verificar conectividad al cargar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const isHealthy = await apiClient.checkHealth();
        console.log(`💚 Backend health check: ${isHealthy ? 'OK' : 'FAIL'}`);
        
        if (!isHealthy) {
            console.warn('⚠️ No se puede conectar con el backend. Verifica que esté ejecutándose en:', apiClient.baseURL);
        }
    } catch (error) {
        console.error('❌ Error en health check inicial:', error);
    }
});

// Export para uso global
window.apiClient = apiClient;