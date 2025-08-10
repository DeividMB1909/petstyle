// frontend/js/login.js
class LoginHandler {
    constructor() {
        this.form = null;
        this.submitButton = null;
        this.isSubmitting = false;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupElements();
            this.setupEventListeners();
            this.checkExistingAuth();
            CONFIG.log('info', 'LoginHandler inicializado');
        });
    }

    setupElements() {
        this.form = document.getElementById('login-form');
        this.submitButton = this.form?.querySelector('button[type="submit"]');
        
        if (!this.form) {
            CONFIG.log('error', 'Formulario de login no encontrado');
            return;
        }
        
        // Referencias a campos
        this.fields = {
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            rememberMe: document.getElementById('remember-me')
        };
        
        // Referencias a elementos de error
        this.errorElements = {
            email: document.getElementById('email-error'),
            password: document.getElementById('password-error'),
            general: document.getElementById('general-error') || this.createGeneralErrorElement()
        };
        
        CONFIG.log('debug', 'Elementos del formulario configurados');
    }

    createGeneralErrorElement() {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'general-error';
        errorDiv.className = 'error-message general-error';
        errorDiv.style.display = 'none';
        
        // Insertar después del formulario o antes del botón submit
        const insertBefore = this.submitButton || this.form.lastElementChild;
        insertBefore.parentNode.insertBefore(errorDiv, insertBefore);
        
        return errorDiv;
    }

    setupEventListeners() {
        if (!this.form) return;

        // Submit del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Validación en tiempo real
        if (this.fields.email) {
            this.fields.email.addEventListener('blur', () => this.validateField('email'));
            this.fields.email.addEventListener('input', () => this.clearFieldError('email'));
        }

        if (this.fields.password) {
            this.fields.password.addEventListener('blur', () => this.validateField('password'));
            this.fields.password.addEventListener('input', () => this.clearFieldError('password'));
        }

        // Enter en campos
        Object.values(this.fields).forEach(field => {
            if (field) {
                field.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !this.isSubmitting) {
                        this.form.requestSubmit();
                    }
                });
            }
        });

        CONFIG.log('debug', 'Event listeners configurados');
    }

    checkExistingAuth() {
        if (authManager.isAuthenticated()) {
            CONFIG.log('info', 'Usuario ya autenticado, redirigiendo');
            authManager.redirectAfterLogin();
        }
    }

    // =================== VALIDACIÓN ===================
    validateField(fieldName) {
        const field = this.fields[fieldName];
        const value = field?.value?.trim() || '';
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'email':
                const emailValidation = authManager.validateEmail(value);
                isValid = emailValidation.valid;
                errorMessage = emailValidation.message;
                break;

            case 'password':
                const passwordValidation = authManager.validatePassword(value);
                isValid = passwordValidation.valid;
                errorMessage = passwordValidation.message;
                break;
        }

        this.setFieldError(fieldName, isValid ? '' : errorMessage);
        return isValid;
    }

    validateForm() {
        let isValid = true;
        
        // Validar cada campo
        Object.keys(this.fields).forEach(fieldName => {
            if (fieldName !== 'rememberMe') { // Skip checkbox
                if (!this.validateField(fieldName)) {
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    setFieldError(fieldName, message) {
        const field = this.fields[fieldName];
        const errorElement = this.errorElements[fieldName];
        
        if (!field || !errorElement) return;

        if (message) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            field.classList.add('error');
        } else {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
            field.classList.remove('error');
        }
    }

    clearFieldError(fieldName) {
        this.setFieldError(fieldName, '');
    }

    setGeneralError(message) {
        const errorElement = this.errorElements.general;
        
        if (message) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        } else {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    clearAllErrors() {
        Object.keys(this.errorElements).forEach(key => {
            this.setFieldError(key, '');
        });
        this.setGeneralError('');
    }

    // =================== MANEJO DEL FORMULARIO ===================
    async handleSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) {
            CONFIG.log('debug', 'Submit ya en progreso, ignorando');
            return;
        }

        CONFIG.log('info', 'Procesando login');
        
        // Limpiar errores previos
        this.clearAllErrors();
        
        // Validar formulario
        if (!this.validateForm()) {
            CONFIG.log('warn', 'Formulario con errores de validación');
            return;
        }

        // Obtener datos del formulario
        const formData = this.getFormData();
        
        // Deshabilitar formulario
        this.setSubmitState(true);

        try {
            // Intentar login
            const result = await authManager.login(
                formData.email,
                formData.password,
                formData.rememberMe
            );

            if (result.success) {
                this.handleLoginSuccess(result);
            } else {
                this.handleLoginError(result.message);
            }

        } catch (error) {
            CONFIG.log('error', 'Error inesperado en login', error);
            this.handleLoginError('Error inesperado. Intenta nuevamente.');
        } finally {
            this.setSubmitState(false);
        }
    }

    getFormData() {
        return {
            email: this.fields.email?.value?.trim() || '',
            password: this.fields.password?.value || '',
            rememberMe: this.fields.rememberMe?.checked || false
        };
    }

    setSubmitState(isSubmitting) {
        this.isSubmitting = isSubmitting;
        
        if (this.submitButton) {
            this.submitButton.disabled = isSubmitting;
            
            if (isSubmitting) {
                this.submitButton.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    Iniciando sesión...
                `;
            } else {
                this.submitButton.innerHTML = `
                    <i class="fas fa-sign-in-alt"></i>
                    Iniciar Sesión
                `;
            }
        }
        
        // Deshabilitar/habilitar campos
        Object.values(this.fields).forEach(field => {
            if (field) {
                field.disabled = isSubmitting;
            }
        });
    }

    handleLoginSuccess(result) {
        CONFIG.log('info', 'Login exitoso', { user: result.user });
        
        // Mostrar mensaje de éxito
        this.showSuccessMessage(result.message);
        
        // Limpiar formulario
        this.form.reset();
        
        // Redirigir después de un breve delay
        setTimeout(() => {
            authManager.redirectAfterLogin();
        }, 1000);
    }

    handleLoginError(errorMessage) {
        CONFIG.log('warn', 'Error en login', { message: errorMessage });
        
        // Mostrar error general
        this.setGeneralError(errorMessage);
        
        // Enfocar el primer campo con error o el email
        const firstErrorField = this.fields.email || Object.values(this.fields)[0];
        if (firstErrorField && !firstErrorField.disabled) {
            firstErrorField.focus();
        }
        
        // Vibrar en dispositivos móviles
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    showSuccessMessage(message) {
        // Crear elemento de éxito temporal
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            ${message}
        `;
        
        // Insertar en el formulario
        const insertBefore = this.submitButton || this.form.lastElementChild;
        insertBefore.parentNode.insertBefore(successDiv, insertBefore);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    // =================== UTILIDADES PÚBLICAS ===================
    focusFirstField() {
        const firstField = this.fields.email || Object.values(this.fields)[0];
        if (firstField && !firstField.disabled) {
            firstField.focus();
        }
    }

    clearForm() {
        if (this.form) {
            this.form.reset();
            this.clearAllErrors();
        }
    }

    prefillEmail(email) {
        if (this.fields.email && email) {
            this.fields.email.value = email;
        }
    }
}

// =================== UTILIDADES GLOBALES ===================
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const eyeIcon = document.getElementById(`${fieldId}-eye`);
    
    if (!field || !eyeIcon) return;
    
    const isPassword = field.type === 'password';
    
    field.type = isPassword ? 'text' : 'password';
    eyeIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    
    CONFIG.log('debug', `Visibilidad de password cambiada: ${!isPassword}`);
}

function goToRegister() {
    window.location.href = CONFIG.ROUTES.REGISTER;
}

function goToHome() {
    window.location.href = CONFIG.ROUTES.HOME;
}

// =================== INICIALIZACIÓN ===================
const loginHandler = new LoginHandler();

// Hacer disponible globalmente para debugging
if (CONFIG.isDevelopment()) {
    window.loginHandler = loginHandler;
}

// Agregar estilos dinámicos si no existen
document.addEventListener('DOMContentLoaded', () => {
    addDynamicStyles();
});

function addDynamicStyles() {
    const existingStyles = document.getElementById('login-dynamic-styles');
    if (existingStyles) return;

    const styles = `
        .error-message {
            color: #e74c3c;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: none;
        }
        
        .success-message {
            color: #27ae60;
            font-size: 0.875rem;
            margin: 1rem 0;
            padding: 0.75rem;
            background: rgba(39, 174, 96, 0.1);
            border: 1px solid rgba(39, 174, 96, 0.3);
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .form-group input.error {
            border-color: #e74c3c;
            box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
        }
        
        .general-error {
            margin: 1rem 0;
            padding: 0.75rem;
            background: rgba(231, 76, 60, 0.1);
            border: 1px solid rgba(231, 76, 60, 0.3);
            border-radius: 0.5rem;
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .fa-spinner {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'login-dynamic-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}