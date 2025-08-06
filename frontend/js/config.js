// frontend/js/config.js
const CONFIG = {
    // URLs de API según el entorno
    API_BASE_URL: (() => {
        // Detectar si estamos en Cordova
        if (window.cordova || window.PhoneGap || window.phonegap) {
            // En Cordova, usar la IP de tu computadora en la red local
            return 'http://192.168.1.100:3000/api'; // Cambia esta IP por la tuya
        }
        
        // Si es desarrollo local con archivo
        if (window.location.protocol === 'file:') {
            return 'http://localhost:3000/api';
        }
        
        // Si es servidor web local
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        
        // Producción
        return '/api';
    })(),
    
    // Claves para localStorage
    STORAGE_KEYS: {
        TOKEN: 'petstyle_auth_token',
        USER: 'petstyle_user_data',
        CART: 'petstyle_cart',
        FAVORITES: 'petstyle_favorites'
    },
    
    // Configuración de la app
    APP: {
        NAME: 'PetStyle',
        VERSION: '1.0.0',
        TIMEOUT: 10000, // 10 segundos
        RETRY_ATTEMPTS: 3
    },
    
    // Configuración para Cordova
    CORDOVA: {
        READY: false,
        DEVICE_INFO: null
    }
};

// Función para obtener la IP local de la red
CONFIG.getLocalIP = function() {
    // Esta es la IP que debes cambiar por la de tu computadora
    // Para obtenerla, ejecuta: ipconfig (Windows) o ifconfig (Mac/Linux)
    return '192.168.1.100'; // CAMBIAR ESTA IP
};

// Función para detectar el entorno
CONFIG.getEnvironment = function() {
    if (window.cordova) return 'cordova';
    if (window.location.protocol === 'file:') return 'file';
    if (window.location.hostname === 'localhost') return 'development';
    return 'production';
};

// Función para verificar conectividad
CONFIG.checkConnectivity = async function() {
    try {
        const response = await fetch(`${this.API_BASE_URL.replace('/api', '')}/health`, {
            method: 'GET',
            timeout: 5000
        });
        return response.ok;
    } catch (error) {
        console.error('Connectivity check failed:', error);
        return false;
    }
};

// Event listener para cuando Cordova esté listo
document.addEventListener('deviceready', function() {
    CONFIG.CORDOVA.READY = true;
    CONFIG.CORDOVA.DEVICE_INFO = window.device || null;
    
    console.log('🚀 Cordova Ready!');
    console.log('📱 Device:', CONFIG.CORDOVA.DEVICE_INFO);
    console.log('🌐 API URL:', CONFIG.API_BASE_URL);
    
    // Disparar evento personalizado
    document.dispatchEvent(new CustomEvent('cordovaReady', {
        detail: { config: CONFIG }
    }));
}, false);

// Para debugging
if (window.location.hostname === 'localhost') {
    window.CONFIG = CONFIG;
    console.log('🐾 PetStyle Config loaded:', CONFIG);
}

// Export para uso con modules (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}