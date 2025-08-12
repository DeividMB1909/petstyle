// ===== PETSTYLE AUTHENTICATION SYSTEM - INTEGRATED =====
console.log('🔐 PetStyle Auth System Loading...');

class PetStyleAuth {
    constructor() {
        this.currentUser = null;
        this.currentToken = null;
        this.initialized = false;
        this.loginCallbacks = [];
        this.logoutCallbacks = [];
    }

    // ================================
    // INITIALIZATION
    // ================================

    async initialize() {
        try {
            console.log('🚀 Initializing Auth System...');
            
            // Load saved session
            this.loadSavedSession();
            
            // Setup auto-logout on tab close
            this.setupSessionManagement();
            
            // Verify token if exists
            if (this.currentToken) {
                await this.verifyToken();
            }
            
            this.initialized = true;
            console.log('✅ Auth System initialized successfully');
            
            // Dispatch ready event
            document.dispatchEvent(new CustomEvent('authSystemReady', {
                detail: { auth: this }
            }));
            
            return true;
            
        } catch (error) {
            console.error('❌ Error initializing Auth System:', error);
            return false;
        }
    }

    loadSavedSession() {
        try {
            // Load user data
            const userData = localStorage.getItem('petstyle_user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                console.log('👤 Loaded user session:', this.currentUser.name || this.currentUser.email);
            }
            
            // Load token
            this.currentToken = localStorage.getItem('petstyle_token');
            if (this.currentToken) {
                console.log('🔑 Token loaded successfully');
            }
            
        } catch (error) {
            console.error('Error loading saved session:', error);
            this.clearSession();
        }
    }

    setupSessionManagement() {
        // Auto-logout on multiple tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'petstyle_user' || e.key === 'petstyle_token') {
                if (!e.newValue && this.currentUser) {
                    // User logged out in another tab
                    this.handleRemoteLogout();
                } else if (e.newValue && !this.currentUser) {
                    // User logged in in another tab
                    this.loadSavedSession();
                }
            }
        });
    }

    async verifyToken() {
        try {
            if (!this.currentToken) return false;
            
            // Try to verify with API
            if (window.api && api.makeRequest) {
                const response = await api.makeRequest('GET', '/api/auth/verify', null, true);
                if (response.ok) {
                    console.log('✅ Token verified successfully');
                    return true;
                }
            }
            
            // If verification fails, clear invalid session
            console.warn('⚠️ Token verification failed');
            this.clearSession();
            return false;
            
        } catch (error) {
            console.warn('⚠️ Token verification error:', error);
            // Don't clear session on network errors, might be temporary
            return false;
        }
    }

    // ================================
    // AUTHENTICATION METHODS
    // ================================

    async login(email, password) {
        try {
            console.log('🔐 Attempting login for:', email);
            
            // Validate input
            if (!email || !password) {
                throw new Error('Email y contraseña son obligatorios');
            }

            if (!this.isValidEmail(email)) {
                throw new Error('Email no válido');
            }

            // Show loading state
            if (window.utils) {
                utils.showLoading('body', 'Iniciando sesión...');
            }

            let result;
            
            // Try API login first
            if (window.api) {
                result = await api.login(email, password);
            } else {
                // Fallback to direct fetch
                result = await this.directApiLogin(email, password);
            }

            if (result.success) {
                // Save session
                this.currentUser = result.user;
                this.currentToken = result.token;
                
                this.saveSession();
                
                // Fire callbacks
                this.fireLoginCallbacks(result.user);
                
                // Show success message
                if (window.utils) {
                    utils.notifications.success('Inicio de sesión exitoso');
                }
                
                // Redirect based on role
                setTimeout(() => this.redirectAfterLogin(result.user), 1000);
                
                console.log('✅ Login successful');
                return result;
                
            } else {
                throw new Error(result.message || 'Credenciales incorrectas');
            }

        } catch (error) {
            console.error('❌ Login failed:', error);
            
            if (window.utils) {
                utils.notifications.error(error.message);
            }
            
            return { success: false, message: error.message };
            
        } finally {
            if (window.utils) {
                utils.hideLoading('body');
            }
        }
    }

    async directApiLogin(email, password) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    user: data.user || { email, name: 'Usuario' },
                    token: data.token
                };
            } else {
                throw new Error(data.message || 'Login failed');
            }

        } catch (error) {
            if (error.message.includes('fetch')) {
                throw new Error('No se pudo conectar con el servidor');
            }
            throw error;
        }
    }

    async register(userData) {
        try {
            console.log('📝 Attempting registration for:', userData.email);
            
            // Validate input
            this.validateRegistrationData(userData);
            
            if (window.utils) {
                utils.showLoading('body', 'Creando cuenta...');
            }

            let result;
            
            // Try API registration
            if (window.api && api.register) {
                result = await api.register(userData);
            } else {
                // Fallback to direct fetch
                result = await this.directApiRegister(userData);
            }

            if (result.success) {
                // Save session
                this.currentUser = result.user;
                this.currentToken = result.token;
                
                this.saveSession();
                
                // Fire callbacks
                this.fireLoginCallbacks(result.user);
                
                if (window.utils) {
                    utils.notifications.success('Registro exitoso');
                }
                
                // Redirect to main (new users are regular users)
                setTimeout(() => {
                    window.location.href = 'main.html';
                }, 1000);
                
                console.log('✅ Registration successful');
                return result;
                
            } else {
                throw new Error(result.message || 'Error en el registro');
            }

        } catch (error) {
            console.error('❌ Registration failed:', error);
            
            if (window.utils) {
                utils.notifications.error(error.message);
            }
            
            return { success: false, message: error.message };
            
        } finally {
            if (window.utils) {
                utils.hideLoading('body');
            }
        }
    }

    async directApiRegister(userData) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    user: data.user || userData,
                    token: data.token
                };
            } else {
                throw new Error(data.message || 'Registration failed');
            }

        } catch (error) {
            if (error.message.includes('fetch')) {
                throw new Error('No se pudo conectar con el servidor');
            }
            throw error;
        }
    }

    // ================================
    // SESSION MANAGEMENT
    // ================================

    saveSession() {
        try {
            if (this.currentUser) {
                localStorage.setItem('petstyle_user', JSON.stringify(this.currentUser));
            }
            if (this.currentToken) {
                localStorage.setItem('petstyle_token', this.currentToken);
            }
            return true;
        } catch (error) {
            console.error('Error saving session:', error);
            return false;
        }
    }

    clearSession() {
        try {
            localStorage.removeItem('petstyle_user');
            localStorage.removeItem('petstyle_token');
            this.currentUser = null;
            this.currentToken = null;
            
            console.log('🧹 Session cleared');
            return true;
        } catch (error) {
            console.error('Error clearing session:', error);
            return false;
        }
    }

    logout() {
        try {
            // Get user for cleanup
            const user = this.currentUser;
            
            // Clear session
            this.clearSession();
            
            // Clear user-specific data
            if (user) {
                const userEmail = user.email;
                localStorage.removeItem(`favorites_${userEmail}`);
                localStorage.removeItem(`cart_${userEmail}`);
            }
            
            // Fire callbacks
            this.fireLogoutCallbacks();
            
            if (window.utils) {
                utils.notifications.success('Sesión cerrada correctamente');
            }
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            
            console.log('✅ Logout successful');
            return true;
            
        } catch (error) {
            console.error('❌ Logout error:', error);
            if (window.utils) {
                utils.notifications.error('Error al cerrar sesión');
            }
            return false;
        }
    }

    handleRemoteLogout() {
        // Handle logout from another tab
        this.currentUser = null;
        this.currentToken = null;
        this.fireLogoutCallbacks();
        
        if (window.utils) {
            utils.notifications.info('Sesión cerrada en otra pestaña');
        }
    }

    // ================================
    // USER MANAGEMENT
    // ================================

    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentToken() {
        return this.currentToken;
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    isAdmin() {
        if (!this.currentUser) return false;
        
        // Check multiple conditions for admin
        const adminConditions = [
            this.currentUser.role === 'admin',
            this.currentUser.userType === 'admin',
            this.currentUser.isAdmin === true,
            this.currentUser.role === 'administrador',
            this.currentUser.email?.includes('admin')
        ];
        
        return adminConditions.some(condition => condition === true);
    }

    requireAuth(redirectUrl = 'login.html') {
        if (!this.isLoggedIn()) {
            if (window.utils) {
                utils.notifications.warning('Debes iniciar sesión para acceder a esta página');
            }
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);
            return false;
        }
        return true;
    }

    requireAdmin(redirectUrl = 'main.html') {
        if (!this.requireAuth()) return false;
        
        if (!this.isAdmin()) {
            if (window.utils) {
                utils.notifications.error('Acceso denegado. Se requieren permisos de administrador.');
            }
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);
            return false;
        }
        return true;
    }

    redirectAfterLogin(user) {
        console.log('🔄 Redirecting user based on role:', user);
        
        const isUserAdmin = this.isAdmin();
        console.log('🔍 Admin check result:', isUserAdmin);
        
        setTimeout(() => {
            if (isUserAdmin) {
                console.log('👑 Admin detected - redirecting to admin panel');
                if (window.utils) {
                    utils.notifications.success('Bienvenido, Administrador');
                }
                window.location.href = 'admin.html';
            } else {
                console.log('👤 Regular user - redirecting to main');
                if (window.utils) {
                    utils.notifications.success(`Bienvenido, ${user.name || user.nombre}`);
                }
                window.location.href = 'main.html';
            }
        }, 1000);
    }

    // ================================
    // VALIDATION
    // ================================

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateRegistrationData(userData) {
        const requiredFields = ['name', 'email', 'password'];
        
        for (const field of requiredFields) {
            if (!userData[field]) {
                throw new Error(`El campo ${field} es obligatorio`);
            }
        }
        
        if (!this.isValidEmail(userData.email)) {
            throw new Error('El email no es válido');
        }
        
        const passwordValidation = this.validatePassword(userData.password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors[0]);
        }
    }

    validatePassword(password) {
        const errors = [];
        
        if (password.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            strength: this.getPasswordStrength(password)
        };
    }

    getPasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 6) strength += 1;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/\d/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    }

    // ================================
    // CALLBACKS
    // ================================

    onLogin(callback) {
        this.loginCallbacks.push(callback);
    }

    onLogout(callback) {
        this.logoutCallbacks.push(callback);
    }

    fireLoginCallbacks(user) {
        this.loginCallbacks.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('Error in login callback:', error);
            }
        });
    }

    fireLogoutCallbacks() {
        this.logoutCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in logout callback:', error);
            }
        });
    }
}

// Create global auth instance
const auth = new PetStyleAuth();

// Auto-initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    auth.initialize();
});

// Export for global use
window.auth = auth;
window.PetStyleAuth = PetStyleAuth;

console.log('✅ PetStyle Auth System loaded successfully');