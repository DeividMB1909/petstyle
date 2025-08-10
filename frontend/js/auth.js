// frontend/js/auth.js
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.init();
    }

    init() {
        this.loadUserFromStorage();
        this.setupAuthListeners();
        CONFIG.log('info', 'AuthManager inicializado');
    }

    // =================== GESTIÓN DE ALMACENAMIENTO ===================
    loadUserFromStorage() {
        try {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
            const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
            
            if (token && userData) {
                this.token = token;
                this.currentUser = JSON.parse(userData);
                
                // Actualizar token en apiClient
                if (window.apiClient) {
                    window.apiClient.updateToken(token);
                }
                
                CONFIG.log('info', 'Usuario cargado desde storage', { email: this.currentUser?.email });
            }
        } catch (error) {
            CONFIG.log('error', 'Error cargando usuario desde storage', error);
            this.clearAuthData();
        }
    }

    saveUserToStorage(user, token) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
            CONFIG.log('debug', 'Usuario guardado en storage');
        } catch (error) {
            CONFIG.log('error', 'Error guardando usuario en storage', error);
        }
    }

    clearAuthData() {
        this.currentUser = null;
        this.token = null;
        
        // Limpiar localStorage
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Limpiar token del apiClient
        if (window.apiClient) {
            window.apiClient.updateToken(null);
        }
        
        CONFIG.log('info', 'Datos de autenticación limpiados');
    }

    // =================== VALIDACIONES ===================
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { valid: false, message: 'El email es requerido' };
        }
        
        if (!CONFIG.VALIDATION.EMAIL_REGEX.test(email)) {
            return { valid: false, message: 'Formato de email inválido' };
        }
        
        return { valid: true };
    }

    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, message: 'La contraseña es requerida' };
        }
        
        if (password.length < CONFIG.VALIDATION.MIN_PASSWORD_LENGTH) {
            return { valid: false, message: `La contraseña debe tener al menos ${CONFIG.VALIDATION.MIN_PASSWORD_LENGTH} caracteres` };
        }
        
        if (password.length > CONFIG.VALIDATION.MAX_PASSWORD_LENGTH) {
            return { valid: false, message: 'La contraseña es demasiado larga' };
        }
        
        return { valid: true };
    }

    validateRegistrationData(data) {
        const errors = {};
        
        // Validar nombre
        if (!data.name || data.name.trim().length < 2) {
            errors.name = 'El nombre debe tener al menos 2 caracteres';
        }
        
        // Validar email
        const emailValidation = this.validateEmail(data.email);
        if (!emailValidation.valid) {
            errors.email = emailValidation.message;
        }
        
        // Validar contraseña
        const passwordValidation = this.validatePassword(data.password);
        if (!passwordValidation.valid) {
            errors.password = passwordValidation.message;
        }
        
        // Validar confirmación de contraseña
        if (data.password !== data.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }
        
        // Validar teléfono (opcional)
        if (data.phone && !CONFIG.VALIDATION.PHONE_REGEX.test(data.phone)) {
            errors.phone = 'Formato de teléfono inválido';
        }
        
        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    }

    // =================== MÉTODOS DE AUTENTICACIÓN ===================
    async login(email, password, rememberMe = false) {
        try {
            CONFIG.log('info', 'Intentando login', { email });
            
            // Validar campos
            const emailValidation = this.validateEmail(email);
            if (!emailValidation.valid) {
                throw new Error(emailValidation.message);
            }
            
            const passwordValidation = this.validatePassword(password);
            if (!passwordValidation.valid) {
                throw new Error(passwordValidation.message);
            }
            
            // Llamar al API
            const response = await window.apiClient.login(email, password);
            
            if (!response || !response.success) {
                throw new Error(response?.message || 'Error en el login');
            }
            
            // Guardar datos de usuario
            this.token = response.data.token;
            this.currentUser = response.data.user;
            this.saveUserToStorage(this.currentUser, this.token);
            
            CONFIG.log('info', 'Login exitoso', { userId: this.currentUser.id });
            
            // Disparar evento personalizado
            this.dispatchAuthEvent('login', this.currentUser);
            
            return {
                success: true,
                user: this.currentUser,
                message: CONFIG.MESSAGES.LOGIN_SUCCESS
            };
            
        } catch (error) {
            CONFIG.log('error', 'Error en login', error);
            
            let errorMessage = CONFIG.MESSAGES.ERROR_INVALID_CREDENTIALS;
            
            if (error.message.includes('Email y password son requeridos')) {
                errorMessage = 'Todos los campos son requeridos';
            } else if (error.message.includes('Credenciales inválidas')) {
                errorMessage = CONFIG.MESSAGES.ERROR_INVALID_CREDENTIALS;
            } else if (error.message.includes('Timeout') || error.message.includes('fetch')) {
                errorMessage = CONFIG.MESSAGES.ERROR_NETWORK;
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    async register(userData) {
        try {
            CONFIG.log('info', 'Intentando registro', { email: userData.email });
            
            // Validar datos
            const validation = this.validateRegistrationData(userData);
            if (!validation.valid) {
                const firstError = Object.values(validation.errors)[0];
                throw new Error(firstError);
            }
            
            // Preparar datos para el API
            const registerData = {
                name: userData.name.trim(),
                email: userData.email.trim().toLowerCase(),
                password: userData.password,
                phone: userData.phone?.trim() || '',
                role: 'customer'
            };
            
            // Agregar fecha de nacimiento si está presente
            if (userData.dateOfBirth) {
                registerData.dateOfBirth = userData.dateOfBirth;
            }
            
            // Agregar dirección si está completa
            if (userData.address && this.isAddressComplete(userData.address)) {
                registerData.address = userData.address;
            }
            
            // Llamar al API
            const response = await window.apiClient.register(registerData);
            
            if (!response || !response.success) {
                throw new Error(response?.message || 'Error en el registro');
            }
            
            // Guardar datos de usuario
            this.token = response.data.token;
            this.currentUser = response.data.user;
            this.saveUserToStorage(this.currentUser, this.token);
            
            CONFIG.log('info', 'Registro exitoso', { userId: this.currentUser.id });
            
            // Disparar evento personalizado
            this.dispatchAuthEvent('register', this.currentUser);
            
            return {
                success: true,
                user: this.currentUser,
                message: CONFIG.MESSAGES.REGISTER_SUCCESS
            };
            
        } catch (error) {
            CONFIG.log('error', 'Error en registro', error);
            
            let errorMessage = 'Error al crear la cuenta';
            
            if (error.message.includes('ya está registrado')) {
                errorMessage = CONFIG.MESSAGES.ERROR_EMAIL_EXISTS;
            } else if (error.message.includes('Timeout') || error.message.includes('fetch')) {
                errorMessage = CONFIG.MESSAGES.ERROR_NETWORK;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    async logout() {
        try {
            CONFIG.log('info', 'Cerrando sesión');
            
            // Llamar al API para logout
            if (window.apiClient) {
                await window.apiClient.logout();
            }
            
            // Limpiar datos locales
            const oldUser = this.currentUser;
            this.clearAuthData();
            
            // Disparar evento personalizado
            this.dispatchAuthEvent('logout', oldUser);
            
            CONFIG.log('info', 'Sesión cerrada exitosamente');
            
            return {
                success: true,
                message: CONFIG.MESSAGES.LOGOUT_SUCCESS
            };
            
        } catch (error) {
            CONFIG.log('error', 'Error en logout', error);
            
            // Limpiar datos locales aunque haya error en el servidor
            this.clearAuthData();
            
            return {
                success: true,
                message: CONFIG.MESSAGES.LOGOUT_SUCCESS
            };
        }
    }

    // =================== UTILIDADES ===================
    isAddressComplete(address) {
        return address && 
               address.street && 
               address.city && 
               address.state && 
               address.zipCode;
    }

    isAuthenticated() {
        return !!(this.token && this.currentUser);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getToken() {
        return this.token;
    }

    hasRole(role) {
        return this.currentUser?.role === role;
    }

    isAdmin() {
        return this.hasRole(CONFIG.ROLES.ADMIN);
    }

    isCustomer() {
        return this.hasRole(CONFIG.ROLES.CUSTOMER);
    }

    // =================== EVENTOS ===================
    dispatchAuthEvent(type, userData) {
        const event = new CustomEvent('authStateChanged', {
            detail: { type, user: userData, timestamp: new Date().toISOString() }
        });
        
        document.dispatchEvent(event);
        CONFIG.log('debug', `Evento de auth disparado: ${type}`);
    }

    setupAuthListeners() {
        // Escuchar cambios en el storage (para múltiples tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === CONFIG.STORAGE_KEYS.TOKEN) {
                if (!e.newValue && this.isAuthenticated()) {
                    // Token removido en otra tab
                    CONFIG.log('info', 'Sesión cerrada en otra pestaña');
                    this.clearAuthData();
                    this.dispatchAuthEvent('logout', this.currentUser);
                }
            }
        });
        
        // Verificar autenticación al enfocar la ventana
        window.addEventListener('focus', () => {
            if (this.isAuthenticated()) {
                this.verifyTokenValidity();
            }
        });
        
        CONFIG.log('debug', 'Listeners de auth configurados');
    }

    async verifyTokenValidity() {
        try {
            if (!this.token) return false;
            
            const response = await window.apiClient.request('/auth/verify-token');
            
            if (!response || !response.success) {
                CONFIG.log('warn', 'Token inválido, cerrando sesión');
                await this.logout();
                return false;
            }
            
            return true;
        } catch (error) {
            CONFIG.log('error', 'Error verificando token', error);
            await this.logout();
            return false;
        }
    }

    // =================== NAVEGACIÓN ===================
    redirectAfterLogin() {
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('return') || CONFIG.ROUTES.PRODUCTS;
        
        CONFIG.log('info', 'Redirigiendo después del login', { url: returnUrl });
        window.location.href = returnUrl;
    }

    redirectToLogin(returnUrl = null) {
        const currentUrl = returnUrl || window.location.href;
        const loginUrl = `${CONFIG.ROUTES.LOGIN}?return=${encodeURIComponent(currentUrl)}`;
        
        CONFIG.log('info', 'Redirigiendo a login', { returnUrl: currentUrl });
        window.location.href = loginUrl;
    }

    requireAuth(redirect = true) {
        if (!this.isAuthenticated()) {
            CONFIG.log('warn', 'Acceso no autorizado');
            
            if (redirect) {
                this.redirectToLogin();
            }
            
            return false;
        }
        
        return true;
    }

    requireRole(role, redirect = true) {
        if (!this.requireAuth(redirect)) {
            return false;
        }
        
        if (!this.hasRole(role)) {
            CONFIG.log('warn', 'Rol insuficiente', { required: role, current: this.currentUser?.role });
            
            if (redirect) {
                window.location.href = CONFIG.ROUTES.HOME;
            }
            
            return false;
        }
        
        return true;
    }
}

// Crear instancia global
const authManager = new AuthManager();

// Hacer disponible globalmente
window.authManager = authManager;

CONFIG.log('info', 'AuthManager cargado y disponible globalmente');