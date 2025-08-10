// frontend/js/config.js
const CONFIG = {
    // Configuración del API
    API_BASE_URL: 'http://localhost:3000/api',
    BACKEND_URL: 'http://localhost:3000',
    
    // Información de la aplicación
    APP_NAME: 'PetStyle',
    VERSION: '1.0.0',
    DEBUG: true,
    
    // Configuración de timeouts y reintentos
    APP: {
        TIMEOUT: 10000, // 10 segundos
        RETRY_ATTEMPTS: 3,
        DEFAULT_PAGE_SIZE: 12
    },
    
    // Claves de almacenamiento local
    STORAGE_KEYS: {
        TOKEN: 'petstyle_token',
        USER: 'petstyle_user',
        CART: 'petstyle_cart',
        FAVORITES: 'petstyle_favorites',
        THEME: 'petstyle_theme'
    },
    
    // Configuración de validaciones
    VALIDATION: {
        MIN_PASSWORD_LENGTH: 6,
        MAX_PASSWORD_LENGTH: 100,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/
    },
    
    // Mensajes de la aplicación
    MESSAGES: {
        LOGIN_SUCCESS: '¡Bienvenido de vuelta!',
        REGISTER_SUCCESS: '¡Cuenta creada exitosamente!',
        LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
        ERROR_NETWORK: 'Error de conexión. Verifica tu internet.',
        ERROR_SERVER: 'Error del servidor. Intenta más tarde.',
        ERROR_INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
        ERROR_EMAIL_EXISTS: 'Este email ya está registrado'
    },
    
    // Rutas de la aplicación
    ROUTES: {
        HOME: '/',
        LOGIN: '/pages/login.html',
        REGISTER: '/pages/register.html',
        PROFILE: '/pages/profile.html',
        PRODUCTS: '/pages/main.html',
        CART: '/pages/carrito.html',
        FAVORITES: '/pages/favorites.html',
        ADMIN: '/pages/administradores.html'
    },
    
    // Configuración de roles
    ROLES: {
        CUSTOMER: 'customer',
        ADMIN: 'admin'
    },
    
    // Utilidades
    getEnvironment() {
        return this.DEBUG ? 'development' : 'production';
    },
    
    isProduction() {
        return !this.DEBUG;
    },
    
    isDevelopment() {
        return this.DEBUG;
    },
    
    // Logging personalizado
    log(level, message, data = null) {
        if (!this.DEBUG && level === 'debug') return;
        
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.APP_NAME}]`;
        
        switch (level) {
            case 'error':
                console.error(prefix, message, data || '');
                break;
            case 'warn':
                console.warn(prefix, message, data || '');
                break;
            case 'info':
                console.info(prefix, message, data || '');
                break;
            case 'debug':
                console.log(prefix, message, data || '');
                break;
            default:
                console.log(prefix, message, data || '');
        }
    }
};

// Hacer CONFIG disponible globalmente
window.CONFIG = CONFIG;

// Log de inicialización
CONFIG.log('info', 'Configuración cargada', {
    environment: CONFIG.getEnvironment(),
    apiUrl: CONFIG.API_BASE_URL,
    version: CONFIG.VERSION
});

// Verificar si estamos en desarrollo y mostrar información útil
if (CONFIG.isDevelopment()) {
    CONFIG.log('debug', 'Modo desarrollo activado');
    CONFIG.log('debug', 'Configuración completa:', CONFIG);
}