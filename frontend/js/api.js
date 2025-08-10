// ===== API SERVICE - FINAL CORRECTED VERSION =====

const api = {
    baseURL: 'http://localhost:3000',
    detectedEndpoints: {},
    
    // Auto-detect your backend endpoints
    async detectEndpoints() {
        console.log('🔍 Auto-detecting your backend endpoints...');
        
        const possibleRoutes = [
            '/api/productos',    // ✅ ESPAÑOL PRIMERO (lo que configuraste en server.js)
            '/api/products',     
            '/productos',
            '/products',
            '/api/producto',
            '/producto',
            '/petstyle/productos',
            '/petstyle/products'
        ];
        
        for (const route of possibleRoutes) {
            try {
                console.log(`Testing: ${this.baseURL}${route}`);
                const response = await fetch(`${this.baseURL}${route}`);
                
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) || (data.products && Array.isArray(data.products)) || (data.data && Array.isArray(data.data))) {
                        this.detectedEndpoints.productos = route;
                        console.log(`✅ Found products endpoint: ${route}`);
                        
                        const productCount = Array.isArray(data) ? data.length : 
                                           data.products ? data.products.length : 
                                           data.data ? data.data.length : 0;
                        console.log(`📦 Found ${productCount} products`);
                        return route;
                    }
                }
            } catch (error) {
                console.log(`❌ Failed: ${route} - ${error.message}`);
            }
        }
        
        console.log('❌ No valid endpoints found');
        return null;
    },
    
    // ================================
    // PRODUCTOS - LECTURA (USUARIOS)
    // ================================
    
    // Get all products with auto-detection
    async getAllProducts() {
        try {
            console.log('📦 Fetching all products...');
            
            // If we haven't detected endpoints yet, do it now
            if (!this.detectedEndpoints.productos) {
                await this.detectEndpoints();
            }
            
            // If we found an endpoint, use it
            if (this.detectedEndpoints.productos) {
                const response = await fetch(`${this.baseURL}${this.detectedEndpoints.productos}`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('🔍 Raw API response:', data);
                    
                    // Handle different response formats from your backend
                    let products = [];
                    
                    if (Array.isArray(data)) {
                        products = data;
                    } else if (data.products && Array.isArray(data.products)) {
                        products = data.products;
                    } else if (data.data && Array.isArray(data.data)) {
                        products = data.data;
                    } else if (data.result && Array.isArray(data.result)) {
                        products = data.result;
                    } else if (data.items && Array.isArray(data.items)) {
                        products = data.items;
                    } else {
                        console.log('⚠️ Unknown response format, using empty array');
                        products = [];
                    }
                    
                    console.log(`📦 Processed products: ${products.length}`);
                    return products;
                }
            }
            
            throw new Error('No valid products endpoint found');
            
        } catch (error) {
            console.error('❌ Error fetching products:', error);
            
            // Return empty array instead of throwing for better UX
            return [];
        }
    },
    
    // Alias for compatibility
    async getProducts() {
        return this.getAllProducts();
    },
    
    // Get single product
    async getProduct(id) {
        try {
            console.log('🔍 Fetching product:', id);
            
            if (!this.detectedEndpoints.productos) {
                await this.detectEndpoints();
            }
            
            if (this.detectedEndpoints.productos) {
                const response = await fetch(`${this.baseURL}${this.detectedEndpoints.productos}/${id}`);
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Product fetched:', result);
                    return result;
                }
            }
            
            throw new Error('Product not found');
            
        } catch (error) {
            console.error('❌ Error fetching product:', error);
            throw error;
        }
    },
    
    // ================================
    // PRODUCTOS - ADMIN (CRUD)
    // ================================
    
    async createProduct(productData) {
        try {
            console.log('📝 Creating product:', productData);
            
            // Ensure we have the endpoint
            if (!this.detectedEndpoints.productos) {
                await this.detectEndpoints();
            }
            
            const endpoint = this.detectedEndpoints.productos || '/api/productos';
            const token = localStorage.getItem('petstyle_token');
            
            console.log('🔗 Using endpoint:', `${this.baseURL}${endpoint}`);
            console.log('🔑 Using token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
            
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(productData)
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.text();
                console.error('❌ Create product error:', response.status, errorData);
                
                try {
                    const jsonError = JSON.parse(errorData);
                    throw new Error(jsonError.message || `HTTP ${response.status}`);
                } catch (parseError) {
                    throw new Error(`Error ${response.status}: ${errorData || 'Unknown error'}`);
                }
            }

            const result = await response.json();
            console.log('✅ Product created successfully:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error creating product:', error);
            throw error;
        }
    },

    async updateProduct(id, productData) {
        try {
            console.log('📝 Updating product:', id, productData);
            
            if (!this.detectedEndpoints.productos) {
                await this.detectEndpoints();
            }
            
            const endpoint = this.detectedEndpoints.productos || '/api/productos';
            const token = localStorage.getItem('petstyle_token');
            
            console.log('🔗 Using endpoint:', `${this.baseURL}${endpoint}/${id}`);
            
            const response = await fetch(`${this.baseURL}${endpoint}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(productData)
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.text();
                console.error('❌ Update product error:', response.status, errorData);
                
                try {
                    const jsonError = JSON.parse(errorData);
                    throw new Error(jsonError.message || `HTTP ${response.status}`);
                } catch (parseError) {
                    throw new Error(`Error ${response.status}: ${errorData || 'Unknown error'}`);
                }
            }

            const result = await response.json();
            console.log('✅ Product updated successfully:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error updating product:', error);
            throw error;
        }
    },

    async deleteProduct(id) {
        try {
            console.log('🗑️ Deleting product:', id);
            
            if (!this.detectedEndpoints.productos) {
                await this.detectEndpoints();
            }
            
            const endpoint = this.detectedEndpoints.productos || '/api/productos';
            const token = localStorage.getItem('petstyle_token');
            
            console.log('🔗 Using endpoint:', `${this.baseURL}${endpoint}/${id}`);
            
            const response = await fetch(`${this.baseURL}${endpoint}/${id}`, {
                method: 'DELETE',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.text();
                console.error('❌ Delete product error:', response.status, errorData);
                
                try {
                    const jsonError = JSON.parse(errorData);
                    throw new Error(jsonError.message || `HTTP ${response.status}`);
                } catch (parseError) {
                    throw new Error(`Error ${response.status}: ${errorData || 'Unknown error'}`);
                }
            }

            const result = await response.json();
            console.log('✅ Product deleted successfully:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            throw error;
        }
    },
    
    // ================================
    // CATEGORÍAS
    // ================================
    
    async getAllCategories() {
        try {
            console.log('🔍 Fetching categories...');
            
            const routes = ['/api/categorias', '/api/categories', '/categorias', '/categories'];
            const token = localStorage.getItem('petstyle_token');
            
            for (const route of routes) {
                try {
                    const response = await fetch(`${this.baseURL}${route}`, {
                        headers: {
                            ...(token && { 'Authorization': `Bearer ${token}` })
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('📂 Categories found at:', route);
                        
                        // Handle different formats
                        if (Array.isArray(data)) {
                            return data;
                        } else if (data.categories && Array.isArray(data.categories)) {
                            return data.categories;
                        } else if (data.data && Array.isArray(data.data)) {
                            return data.data;
                        }
                    }
                } catch (error) {
                    // Continue trying other routes
                    console.log(`❌ Failed route ${route}:`, error.message);
                }
            }
            
            // Fallback categories compatible with your admin
            console.log('📂 Using fallback categories');
            return [
                { _id: 'alimentacion', name: 'Alimentación', nombre: 'Alimentación' },
                { _id: 'juguetes', name: 'Juguetes', nombre: 'Juguetes' },
                { _id: 'accesorios', name: 'Accesorios', nombre: 'Accesorios' },
                { _id: 'cuidado', name: 'Cuidado', nombre: 'Cuidado' },
                { _id: 'salud', name: 'Salud', nombre: 'Salud' }
            ];
            
        } catch (error) {
            console.error('❌ Error fetching categories:', error);
            // Return fallback
            return [
                { _id: 'alimentacion', name: 'Alimentación', nombre: 'Alimentación' },
                { _id: 'juguetes', name: 'Juguetes', nombre: 'Juguetes' },
                { _id: 'accesorios', name: 'Accesorios', nombre: 'Accesorios' },
                { _id: 'cuidado', name: 'Cuidado', nombre: 'Cuidado' },
                { _id: 'salud', name: 'Salud', nombre: 'Salud' }
            ];
        }
    },

    async createCategory(categoryData) {
        try {
            console.log('📂 Creating category:', categoryData);
            
            const token = localStorage.getItem('petstyle_token');
            const response = await fetch(`${this.baseURL}/api/categorias`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(categoryData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Category created:', result);
            return result;
        } catch (error) {
            console.error('❌ Error creating category:', error);
            throw error;
        }
    },
    
    // ================================
    // USUARIOS - PARA ADMIN
    // ================================
    
    async getAllUsers() {
        try {
            console.log('👥 Fetching users...');
            
            const routes = ['/api/usuarios', '/api/users', '/usuarios', '/users'];
            const token = localStorage.getItem('petstyle_token');
            
            for (const route of routes) {
                try {
                    const response = await fetch(`${this.baseURL}${route}`, {
                        headers: {
                            ...(token && { 'Authorization': `Bearer ${token}` })
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('👥 Users found at:', route);
                        
                        if (Array.isArray(data)) {
                            return data;
                        } else if (data.users && Array.isArray(data.users)) {
                            return data.users;
                        } else if (data.data && Array.isArray(data.data)) {
                            return data.data;
                        }
                    }
                } catch (error) {
                    // Continue trying other routes
                    console.log(`❌ Failed route ${route}:`, error.message);
                }
            }
            
            return [];
            
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            return [];
        }
    },

    async deleteUser(id) {
        try {
            console.log('🗑️ Deleting user:', id);
            
            const token = localStorage.getItem('petstyle_token');
            const response = await fetch(`${this.baseURL}/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ User deleted:', result);
            return result;
        } catch (error) {
            console.error('❌ Error deleting user:', error);
            throw error;
        }
    },

    // ================================
    // ESTADÍSTICAS - PARA ADMIN
    // ================================
    
    async getStats() {
        try {
            console.log('📊 Calculating stats...');
            
            // Get data in parallel
            const [products, users, categories] = await Promise.all([
                this.getAllProducts().catch(() => []),
                this.getAllUsers().catch(() => []),
                this.getAllCategories().catch(() => [])
            ]);

            const stats = {
                totalProducts: products.length || 0,
                totalUsers: users.length || 0,
                totalCategories: categories.length || 0,
                totalRevenue: Math.floor(Math.random() * 50000) + 10000, // Mock data
                totalOrders: Math.floor(Math.random() * 200) + 50,       // Mock data
                activeUsers: users.filter(user => user.active !== false).length || 0
            };

            console.log('📊 Stats calculated:', stats);
            return stats;
            
        } catch (error) {
            console.error('❌ Error calculating stats:', error);
            return {
                totalProducts: 0,
                totalUsers: 0,
                totalCategories: 0,
                totalRevenue: 0,
                totalOrders: 0,
                activeUsers: 0
            };
        }
    },
    
    // ================================
    // DIAGNÓSTICO Y DEBUGGING (MANUAL)
    // ================================
    
    // Test all possible backend configurations
    async fullDiagnostic() {
        console.log('🏥 Running full backend diagnostic...');
        
        // Test different ports
        const ports = [3000, 3001, 5000, 8000, 4000];
        const routes = ['/api/productos', '/api/products', '/productos', '/products'];
        
        for (const port of ports) {
            console.log(`\n🔌 Testing port ${port}:`);
            
            for (const route of routes) {
                try {
                    const url = `http://localhost:${port}${route}`;
                    const response = await fetch(url);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log(`✅ SUCCESS: ${url}`);
                        console.log(`📊 Response type: ${Array.isArray(data) ? 'Array' : 'Object'}`);
                        console.log(`📦 Items found: ${Array.isArray(data) ? data.length : 'Unknown'}`);
                        
                        // Update baseURL if we found a working one
                        if (port !== 3000) {
                            this.baseURL = `http://localhost:${port}`;
                            console.log(`🔄 Updated baseURL to: ${this.baseURL}`);
                        }
                        
                        this.detectedEndpoints.productos = route;
                        return { port, route, url, data: Array.isArray(data) ? data : data.products || [] };
                    }
                } catch (error) {
                    console.log(`❌ ${port}${route}: ${error.message}`);
                }
            }
        }
        
        console.log('❌ No working backend found on any port/route combination');
        return null;
    },
    
    // Show your backend info (MANUAL - call when needed)
    async showBackendInfo() {
        console.log('\n📋 BACKEND DIAGNOSTIC REPORT');
        console.log('='.repeat(50));
        
        const result = await this.fullDiagnostic();
        
        if (result) {
            console.log(`✅ Working backend found!`);
            console.log(`🌐 URL: ${result.url}`);
            console.log(`📦 Products found: ${result.data.length}`);
            if (result.data.length > 0) {
                console.log(`🏷️ Sample product:`, result.data[0]);
            }
        } else {
            console.log(`❌ No working backend found`);
            console.log(`💡 Make sure your backend is running with: npm run dev`);
            console.log(`💡 Verify your server.js has: app.use('/api/productos', productRoutes);`);
        }
        
        return result;
    },
    
    // ================================
    // COMPATIBILITY FUNCTIONS
    // ================================
    
    // Legacy function names for compatibility
    getProduct: function(id) { return this.getProduct(id); },
    addProduct: function(data) { return this.createProduct(data); },
    editProduct: function(id, data) { return this.updateProduct(id, data); },
    removeProduct: function(id) { return this.deleteProduct(id); }
};

// Export for global use
window.api = api;

// Auto-initialize endpoint detection (only once)
if (typeof window !== 'undefined') {
    // Only auto-detect if not already done
    if (!api.detectedEndpoints.productos) {
        // Wait a bit before auto-detecting to avoid conflicts with page load
        setTimeout(() => {
            api.detectEndpoints().catch(error => {
                console.log('⚠️ Auto-detection failed, will detect on first API call');
            });
        }, 1000);
    }
}