// ===== LOGIN PAGE JAVASCRIPT - REAL DATABASE ONLY =====

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const user = getCurrentUser();
    if (user) {
        showToast('Ya tienes una sesión activa', 'info');
        redirectBasedOnRole(user);
        return;
    }
    
    setupLoginForm();
    setupFormValidation();
});

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup password toggle
    const passwordToggle = document.querySelector('.password-toggle');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', togglePassword);
    }
    
    // Setup "forgot password" link
    const forgotLink = document.querySelector('.forgot-password');
    if (forgotLink) {
        forgotLink.addEventListener('click', handleForgotPassword);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('login-btn');
    
    // Validation
    if (!email || !password) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('El email no es válido', 'error');
        return;
    }
    
    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
    
    try {
        console.log('🔐 Starting login process for:', email);
        
        // Debug: Show what we're sending
        console.log('📤 Sending to API:', { email, password: '***' });
        
        const result = await login(email, password);
        
        console.log('📥 Login result:', result);
        
        if (result.success) {
            console.log('✅ Login successful:', result.user);
            
            // Clear form
            document.getElementById('login-form').reset();
            
            // Show success message
            showToast('¡Bienvenido de vuelta!', 'success');
            
            // Redirect is handled by the login function
            
        } else {
            throw new Error(result.message || 'Error en el inicio de sesión');
        }
        
    } catch (error) {
        console.error('❌ Login failed:', error);
        
        // Show appropriate error message
        let errorMessage = error.message;
        
        if (error.message.includes('servidor')) {
            errorMessage = 'No se pudo conectar con el servidor. Verifica que esté funcionando.';
        } else if (error.message.includes('Credenciales')) {
            errorMessage = 'Email o contraseña incorrectos. Verifica tus datos.';
        }
        
        showToast(errorMessage, 'error');
        
        // Clear password field for security
        document.getElementById('password').value = '';
        
    } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> ${originalText}`;
    }
}

function setupFormValidation() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Real-time email validation
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateEmailField(this);
        });
        
        emailInput.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateEmailField(this);
            }
        });
    }
    
    // Password validation
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePasswordField(this);
        });
    }
}

function validateEmailField(emailInput) {
    const email = emailInput.value.trim();
    
    if (email && !isValidEmail(email)) {
        emailInput.classList.add('error');
        showFieldError(emailInput, 'Email no válido');
        return false;
    } else {
        emailInput.classList.remove('error');
        hideFieldError(emailInput);
        return true;
    }
}

function validatePasswordField(passwordInput) {
    const password = passwordInput.value;
    
    if (password && password.length < 6) {
        passwordInput.classList.add('error');
        showFieldError(passwordInput, 'La contraseña debe tener al menos 6 caracteres');
        return false;
    } else {
        passwordInput.classList.remove('error');
        hideFieldError(passwordInput);
        return true;
    }
}

function showFieldError(field, message) {
    // Remove existing error message
    hideFieldError(field);
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    // Insert after field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

function hideFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function handleForgotPassword(event) {
    event.preventDefault();
    showToast('Función de recuperación de contraseña próximamente', 'info');
    // In a real app, this would redirect to a password reset page
    // window.location.href = 'forgot-password.html';
}

// Handle "Enter" key in form fields
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        
        if (activeElement.id === 'email') {
            document.getElementById('password').focus();
        } else if (activeElement.id === 'password') {
            document.getElementById('login-form').dispatchEvent(new Event('submit'));
        }
    }
});

// Auto-focus on email field when page loads
window.addEventListener('load', function() {
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }
});

// Export functions for use in HTML
window.togglePassword = togglePassword;
window.handleLogin = handleLogin;
window.handleForgotPassword = handleForgotPassword;