// ===== PETSTYLE API SYSTEM - INTEGRATED & SIMPLIFIED =====
console.log('🔌 PetStyle API System Loading...');

class PetStyleAPI {
    constructor() {
        // ✅ CAMBIAR ESTA URL POR LA QUE TE DA PAGEKITE
        this.baseURL = 'https://petstyle.pagekite.me/';
        
        this.endpoints = {
            products: '/api/productos',     // ✅ En español para coincidir con backend
            categories: '/api/categorias',  // ✅ En español para coincidir con backend
            users: '/api/usuarios',
            auth: '/api/auth'
        };
        this.initialized = false;
        
        // Debug info
        console.log('📍 API Base URL:', this.baseURL);
    }

    // ================================
    // INITIALIZATION & HELPERS
    // ================================
    
    async initialize() {
        if (this.initialized) return true;
        
        try {
            console.log('🚀 Initializing API connection...');
            
            // Test connection first
            const connectionTest = await this.testConnection();
            if (!connectionTest) {
                console.warn('⚠️ Backend connection failed, will try with each request');
            }
            
            await this.detectEndpoints();
            this.initialized = true;
            console.log('✅ API System initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ API initialization failed:', error);
            return false;
        }
    }

    async detectEndpoints() {
        // Test common endpoint variations
        const testRoutes = [
            { key: 'products', routes: ['/api/productos', '/api/products', '/productos'] },
            { key: 'categories', routes: ['/api/categorias', '/api/categories', '/categorias'] },
            { key: 'users', routes: ['/api/usuarios', '/api/users', '/usuarios'] }
        ];

        for (const { key, routes } of testRoutes) {
            for (const route of routes) {
                try {
                    console.log(`🔍 Testing ${key} endpoint: ${route}`);
                    const response = await this.makeRequest('GET', route);
                    if (response.ok) {
                        this.endpoints[key] = route;
                        console.log(`✅ Found ${key} endpoint: ${route}`);
                        break;
                    }
                } catch (error) {
                    console.log(`❌ ${route} not available:`, error.message);
                    // Continue testing other routes
                }
            }
        }
    }

    async makeRequest(method, endpoint, data = null, requireAuth = false) {
        const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // Add auth token if required or available
        if (requireAuth || localStorage.getItem('petstyle_token')) {
            const token = localStorage.getItem('petstyle_token');
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }
        }

        // Add body for POST/PUT requests
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        console.log(`📡 ${method} ${url}`);
        
        try {
            const response = await fetch(url, options);
            
            // Handle different response types
            let responseData;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            if (!response.ok) {
                console.error(`❌ HTTP ${response.status}:`, responseData);
                throw new Error(responseData.message || responseData.error || `HTTP ${response.status}: ${responseData}`);
            }

            console.log(`✅ ${method} ${endpoint} successful`);
            return { ok: true, data: responseData, status: response.status };
            
        } catch (error) {
            console.error(`❌ API Error (${method} ${endpoint}):`, error.message);
            throw error;
        }
    }

    // ================================
    // PRODUCTS API
    // ================================
    
    async getAllProducts() {
        try {
            if (!this.initialized) await this.initialize();
            
            const response = await this.makeRequest('GET', this.endpoints.products);
            
            // Handle different response structures
            let products = [];
            if (Array.isArray(response.data)) {
                products = response.data;
            } else if (response.data.products) {
                products = response.data.products;
            } else if (response.data.data) {
                products = response.data.data;
            }
            
            console.log(`📦 Loaded ${products.length} products`);
            
            // Log first product for debugging
            if (products.length > 0) {
                console.log('📋 First product sample:', products[0]);
            }
            
            return products;
            
        } catch (error) {
            console.error('❌ Error loading products:', error);
            // Return empty array instead of throwing, so app doesn't break
            return [];
        }
    }

    async getProduct(id) {
        try {
            if (!this.initialized) await this.initialize();
            
            const response = await this.makeRequest('GET', `${this.endpoints.products}/${id}`);
            return response.data.product || response.data;
            
        } catch (error) {
            console.error('❌ Error loading product:', error);
            throw error;
        }
    }

    async createProduct(productData) {
        try {
            if (!this.initialized) await this.initialize();
            
            const response = await this.makeRequest('POST', this.endpoints.products, productData, true);
            console.log('✅ Product created successfully');
            return response.data;
            
        } catch (error) {
            console.error('❌ Error creating product:', error);
            throw error;
        }
    }

    async updateProduct(id, productData) {
        try {
            if (!this.initialized) await this.initialize();
            
            const response = await this.makeRequest('PUT', `${this.endpoints.products}/${id}`, productData, true);
            console.log('✅ Product updated successfully');
            return response.data;
            
        } catch (error) {
            console.error('❌ Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            if (!this.initialized) await this.initialize();
            
            const response = await this.makeRequest('DELETE', `${this.endpoints.products}/${id}`, null, true);
            console.log('✅ Product deleted successfully');
            return response.data;
            
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            throw error;
        }
    }

    // Update product stock (for purchases)
    async updateProductStock(id, newStock) {
        try {
            const response = await this.makeRequest('PUT', `${this.endpoints.products}/${id}/stock`, 
                { stock: newStock }, true);
            return response.data;
        } catch (error) {
            console.error('❌ Error updating stock:', error);
            throw error;
        }
    }

    // ================================
    // CATEGORIES API
    // ================================
    
    async getAllCategories() {
        try {
            if (!this.initialized) await this.initialize();
            
            const response = await this.makeRequest('GET', this.endpoints.categories);
            
            let categories = [];
            if (Array.isArray(response.data)) {
                categories = response.data;
            } else if (response.data.categories) {
                categories = response.data.categories;
            }
            
            console.log(`📂 Loaded ${categories.length} categories`);
            
            // Log first category for debugging
            if (categories.length > 0) {
                console.log('📋 First category sample:', categories[0]);
            }
            
            return categories;
            
        } catch (error) {
            console.error('❌ Error loading categories, using fallback');
            return this.getFallbackCategories();
        }
    }

    getFallbackCategories() {
        return [
            { _id: 'perros', name: 'Perros', nombre: 'Perros' },
            { _id: 'gatos', name: 'Gatos', nombre: 'Gatos' },
            { _id: 'alimentos', name: 'Alimentos', nombre: 'Alimentos' },
            { _id: 'juguetes', name: 'Juguetes', nombre: 'Juguetes' },
            { _id: 'accesorios', name: 'Accesorios', nombre: 'Accesorios' }
        ];
    }

    // ================================
    // AUTHENTICATION API  
    // ================================
    
    async login(email, password) {
        try {
            const response = await this.makeRequest('POST', `${this.endpoints.auth}/login`, {
                email, password
            });
            
            const { user, token } = response.data;
            
            if (user && token) {
                localStorage.setItem('petstyle_user', JSON.stringify(user));
                localStorage.setItem('petstyle_token', token);
                console.log('✅ Login successful');
                return { success: true, user, token };
            }
            
            throw new Error('Invalid response format');
            
        } catch (error) {
            console.error('❌ Login failed:', error);
            return { success: false, message: error.message };
        }
    }

    async register(userData) {
        try {
            const response = await this.makeRequest('POST', `${this.endpoints.auth}/register`, userData);
            
            const { user, token } = response.data;
            
            if (user) {
                localStorage.setItem('petstyle_user', JSON.stringify(user));
                if (token) {
                    localStorage.setItem('petstyle_token', token);
                }
                console.log('✅ Registration successful');
                return { success: true, user, token };
            }
            
            throw new Error('Registration failed');
            
        } catch (error) {
            console.error('❌ Registration failed:', error);
            return { success: false, message: error.message };
        }
    }

    // ================================
    // ORDERS/PURCHASES API
    // ================================
    
    async createOrder(orderData) {
        try {
            if (!this.initialized) await this.initialize();
            
            const response = await this.makeRequest('POST', '/api/orders', orderData, true);
            
            // Update product stocks after successful order
            if (response.data.success && orderData.items) {
                await this.updateStocksAfterPurchase(orderData.items);
            }
            
            console.log('✅ Order created successfully');
            return response.data;
            
        } catch (error) {
            console.error('❌ Error creating order:', error);
            throw error;
        }
    }

    async updateStocksAfterPurchase(items) {
        try {
            const updatePromises = items.map(async (item) => {
                try {
                    // Get current product to verify stock
                    const product = await this.getProduct(item.productId || item.id);
                    const newStock = Math.max(0, (product.stock || 0) - (item.quantity || 0));
                    
                    await this.updateProductStock(item.productId || item.id, newStock);
                    console.log(`📦 Updated stock for ${item.name}: ${newStock}`);
                } catch (error) {
                    console.error(`❌ Failed to update stock for ${item.name}:`, error);
                }
            });
            
            await Promise.all(updatePromises);
            console.log('✅ All stocks updated after purchase');
            
        } catch (error) {
            console.error('❌ Error updating stocks after purchase:', error);
        }
    }

    // ================================
    // UTILITY METHODS
    // ================================
    
    // Test connection to backend
    async testConnection() {
        try {
            console.log('🔍 Testing backend connection...');
            const response = await fetch(`${this.baseURL}health`);
            const isOk = response.ok;
            console.log(isOk ? '✅ Backend connection successful' : '❌ Backend connection failed');
            return isOk;
        } catch (error) {
            console.error('❌ Backend connection failed:', error.message);
            return false;
        }
    }

    // Get API status
    getStatus() {
        return {
            initialized: this.initialized,
            baseURL: this.baseURL,
            endpoints: this.endpoints,
            hasToken: !!localStorage.getItem('petstyle_token'),
            hasUser: !!localStorage.getItem('petstyle_user')
        };
    }
}

// Create global API instance
const api = new PetStyleAPI();

// Auto-initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing API...');
    api.initialize().catch(error => {
        console.log('⚠️ API initialization failed, will retry on first use');
    });
});

// Export for global use
window.api = api;
window.PetStyleAPI = PetStyleAPI;

console.log('✅ PetStyle API System loaded successfully');