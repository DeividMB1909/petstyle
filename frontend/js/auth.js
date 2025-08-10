// ===== AUTHENTICATION SYSTEM =====

// Get current user from localStorage
function getCurrentUser() {
    try {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Set current user in localStorage
function setCurrentUser(user) {
    try {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
        return true;
    } catch (error) {
        console.error('Error setting current user:', error);
        return false;
    }
}

// Login function
async function login(email, password) {
    try {
        // First try demo accounts
        const demoUser = checkDemoAccount(email, password);
        if (demoUser) {
            setCurrentUser(demoUser);
            showToast('Inicio de sesión exitoso', 'success');
            return { success: true, user: demoUser };
        }
        
        // Try API login
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            setCurrentUser(data.user);
            showToast('Inicio de sesión exitoso', 'success');
            return { success: true, user: data.user };
        } else {
            throw new Error(data.message || 'Credenciales incorrectas');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        const message = error.message || 'Error al iniciar sesión';
        showToast(message, 'error');
        return { success: false, message };
    }
}

// Register function
async function register(userData) {
    try {
        // Validate required fields
        const requiredFields = ['nombre', 'email', 'password'];
        for (const field of requiredFields) {
            if (!userData[field]) {
                throw new Error(`El campo ${field} es obligatorio`);
            }
        }
        
        // Validate email
        if (!isValidEmail(userData.email)) {
            throw new Error('El email no es válido');
        }
        
        // Validate password
        const passwordValidation = validatePassword(userData.password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors[0]);
        }
        
        // Try API registration
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            setCurrentUser(data.user);
            showToast('Registro exitoso', 'success');
            return { success: true, user: data.user };
        } else {
            throw new Error(data.message || 'Error en el registro');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific error cases
        let message = error.message;
        if (error.message.includes('duplicate') || error.message.includes('exists')) {
            message = 'Este email ya está registrado';
        } else if (error.message.includes('validation')) {
            message = 'Datos de registro inválidos';
        }
        
        showToast(message, 'error');
        return { success: false, message };
    }
}

// Logout function
function logout() {
    try {
        // Clear user data
        setCurrentUser(null);
        
        // Clear user-specific data
        const user = getCurrentUser();
        if (user) {
            localStorage.removeItem(`favorites_${user.email}`);
            localStorage.removeItem(`cart_${user.email}`);
        }
        
        showToast('Sesión cerrada correctamente', 'success');
        
        // Redirect to main page
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1000);
        
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Error al cerrar sesión', 'error');
        return false;
    }
}

// Check demo accounts
function checkDemoAccount(email, password) {
    const demoAccounts = [
        {
            _id: 'demo-admin',
            email: 'admin@petstyle.com',
            password: 'admin123',
            nombre: 'Administrador',
            role: 'admin',
            fechaRegistro: new Date().toISOString()
        },
        {
            _id: 'demo-user',
            email: 'demo@petstyle.com',
            password: 'demo123',
            nombre: 'Usuario Demo',
            role: 'user',
            fechaRegistro: new Date().toISOString()
        },
        {
            _id: 'demo-user2',
            email: 'usuario@petstyle.com',
            password: 'usuario123',
            nombre: 'Usuario PetStyle',
            role: 'user',
            fechaRegistro: new Date().toISOString()
        }
    ];
    
    const account = demoAccounts.find(acc => 
        acc.email === email && acc.password === password
    );
    
    if (account) {
        // Don't include password in returned user object
        const { password: _, ...userWithoutPassword } = account;
        return userWithoutPassword;
    }
    
    return null;
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && (user.role === 'admin' || user.email === 'admin@petstyle.com');
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Require authentication (redirect to login if not logged in)
function requireAuth(redirectUrl = 'login.html') {
    if (!isLoggedIn()) {
        showToast('Debes iniciar sesión para acceder a esta página', 'warning');
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);
        return false;
    }
    return true;
}

// Require admin privileges
function requireAdmin(redirectUrl = 'main.html') {
    if (!isAdmin()) {
        showToast('Acceso denegado. Se requieren permisos de administrador.', 'error');
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);
        return false;
    }
    return true;
}

// Update user profile
async function updateProfile(userData) {
    try {
        const user = getCurrentUser();
        if (!user) {
            throw new Error('No hay usuario logueado');
        }
        
        // Validate email if changed
        if (userData.email && userData.email !== user.email) {
            if (!isValidEmail(userData.email)) {
                throw new Error('El email no es válido');
            }
        }
        
        // Try API update (if backend supports it)
        try {
            const response = await fetch(`http://localhost:3000/api/auth/profile/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            if (response.ok) {
                const data = await response.json();
                const updatedUser = { ...user, ...data.user };
                setCurrentUser(updatedUser);
                showToast('Perfil actualizado correctamente', 'success');
                return { success: true, user: updatedUser };
            }
        } catch (apiError) {
            console.log('API update failed, using local update');
        }
        
        // Fallback to local update
        const updatedUser = { ...user, ...userData };
        setCurrentUser(updatedUser);
        showToast('Perfil actualizado correctamente', 'success');
        return { success: true, user: updatedUser };
        
    } catch (error) {
        console.error('Profile update error:', error);
        showToast(error.message || 'Error al actualizar perfil', 'error');
        return { success: false, message: error.message };
    }
}

// Change password
async function changePassword(currentPassword, newPassword) {
    try {
        const user = getCurrentUser();
        if (!user) {
            throw new Error('No hay usuario logueado');
        }
        
        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors[0]);
        }
        
        // Try API password change
        const response = await fetch(`http://localhost:3000/api/auth/change-password/${user._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                currentPassword, 
                newPassword 
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('Contraseña cambiada correctamente', 'success');
            return { success: true };
        } else {
            throw new Error(data.message || 'Error al cambiar contraseña');
        }
        
    } catch (error) {
        console.error('Password change error:', error);
        showToast(error.message || 'Error al cambiar contraseña', 'error');
        return { success: false, message: error.message };
    }
}

// Session management
function initializeAuth() {
    // Check if user session is still valid
    const user = getCurrentUser();
    if (user) {
        // Could validate session with backend here
        console.log('User session found:', user.nombre);
    }
    
    // Set up session timeout (optional)
    setupSessionTimeout();
}

// Setup session timeout (24 hours)
function setupSessionTimeout(timeoutHours = 24) {
    const timeoutMs = timeoutHours * 60 * 60 * 1000;
    
    setTimeout(() => {
        const user = getCurrentUser();
        if (user) {
            logout();
            showToast('Tu sesión ha expirado', 'warning');
        }
    }, timeoutMs);
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', initializeAuth);

// Export auth functions for global use
window.auth = {
    getCurrentUser,
    setCurrentUser,
    login,
    register,
    logout,
    isAdmin,
    isLoggedIn,
    requireAuth,
    requireAdmin,
    updateProfile,
    changePassword,
    checkDemoAccount
};