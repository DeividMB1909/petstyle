class LoginPage {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        // COMENTADO: No verificar autenticación automáticamente
        // this.checkAuthentication();
    }

    // OPCIONAL: Mantener la función pero no llamarla automáticamente
    checkAuthentication() {
        // Simulación de verificación de token
        const token = localStorage.getItem('authToken');
        if (token && token !== 'null') {
            // Ya está autenticado, redirigir
            this.showToast('Ya has iniciado sesión', 'info');
            setTimeout(() => {
                window.location.href = 'main.html'; // CORREGIDO: ahora va a main.html
            }, 1500);
        }
    }

    bindEvents() {
        const form = document.getElementById('loginForm');
        form.addEventListener('submit', (e) => this.handleLogin(e));

        // Validación en tiempo real
        document.getElementById('email').addEventListener('blur', (e) => {
            this.validateEmail(e.target.value);
        });

        document.getElementById('password').addEventListener('blur', (e) => {
            this.validatePassword(e.target.value);
        });

        // Limpiar errores al escribir
        document.getElementById('email').addEventListener('input', () => {
            this.hideFieldError('emailError');
        });

        document.getElementById('password').addEventListener('input', () => {
            this.hideFieldError('passwordError');
        });
    }

    validateEmail(email) {
        if (!email) {
            this.showFieldError('emailError', 'El correo es requerido');
            return false;
        } else if (!this.isValidEmail(email)) {
            this.showFieldError('emailError', 'Ingresa un correo válido');
            return false;
        } else {
            this.hideFieldError('emailError');
            return true;
        }
    }

    validatePassword(password) {
        if (!password) {
            this.showFieldError('passwordError', 'La contraseña es requerida');
            return false;
        } else if (password.length < 6) {
            this.showFieldError('passwordError', 'Mínimo 6 caracteres');
            return false;
        } else {
            this.hideFieldError('passwordError');
            return true;
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(fieldId);
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    hideFieldError(fieldId) {
        const errorElement = document.getElementById(fieldId);
        errorElement.classList.remove('show');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');

        // Validar campos
        const isEmailValid = this.validateEmail(email);
        const isPasswordValid = this.validatePassword(password);

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        // Mostrar estado de cargando
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<span class="loading-spinner"></span>Iniciando sesión...';
        loginBtn.disabled = true;

        try {
            // Simular llamada a API
            await this.simulateLogin(email, password);
            
            // Guardar token (simulado)
            localStorage.setItem('authToken', 'mock_token_' + Date.now());
            localStorage.setItem('userEmail', email);
            
            this.showToast('¡Bienvenido a PetStyle!', 'success');
            
            // Redireccionar después de 1.5 segundos
            setTimeout(() => {
                window.location.href = 'main.html'; // CORRECTO: ya estaba bien
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.message.includes('credenciales')) {
                this.showFieldError('passwordError', 'Credenciales incorrectas');
            } else {
                this.showToast('Error al iniciar sesión', 'error');
            }
        } finally {
            // Restaurar botón después de 2 segundos
            setTimeout(() => {
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }, 2000);
        }
    }

    async simulateLogin(email, password) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular validación
        const validCredentials = [
            { email: 'demo@petstyle.com', password: '123456' },
            { email: 'usuario@test.com', password: 'password' },
            { email: 'admin@petstyle.com', password: 'admin123' }
        ];
        
        const isValid = validCredentials.some(cred => 
            cred.email === email && cred.password === password
        );
        
        if (!isValid) {
            throw new Error('Credenciales incorrectas');
        }
        
        return { success: true, token: 'mock_token' };
    }

    showToast(message, type = 'info', duration = 3000) {
        // Remover toast existente
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Mostrar toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Ocultar toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Funciones globales
function goBack() {
    // Verificar si hay historial
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'profile.html';
    }
}

function loginWithGoogle() {
    document.getElementById('googleModal').classList.add('active');
}

function loginWithFacebook() {
    document.getElementById('facebookModal').classList.add('active');
}

function showForgotPassword() {
    document.getElementById('forgotModal').classList.add('active');
}

function closeModal() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
}

async function processGoogleLogin() {
    const modal = document.getElementById('googleModal');
    const btn = modal.querySelector('.modal-btn.primary');
    const originalText = btn.textContent;
    
    btn.innerHTML = '<span class="loading-spinner"></span>Conectando...';
    btn.disabled = true;
    
    try {
        // Simular autenticación con Google
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular datos de usuario de Google
        const userData = {
            email: 'usuario@gmail.com',
            name: 'Usuario Google',
            provider: 'google'
        };
        
        localStorage.setItem('authToken', 'google_token_' + Date.now());
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        
        closeModal();
        
        const loginPage = new LoginPage();
        loginPage.showToast('¡Conectado con Google exitosamente!', 'success');
        
        setTimeout(() => {
            window.location.href = 'main.html'; // CORREGIDO: cambié de index.html a main.html
        }, 1500);
        
    } catch (error) {
        const loginPage = new LoginPage();
        loginPage.showToast('Error al conectar con Google', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function processFacebookLogin() {
    const modal = document.getElementById('facebookModal');
    const btn = modal.querySelector('.modal-btn.primary');
    const originalText = btn.textContent;
    
    btn.innerHTML = '<span class="loading-spinner"></span>Conectando...';
    btn.disabled = true;
    
    try {
        // Simular autenticación con Facebook
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular datos de usuario de Facebook
        const userData = {
            email: 'usuario@facebook.com',
            name: 'Usuario Facebook',
            provider: 'facebook'
        };
        
        localStorage.setItem('authToken', 'facebook_token_' + Date.now());
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        
        closeModal();
        
        const loginPage = new LoginPage();
        loginPage.showToast('¡Conectado con Facebook exitosamente!', 'success');
        
        setTimeout(() => {
            window.location.href = 'main.html'; // CORRECTO: ya estaba bien
        }, 1500);
        
    } catch (error) {
        const loginPage = new LoginPage();
        loginPage.showToast('Error al conectar con Facebook', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function sendPasswordReset() {
    const emailInput = document.getElementById('forgotEmail');
    const email = emailInput.value.trim();
    const btn = event.target;
    const originalText = btn.textContent;
    
    if (!email) {
        const loginPage = new LoginPage();
        loginPage.showToast('Ingresa tu correo electrónico', 'error');
        return;
    }
    
    if (!email.includes('@')) {
        const loginPage = new LoginPage();
        loginPage.showToast('Ingresa un correo válido', 'error');
        return;
    }
    
    btn.innerHTML = '<span class="loading-spinner"></span>Enviando...';
    btn.disabled = true;
    
    try {
        // Simular envío de email
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        closeModal();
        
        const loginPage = new LoginPage();
        loginPage.showToast('Enlace de recuperación enviado a tu correo', 'success', 4000);
        
        // Limpiar campo
        emailInput.value = '';
        
    } catch (error) {
        const loginPage = new LoginPage();
        loginPage.showToast('Error al enviar el enlace', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// Cerrar modales al hacer clic fuera
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});

// Cerrar modales con tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Inicializar página cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});

// Prevenir zoom en iOS Safari al hacer focus en inputs
document.addEventListener('touchstart', {});

// Ajustar viewport en dispositivos móviles
function adjustViewport() {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (window.innerWidth <= 414) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
}

window.addEventListener('resize', adjustViewport);
adjustViewport();