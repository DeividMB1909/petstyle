// ===== API SERVICE - AUTO DETECTION =====

const api = {
    baseURL: 'http://localhost:3000',
    detectedEndpoints: {},
    
    // Auto-detect your backend endpoints
    async detectEndpoints() {
        console.log('🔍 Auto-detecting your backend endpoints...');
        
        const possibleRoutes = [
            '/api/productos',
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
                    if (Array.isArray(data) || (data.products && Array.isArray(data.products))) {
                        this.detectedEndpoints.productos = route;
                        console.log(`✅ Found products endpoint: ${route}`);
                        console.log(`📦 Found ${Array.isArray(data) ? data.length : data.products.length} products`);
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
    
    // Get all products with auto-detection
    async getAllProducts() {
        try {
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
            console.error('Error fetching products:', error);
            throw error;
        }
    },
    
    // Get single product
    async getProduct(id) {
        try {
            if (!this.detectedEndpoints.productos) {
                await this.detectEndpoints();
            }
            
            if (this.detectedEndpoints.productos) {
                const response = await fetch(`${this.baseURL}${this.detectedEndpoints.productos}/${id}`);
                
                if (response.ok) {
                    return await response.json();
                }
            }
            
            throw new Error('Product not found');
            
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },
    
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
    
    // Show your backend info
    async showBackendInfo() {
        console.log('\n📋 BACKEND DIAGNOSTIC REPORT');
        console.log('=' * 50);
        
        const result = await this.fullDiagnostic();
        
        if (result) {
            console.log(`✅ Working backend found!`);
            console.log(`🌐 URL: ${result.url}`);
            console.log(`📦 Products found: ${result.data.length}`);
            console.log(`🏷️ Sample product:`, result.data[0]);
        } else {
            console.log(`❌ No working backend found`);
            console.log(`💡 Make sure your backend is running with: npm run dev`);
        }
        
        return result;
    }
};

// Auto-detect on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Starting backend detection...');
    
    // Wait a bit for the page to load
    setTimeout(async () => {
        const result = await api.showBackendInfo();
        
        if (result) {
            showToast(`✅ Backend conectado: ${result.data.length} productos encontrados`, 'success');
        } else {
            showToast('⚠️ Backend no encontrado - usando datos de prueba', 'warning');
        }
    }, 1000);
});

// Export for global use
window.api = api;