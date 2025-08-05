class RegisterPage {
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
            this.showToast('Ya tienes una sesión activa', 'info');
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 1500);
        }
    }

    bindEvents() {
        const form = document.getElementById('registerForm');
        form.addEventListener('submit', (e) => this.handleRegister(e));

        // Validación en tiempo real
        document.getElementById('name').addEventListener('blur', (e) => {
            this.validateName(e.target.value);
        });

        document.getElementById('email').addEventListener('blur', (e) => {
            this.validateEmail(e.target.value);
        });

        document.getElementById('password').addEventListener('blur', (e) => {
            this.validatePassword(e.target.value);
        });

        document.getElementById('confirmPassword').addEventListener('blur', (e) => {
            this.validateConfirmPassword(e.target.value);
        });

        document.getElementById('phone').addEventListener('blur', (e) => {
            this.validatePhone(e.target.value);
        });

        // Limpiar errores al escribir
        document.getElementById('name').addEventListener('input', () => {
            this.hideFieldError('nameError');
        });

        document.getElementById('email').addEventListener('input', () => {
            this.hideFieldError('emailError');
        });

        document.getElementById('password').addEventListener('input', () => {
            this.hideFieldError('passwordError');
            // También validar confirmPassword si ya tiene contenido
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (confirmPassword) {
                this.validateConfirmPassword(confirmPassword);
            }
        });

        document.getElementById('confirmPassword').addEventListener('input', () => {
            this.hideFieldError('confirmPasswordError');
        });

        document.getElementById('phone').addEventListener('input', () => {
            this.hideFieldError('phoneError');
        });
    }

    validateName(name) {
        if (!name || name.trim().length < 2) {
            this.showFieldError('nameError', 'El nombre debe tener al menos 2 caracteres');
            return false;
        } else {
            this.hideFieldError('nameError');
            return true;
        }
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

    validateConfirmPassword(confirmPassword) {
        const password = document.getElementById('password').value;
        
        if (!confirmPassword) {
            this.showFieldError('confirmPasswordError', 'Confirma tu contraseña');
            return false;
        } else if (password !== confirmPassword) {
            this.showFieldError('confirmPasswordError', 'Las contraseñas no coinciden');
            return false;
        } else {
            this.hideFieldError('confirmPasswordError');
            return true;
        }
    }

    validatePhone(phone) {
        // Teléfono es opcional, pero si se proporciona debe ser válido
        if (phone && phone.length < 10) {
            this.showFieldError('phoneError', 'El teléfono debe tener al menos 10 dígitos');
            return false;
        } else {
            this.hideFieldError('phoneError');
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

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const phone = document.getElementById('phone').value.trim();
        const registerBtn = document.getElementById('registerBtn');

        // Validar todos los campos
        const isNameValid = this.validateName(name);
        const isEmailValid = this.validateEmail(email);
        const isPasswordValid = this.validatePassword(password);
        const isConfirmPasswordValid = this.validateConfirmPassword(confirmPassword);
        const isPhoneValid = this.validatePhone(phone);

        if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isPhoneValid) {
            return;
        }

        // Mostrar estado de cargando
        const originalText = registerBtn.innerHTML;
        registerBtn.innerHTML = '<span class="loading-spinner"></span>Creando cuenta...';
        registerBtn.disabled = true;

        try {
            // Simular llamada a API
            await this.simulateRegister(name, email, password, phone);
            
            // Guardar token (simulado)
            localStorage.setItem('authToken', 'register_token_' + Date.now());
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);
            if (phone) {
                localStorage.setItem('userPhone', phone);
            }
            
            this.showToast('¡Cuenta creada exitosamente!', 'success');
            
            // Redireccionar después de 1.5 segundos
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 1500);
            
        } catch (error) {
            console.error('Register error:', error);
            
            if (error.message.includes('email') || error.message.includes('existe')) {
                this.showFieldError('emailError', 'Este correo ya está registrado');
            } else {
                this.showToast('Error al crear la cuenta', 'error');
            }
        } finally {
            // Restaurar botón después de 2 segundos
            setTimeout(() => {
                registerBtn.innerHTML = originalText;
                registerBtn.disabled = false;
            }, 2000);
        }
    }

    async simulateRegister(name, email, password, phone) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular verificación de email existente
        const existingEmails = [
            'admin@petstyle.com',
            'test@existing.com'
        ];
        
        if (existingEmails.includes(email)) {
            throw new Error('Este email ya existe');
        }
        
        return { success: true, token: 'register_token' };
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
        window.location.href = 'login.html';
    }
}

function loginWithGoogle() {
    document.getElementById('googleModal').classList.add('active');
}

function loginWithFacebook() {
    document.getElementById('facebookModal').classList.add('active');
}

function closeModal() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
}

async function processGoogleRegister() {
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
        
        localStorage.setItem('authToken', 'google_register_token_' + Date.now());
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        
        closeModal();
        
        const registerPage = new RegisterPage();
        registerPage.showToast('¡Registro con Google exitoso!', 'success');
        
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1500);
        
    } catch (error) {
        const registerPage = new RegisterPage();
        registerPage.showToast('Error al registrarse con Google', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function processFacebookRegister() {
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
        
        localStorage.setItem('authToken', 'facebook_register_token_' + Date.now());
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        
        closeModal();
        
        const registerPage = new RegisterPage();
        registerPage.showToast('¡Registro con Facebook exitoso!', 'success');
        
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1500);
        
    } catch (error) {
        const registerPage = new RegisterPage();
        registerPage.showToast('Error al registrarse con Facebook', 'error');
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
    new RegisterPage();
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