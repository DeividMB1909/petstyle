// ===== LOGIN PAGE - INTEGRATED =====
console.log('🔐 Login Page Script Loading...');

class LoginPage {
    constructor() {
        this.isLogging = false;
        this.initialized = false;
    }

    // ================================
    // INITIALIZATION
    // ================================

    async initialize() {
        try {
            console.log('🚀 Initializing Login Page...');
            
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Check if user is already logged in
            if (auth.isLoggedIn()) {
                console.log('✅ User already logged in, redirecting...');
                this.redirectLoggedInUser();
                return;
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ Login Page initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Login Page:', error);
        }
    }

    async waitForDependencies() {
        let retries = 0;
        const maxRetries = 10;
        
        while ((!window.auth || !window.utils) && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (!window.auth || !window.utils) {
            throw new Error('Required dependencies not available');
        }
    }

    redirectLoggedInUser() {
        const user = auth.getCurrentUser();
        
        if (auth.isAdmin()) {
            utils.notifications.info('Bienvenido de vuelta, Administrador');
            setTimeout(() => window.location.href = 'admin.html', 1000);
        } else {
            utils.notifications.info(`Bienvenido de vuelta, ${user.name || user.nombre}`);
            setTimeout(() => window.location.href = 'main.html', 1000);
        }
    }

    // ================================
    // EVENT LISTENERS
    // ================================

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Toggle password visibility
        const togglePassword = document.querySelector('.toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Demo credentials
        const demoButtons = document.querySelectorAll('.fill-demo');
        demoButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.fillDemoCredentials(e));
        });

        // Guest access
        const guestBtn = document.getElementById('guest-btn');
        if (guestBtn) {
            guestBtn.addEventListener('click', () => this.continueAsGuest());
        }

        // Social login buttons (demo)
        const socialButtons = document.querySelectorAll('.social-btn');
        socialButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                utils.notifications.info('Funcionalidad en desarrollo');
            });
        });

        // Enter key to submit
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isLogging) {
                const loginForm = document.getElementById('login-form');
                if (loginForm) {
                    this.handleLogin(e);
                }
            }
        });

        console.log('✅ Event listeners configured');
    }

    // ================================
    // LOGIN FUNCTIONALITY
    // ================================

    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isLogging) {
            console.log('⚠️ Login already in progress');
            return;
        }

        try {
            this.isLogging = true;
            
            // Get form data
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            // Validate
            if (!email || !password) {
                utils.notifications.warning('Por favor completa todos los campos');
                return;
            }

            if (!this.isValidEmail(email)) {
                utils.notifications.error('Formato de email no válido');
                return;
            }

            // Show loading
            this.showLoading(true);
            
            // Attempt login
            console.log('🔑 Attempting login for:', email);
            const result = await auth.login(email, password);
            
            if (result.success) {
                // Handle remember me
                if (rememberMe) {
                    localStorage.setItem('petstyle_remember', 'true');
                } else {
                    localStorage.removeItem('petstyle_remember');
                }
                
                console.log('✅ Login successful');
                // auth.js handles the redirect
                
            } else {
                utils.notifications.error(result.message || 'Error al iniciar sesión');
            }
            
        } catch (error) {
            console.error('❌ Login error:', error);
            utils.notifications.error('Error inesperado al iniciar sesión');
        } finally {
            this.showLoading(false);
            this.isLogging = false;
        }
    }

    fillDemoCredentials(e) {
        const email = e.target.closest('.fill-demo').dataset.email;
        const password = e.target.closest('.fill-demo').dataset.password;
        
        document.getElementById('email').value = email;
        document.getElementById('password').value = password;
        
        utils.notifications.success('Credenciales de demo cargadas');
        
        // Auto-focus the login button
        setTimeout(() => {
            document.getElementById('login-btn').focus();
        }, 100);
    }

    continueAsGuest() {
        console.log('👤 Continuing as guest...');
        
        // Create a guest user
        const guestUser = {
            name: 'Invitado',
            email: 'guest@petstyle.demo',
            isGuest: true,
            loginTime: new Date().toISOString()
        };
        
        // Save guest session (no token)
        localStorage.setItem('petstyle_user', JSON.stringify(guestUser));
        
        utils.notifications.success('Accediendo como invitado...');
        
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1000);
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.querySelector('.toggle-password i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    }

    // ================================
    // UI HELPERS
    // ================================

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        const loginBtn = document.getElementById('login-btn');
        
        if (show) {
            overlay.classList.remove('hidden');
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Iniciando...</span>';
        } else {
            overlay.classList.add('hidden');
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Iniciar Sesión</span>';
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// ================================
// INITIALIZATION
// ================================

let loginPage;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔐 DOM loaded, initializing Login Page...');
    
    loginPage = new LoginPage();
    await loginPage.initialize();
    
    // Export for debugging
    if (window.location.hostname === 'localhost') {
        window.loginPage = loginPage;
    }
});

window.loginPage = loginPage;

console.log('✅ Login Page Script loaded successfully');