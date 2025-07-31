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
            const response = await this.api.login({ email, password });
            this.user = response.user;
            Utils.showToast('¡Bienvenido a PetStyle!', 'success');
            return response;
        } catch (error) {
            Utils.showToast(error.message, 'error');
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await this.api.register(userData);
            this.user = response.user;
            Utils.showToast('¡Cuenta creada exitosamente!', 'success');
            return response;
        } catch (error) {
            Utils.showToast(error.message, 'error');
            throw error;
        }
    }

    async logout() {
        try {
            await this.api.logout();
            this.user = null;
            Utils.showToast('Sesión cerrada', 'info');
            // Redireccionar al login
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}
