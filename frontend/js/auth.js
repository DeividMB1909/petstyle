class AuthManager {
    constructor(api) {
        this.api = api;
        this.user = null;
        this.loadUser();
    }

    loadUser() {
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
        if (userData) {
            this.user = JSON.parse(userData);
        }
    }

    isAuthenticated() {
        return !!this.api.getToken() && !!this.user;
    }

    getCurrentUser() {
        return this.user;
    }

    async login(email, password) {
        try {
            console.log('🔐 AuthManager: Intentando login...');
            const response = await this.api.login({ email, password });
            
            if (response.success && response.data) {
                this.user = response.data.user;
                console.log('✅ Login exitoso:', this.user.name);
                
                // Mostrar mensaje de éxito
                this.showToast('¡Bienvenido ' + this.user.name + '!', 'success');
                
                // Redirigir después de un momento
                setTimeout(() => {
                    window.location.href = '../pages/main.html';
                }, 1500);
                
                return true;
            }
            throw new Error(response.message || 'Login fallido');
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showToast(error.message, 'error');
            throw error;
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Estilos del toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '15px 25px',
            borderRadius: '25px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1001',
            maxWidth: '90%',
            textAlign: 'center',
            animation: 'slideInDown 0.3s ease'
        });
        
        // Colores según el tipo
        switch (type) {
            case 'success':
                toast.style.background = '#10b981';
                break;
            case 'error':
                toast.style.background = '#ef4444';
                break;
            default:
                toast.style.background = '#6b7280';
        }
        
        document.body.appendChild(toast);
        
        // Remover después de 4 segundos
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    async logout() {
        try {
            await this.api.logout();
            this.user = null;
            this.showToast('Sesión cerrada', 'info');
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

// Solo crear si no existe
if (!window.authManager && window.api) {
    window.authManager = new AuthManager(window.api);
    console.log('🔐 AuthManager creado globalmente');
}