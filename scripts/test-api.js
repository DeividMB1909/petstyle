 
// Script para probar la API de PetStyle
const https = require('https');
const http = require('http');

const API_BASE_URL = process.env.API_URL || 'http://localhost:8080';

async function testEndpoint(endpoint, method = 'GET') {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE_URL}${endpoint}`;
        const protocol = url.startsWith('https') ? https : http;
        
        const req = protocol.request(url, { method }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: data
                });
            });
        });
        
        req.on('error', reject);
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Ejecutando tests de API...\n');
    
    const tests = [
        { endpoint: '/api/health', name: 'Health Check' },
        { endpoint: '/api/products', name: 'Lista de productos' },
        { endpoint: '/api/categories', name: 'Categorías' }
    ];
    
    for (const test of tests) {
        try {
            const result = await testEndpoint(test.endpoint);
            console.log(`✅ ${test.name}: ${result.status}`);
        } catch (error) {
            console.log(`❌ ${test.name}: Error - ${error.message}`);
        }
    }
}

runTests();