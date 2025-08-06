// frontend/js/login.js - Sistema de autenticación integrado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Iniciando página de login');
    
    // Verificar si APIClient y AuthManager están disponibles
    waitForDependencies().then(() => {
        initializeLogin();
    });
});

// Esperar a que todas las dependencias estén cargadas
async function waitForDependencies() {
    let attempts = 0;
    const maxAttempts = 50;
    
    while ((!window.apiClient || !window.authManager) && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!window.apiClient || !window.authManager) {
        console.error('❌ Dependencias no disponibles después de 5 segundos');
        showError('Error de configuración. Por favor recarga la página.');
        return;
    }
    
    console.log('✅ Dependencias cargadas correctamente');
}

function initializeLogin() {
    // Verificar si ya está autenticado (esto ya lo maneja AuthManager)
    if (authManager.isAuthenticated()) {
        console.log('👤 Usuario ya autenticado, redirigiendo...');
        showSuccess('Ya estás autenticado. Redirigiendo...');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
        return;
    }
    
    // Configurar formulario
    setupLoginForm();
    
    // Configurar botones adicionales
    setupAdditionalButtons();
    
    // Verificar conectividad del servidor
    checkServerHealth();
}

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (!loginForm) {
        console.error('❌ Formulario de login no encontrado');
        return;
    }
    
    // Manejar submit del formulario
    loginForm.addEventListener('submit', handleLoginSubmit);
    
    // Validación en tiempo real
    emailInput?.addEventListener('blur', validateEmailField);
    passwordInput?.addEventListener('input', validatePasswordField);
    
    // Enter key para enviar formulario
    passwordInput?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLoginSubmit(e);
        }
    });
    
    // Auto-focus en email al cargar
    emailInput?.focus();
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Limpiar errores previos
    clearAllErrors();
    
    // Validar campos
    if (!validateLoginInputs(email, password)) {
        return;
    }
    
    // Mostrar estado de carga
    setLoadingState(true);
    
    try {
        console.log('🔐 Enviando credenciales para:', email);
        
        // Usar el AuthManager para hacer login
        const success = await authManager.login(email, password);
        
        if (success) {
            // Limpiar formulario
            emailInput.value = '';
            passwordInput.value = '';
            
            // El AuthManager ya se encarga de la redirección
            console.log('✅ Login completado exitosamente');
        }
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        handleLoginError(error);
        
    } finally {
        setLoadingState(false);
    }
}

function validateLoginInputs(email, password) {
    let isValid = true;
    
    // Validar email
    if (!email) {
        showFieldError('email', 'El email es requerido');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('email', 'Formato de email inválido');
        isValid = false;
    }
    
    // Validar contraseña
    if (!password) {
        showFieldError('password', 'La contraseña es requerida');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('password', 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    }
    
    return isValid;
}

function validateEmailField() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    
    if (email && !isValidEmail(email)) {
        showFieldError('email', 'Formato de email inválido');
        return false;
    } else {
        clearFieldError('email');
        return true;
    }
}

function validatePasswordField() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    
    if (password && password.length > 0 && password.length < 6) {
        showFieldError('password', 'Mínimo 6 caracteres');
        return false;
    } else {
        clearFieldError('password');
        return true;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function handleLoginError(error) {
    let errorMessage = 'Error desconocido';
    
    if (typeof error === 'string') {
        errorMessage = error;
    } else if (error.message) {
        errorMessage = error.message;
    } else if (error.error) {
        errorMessage = error.error;
    }
    
    // Manejar errores específicos
    if (errorMessage.includes('404') || errorMessage.includes('conexión')) {
        showError('No se puede conectar con el servidor. Verifica tu conexión.');
    } else if (errorMessage.includes('401') || errorMessage.includes('credenciales') || errorMessage.includes('Invalid')) {
        showError('Email o contraseña incorrectos');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    } else if (errorMessage.includes('500')) {
        showError('Error del servidor. Por favor intenta más tarde.');
    } else {
        showError(errorMessage);
    }
}

function setLoadingState(loading) {
    const loginBtn = document.getElementById('loginBtn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (loading) {
        if (loginBtn) {
            loginBtn.textContent = 'Iniciando sesión...';
            loginBtn.disabled = true;
        }
        if (emailInput) emailInput.disabled = true;
        if (passwordInput) passwordInput.disabled = true;
        
        // Mostrar loading global
        showLoading('Verificando credenciales...');
        
    } else {
        if (loginBtn) {
            loginBtn.textContent = 'Iniciar Sesión';
            loginBtn.disabled = false;
        }
        if (emailInput) emailInput.disabled = false;
        if (passwordInput) passwordInput.disabled = false;
        
        // Ocultar loading global
        hideLoading();
    }
}

// === FUNCIONES DE ERRORES Y ÉXITO ===

function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    const inputElements = document.querySelectorAll('.form-input');
    
    errorElements.forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    
    inputElements.forEach(el => {
        el.classList.remove('error');
    });
}

// Usar el sistema de notificaciones global
function showSuccess(message) {
    if (typeof window.showSuccess === 'function') {
        window.showSuccess(message);
    } else {
        showToast(message, 'success');
    }
}

function showError(message) {
    if (typeof window.showError === 'function') {
        window.showError(message);
    } else {
        showToast(message, 'error');
    }
}

// Fallback para el sistema de toast local
function showToast(message, type = 'info') {
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
        case 'warning':
            toast.style.background = '#f59e0b';
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

// === BOTONES ADICIONALES ===

function setupAdditionalButtons() {
    // Botón de "¿Olvidaste tu contraseña?"
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', showForgotPassword);
    }
    
    // Botón de "Crear cuenta"
    const createAccountBtn = document.getElementById('createAccountBtn');
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', () => {
            window.location.href = '/pages/register.html';
        });
    }
    
    // Botones sociales (por implementar)
    const googleBtn = document.getElementById('googleLoginBtn');
    const facebookBtn = document.getElementById('facebookLoginBtn');
    
    if (googleBtn) googleBtn.addEventListener('click', loginWithGoogle);
    if (facebookBtn) facebookBtn.addEventListener('click', loginWithFacebook);
}

function loginWithGoogle() {
    showModal('googleModal');
}

function loginWithFacebook() {
    showModal('facebookModal');
}

function processGoogleLogin() {
    closeModal();
    showWarning('Login con Google no implementado aún');
}

function processFacebookLogin() {
    closeModal();
    showWarning('Login con Facebook no implementado aún');
}

// === MODALS ===

function showForgotPassword() {
    showModal('forgotModal');
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

async function sendPasswordReset() {
    const emailInput = document.getElementById('forgotEmail');
    const email = emailInput?.value.trim();
    
    if (!email || !isValidEmail(email)) {
        showError('Por favor ingresa un email válido');
        return;
    }
    
    try {
        showLoading('Enviando email de recuperación...');
        
        // Aquí harías la petición al backend
        // const response = await apiClient.resetPassword(email);
        
        // Por ahora simular
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        hideLoading();
        closeModal();
        showSuccess('Si el email existe, recibirás instrucciones de recuperación');
        
    } catch (error) {
        hideLoading();
        showError('Error al enviar el email de recuperación');
    }
}

// === NAVEGACIÓN ===

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/index.html';
    }
}

// === VERIFICAR SERVIDOR ===

async function checkServerHealth() {
    try {
        console.log('🏥 Verificando salud del servidor...');
        
        // Usar el APIClient para verificar la conectividad
        const response = await fetch(`${API_CONFIG.baseURL}/health`);
        
        if (response.ok) {
            console.log('✅ Servidor disponible');
            const healthStatus = document.getElementById('server-status');
            if (healthStatus) {
                healthStatus.textContent = 'Servidor conectado';
                healthStatus.className = 'server-status online';
            }
        } else {
            throw new Error('Server not responding');
        }
        
    } catch (error) {
        console.warn('⚠️ Servidor no disponible:', error.message);
        showWarning('Servidor no disponible. Algunas funciones pueden no funcionar.');
        
        const healthStatus = document.getElementById('server-status');
        if (healthStatus) {
            healthStatus.textContent = 'Servidor desconectado';
            healthStatus.className = 'server-status offline';
        }
    }
}

// === DEMO / TESTING ===

function fillDemoCredentials() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput && passwordInput) {
        emailInput.value = 'demo@petstyle.com';
        passwordInput.value = 'demo123';
        
        showSuccess('Credenciales de demo cargadas');
    }
}

// Exponer función demo para botón en HTML
window.fillDemoCredentials = fillDemoCredentials;

// === EVENT LISTENERS GLOBALES ===

// Click outside modal to close
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});

// Escape key to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// === FUNCIONES DE UTILIDAD ===

function showWarning(message) {
    if (typeof window.showWarning === 'function') {
        window.showWarning(message);
    } else {
        showToast(message, 'warning');
    }
}

// Agregar CSS para las animaciones si no existen
function addToastAnimations() {
    if (!document.getElementById('toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideInDown {
                from { transform: translate(-50%, -100%); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            .form-input.error {
                border-color: #ef4444 !important;
                box-shadow: 0 0 0 1px #ef4444;
            }
            
            .server-status {
                font-size: 12px;
                padding: 4px 8px;
                border-radius: 4px;
                display: inline-block;
            }
            
            .server-status.online {
                background-color: #10b981;
                color: white;
            }
            
            .server-status.offline {
                background-color: #ef4444;
                color: white;
            }
        `;
        document.head.appendChild(style);
    }
}

// Ejecutar al cargar
addToastAnimations();