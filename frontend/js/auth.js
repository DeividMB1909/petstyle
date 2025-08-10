// ===== AUTHENTICATION SYSTEM - REAL DATABASE ONLY =====

// Get current user from localStorage
function getCurrentUser() {
    try {
        const user = localStorage.getItem('petstyle_user');
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
            localStorage.setItem('petstyle_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('petstyle_user');
        }
        return true;
    } catch (error) {
        console.error('Error setting current user:', error);
        return false;
    }
}

// Get current token from localStorage
function getCurrentToken() {
    try {
        return localStorage.getItem('petstyle_token');
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
}

// Set token in localStorage
function setCurrentToken(token) {
    try {
        if (token) {
            localStorage.setItem('petstyle_token', token);
        } else {
            localStorage.removeItem('petstyle_token');
        }
        return true;
    } catch (error) {
        console.error('Error setting token:', error);
        return false;
    }
}

// Login function - FIXED to save token correctly
async function login(email, password) {
    try {
        console.log('🔐 Attempting login for:', email);
        
        if (!email || !password) {
            throw new Error('Email y contraseña son obligatorios');
        }
        
        if (!isValidEmail(email)) {
            throw new Error('Email no válido');
        }
        
        // Try API login
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('📡 API response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API login response:', data);
            
            // Handle different response formats from your API
            if (data.success || data.message === "Login exitoso" || response.status === 200) {
                // Extract user data
                let userData = data.user || data.data || data;
                
                // If we don't have user data but login was successful, create basic user object
                if (!userData.email && data.message === "Login exitoso") {
                    userData = {
                        email: email,
                        name: userData.name || "Usuario",
                        role: userData.role || "user",
                        _id: userData._id || Date.now().toString()
                    };
                }
                
                console.log('👤 User data to save:', userData);
                console.log('🔑 Token to save:', data.token);
                
                // Save user data
                setCurrentUser(userData);
                
                // Save token if available
                if (data.token) {
                    setCurrentToken(data.token);
                    console.log('✅ Token saved successfully');
                } else {
                    console.log('⚠️ No token received from server');
                }
                
                // Verify data was saved
                console.log('🔍 Verification - User saved:', !!getCurrentUser());
                console.log('🔍 Verification - Token saved:', !!getCurrentToken());
                
                showToast('Inicio de sesión exitoso', 'success');
                
                // Redirect based on user role
                redirectBasedOnRole(userData);
                
                return { success: true, user: userData, token: data.token };
            } else {
                throw new Error(data.message || 'Respuesta inválida del servidor');
            }
        } else {
            const errorData = await response.json();
            console.log('❌ API login failed:', errorData);
            throw new Error(errorData.message || 'Credenciales incorrectas');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific error messages
        let message = error.message;
        if (error.message.includes('fetch')) {
            message = 'No se pudo conectar con el servidor. Verifica que esté funcionando.';
        } else if (error.message.includes('NetworkError')) {
            message = 'Error de conexión. Verifica tu internet.';
        }
        
        showToast(message, 'error');
        return { success: false, message };
    }
}

// Redirect user based on their role from database
function redirectBasedOnRole(user) {
    console.log('🔄 Redirecting user based on role:', user);
    console.log('👤 User role/type:', user.role, user.userType);
    
    // Check if user is admin based on multiple criteria
    const isUserAdmin = isAdmin(user);
    
    console.log('🔍 Admin check result:', isUserAdmin);
    
    setTimeout(() => {
        if (isUserAdmin) {
            console.log('👑 Admin detected - redirecting to admin panel');
            showToast('Bienvenido, Administrador', 'success');
            window.location.href = 'admin.html';
        } else {
            console.log('👤 Regular user - redirecting to main');
            showToast(`Bienvenido, ${user.name || user.nombre}`, 'success');
            window.location.href = 'main.html';
        }
    }, 1000);
}

// Register function - ONLY with real API
async function register(userData) {
    try {
        // Validate required fields
        const requiredFields = ['name', 'email', 'password'];
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
        
        // Prepare data for API
        const registerData = {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone || '',
            address: userData.address || {}
        };
        
        // Try API registration
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            setCurrentUser(data.user);
            
            // Save token if provided
            if (data.token) {
                setCurrentToken(data.token);
            }
            
            showToast('Registro exitoso', 'success');
            
            // New users are always regular users, redirect to main
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 1500);
            
            return { success: true, user: data.user };
        } else {
            throw new Error(data.message || 'Error en el registro');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific error cases
        let message = error.message;
        if (error.message.includes('duplicate') || error.message.includes('exists') || error.message.includes('E11000')) {
            message = 'Este email ya está registrado';
        } else if (error.message.includes('validation')) {
            message = 'Datos de registro inválidos';
        }
        
        showToast(message, 'error');
        return { success: false, message };
    }
}

// Check if user is admin - Updated for your backend response
function isAdmin(user = null) {
    const currentUser = user || getCurrentUser();
    if (!currentUser) return false;
    
    console.log('🔍 Checking admin status for user:', currentUser);
    
    // Check multiple conditions for admin based on your database structure
    const adminConditions = [
        // From your backend response structure
        currentUser.role === 'admin',
        currentUser.userType === 'admin',
        currentUser.isAdmin === true,
        
        // Additional checks
        currentUser.role === 'administrador',
        currentUser.role === 'administrator',
        currentUser.role === 'superadmin',
        
        // If user has admin email patterns
        currentUser.email?.includes('admin'),
        
        // Check collection or source
        currentUser.collection === 'administradors',
        currentUser.fromAdminCollection === true
    ];
    
    const isUserAdmin = adminConditions.some(condition => condition === true);
    console.log('🎯 Admin conditions check:', { 
        conditions: adminConditions.map((c, i) => `${i}: ${c}`), 
        result: isUserAdmin 
    });
    
    return isUserAdmin;
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Require authentication
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
    if (!requireAuth()) return false;
    
    if (!isAdmin()) {
        showToast('Acceso denegado. Se requieren permisos de administrador.', 'error');
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);
        return false;
    }
    return true;
}

// Logout function
function logout() {
    try {
        // Clear user data
        const user = getCurrentUser();
        setCurrentUser(null);
        setCurrentToken(null);
        
        // Clear user-specific data
        if (user) {
            localStorage.removeItem(`favorites_${user.email}`);
            localStorage.removeItem(`cart_${user.email}`);
        }
        
        // Clear any other PetStyle data
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('petstyle_') || key.startsWith('cart_') || key.startsWith('favorites_')) {
                localStorage.removeItem(key);
            }
        });
        
        showToast('Sesión cerrada correctamente', 'success');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Error al cerrar sesión', 'error');
        return false;
    }
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password
function validatePassword(password) {
    const errors = [];
    
    if (password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        strength: getPasswordStrength(password)
    };
}

function getPasswordStrength(password) {
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

// Session management
function initializeAuth() {
    const user = getCurrentUser();
    const token = getCurrentToken();
    
    if (user) {
        console.log('👤 User session found:', user.name || user.nombre);
        console.log('🔑 User data:', user);
        console.log('🎫 Token available:', !!token);
        console.log('👑 Is admin:', isAdmin(user));
    }
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', initializeAuth);

// Export auth functions for global use
window.auth = {
    getCurrentUser,
    getCurrentToken,
    setCurrentUser,
    setCurrentToken,
    login,
    register,
    logout,
    isAdmin,
    isLoggedIn,
    requireAuth,
    requireAdmin,
    redirectBasedOnRole
};