// ===== PROFILE PAGE - COMPLETELY FUNCTIONAL VERSION =====

// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Profile page loaded');
    initializeProfile();
});

// Main initialization function
async function initializeProfile() {
    console.log('🔄 Initializing profile...');
    
    const profileContent = document.getElementById('profileContent');
    if (!profileContent) {
        console.error('❌ Profile content container not found');
        return;
    }

    // Show loading state
    showLoadingState();
    
    // Check authentication
    const currentUser = getCurrentUser();
    const currentToken = getCurrentToken();
    
    console.log('👤 Current user:', currentUser);
    console.log('🔑 Has token:', !!currentToken);
    
    if (currentUser && currentToken) {
        // User is logged in - fetch fresh data from backend
        try {
            await loadUserProfileFromBackend(currentUser, currentToken);
        } catch (error) {
            console.error('❌ Error loading from backend:', error);
            // Fallback to localStorage data
            showUserProfile(currentUser);
        }
    } else {
        // User is not logged in - show guest profile
        setTimeout(() => {
            showGuestProfile();
        }, 500);
    }
}

// Load user profile from backend
async function loadUserProfileFromBackend(user, token) {
    try {
        console.log('📡 Fetching user profile from backend...');
        
        // Try to get fresh user data from backend
        const response = await fetch('http://localhost:3000/api/auth/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Fresh user data received:', data);
            
            // Update localStorage with fresh data
            const freshUserData = data.data || data.user || data;
            setCurrentUser(freshUserData);
            
            // Show profile with fresh data
            showUserProfile(freshUserData);
        } else {
            console.log('⚠️ Backend profile fetch failed, using cached data');
            showUserProfile(user);
        }
    } catch (error) {
        console.error('❌ Backend error:', error);
        showUserProfile(user);
    }
}

// Show loading state
function showLoadingState() {
    const profileContent = document.getElementById('profileContent');
    if (profileContent) {
        profileContent.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p style="color: #6b7280; text-align: center;">Cargando perfil...</p>
            </div>
        `;
    }
}

// Show user profile
function showUserProfile(user) {
    console.log('👤 Showing user profile for:', user);
    
    const profileContent = document.getElementById('profileContent');
    const template = document.getElementById('userProfileTemplate');
    
    if (!profileContent || !template) {
        console.error('❌ Required elements not found');
        return;
    }

    // Clone template content
    const clone = template.content.cloneNode(true);
    
    // Populate user data
    try {
        populateUserData(clone, user);
        updateUserStats(clone, user);
        loadUserSettings(clone);
        
        // Clear and append new content
        profileContent.innerHTML = '';
        profileContent.appendChild(clone);
        
        console.log('✅ User profile displayed successfully');
    } catch (error) {
        console.error('❌ Error populating profile:', error);
        showErrorState('Error al mostrar perfil');
    }
}

// Populate user data in template
function populateUserData(clone, user) {
    // User avatar (initials)
    const userAvatar = clone.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.textContent = getUserInitials(user.name || user.nombre || user.email);
    }
    
    // User name
    const userName = clone.getElementById('userName');
    if (userName) {
        userName.textContent = user.name || user.nombre || 'Usuario';
    }
    
    // User email
    const userEmail = clone.getElementById('userEmail');
    if (userEmail) {
        userEmail.textContent = user.email || 'No disponible';
    }
    
    // User role/badge
    const userRole = clone.getElementById('userRole');
    if (userRole) {
        const isUserAdmin = isAdmin(user);
        userRole.textContent = isUserAdmin ? 'Administrador' : 'Usuario';
        userRole.style.background = isUserAdmin ? 
            'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : 
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

// Update user statistics
function updateUserStats(container, user) {
    try {
        // Get real stats from localStorage
        const favorites = getLocalStorage(`favorites_${user.email}`, []);
        const cart = getLocalStorage(`cart_${user.email}`, []);
        
        // Update favorites count
        const favoritesElement = container.getElementById('favoritesCount');
        if (favoritesElement) {
            const favCount = Array.isArray(favorites) ? favorites.length : 0;
            favoritesElement.textContent = favCount;
        }
        
        // Update cart count (total items, not unique products)
        const cartElement = container.getElementById('cartCount');
        if (cartElement) {
            const cartCount = Array.isArray(cart) ? 
                cart.reduce((total, item) => total + (item.quantity || 1), 0) : 0;
            cartElement.textContent = cartCount;
        }
        
        // Orders count (placeholder for now)
        const ordersElement = container.getElementById('ordersCount');
        if (ordersElement) {
            ordersElement.textContent = '0'; // TODO: Implement orders
        }
        
        console.log('📊 Stats updated:', { 
            favorites: favorites.length, 
            cart: cart.length 
        });
    } catch (error) {
        console.error('❌ Error updating stats:', error);
    }
}

// Load user settings
function loadUserSettings(container) {
    try {
        // Load notifications setting
        const notificationsEnabled = getLocalStorage('notifications_enabled', true);
        const notificationsToggle = container.getElementById('notificationsToggle');
        if (notificationsToggle) {
            if (notificationsEnabled) {
                notificationsToggle.classList.add('active');
            } else {
                notificationsToggle.classList.remove('active');
            }
        }
        
        // Load dark mode setting
        const darkModeEnabled = getLocalStorage('dark_mode_enabled', false);
        const darkModeToggle = container.getElementById('darkModeToggle');
        if (darkModeToggle) {
            if (darkModeEnabled) {
                darkModeToggle.classList.add('active');
                document.body.classList.add('dark-mode');
            } else {
                darkModeToggle.classList.remove('active');
                document.body.classList.remove('dark-mode');
            }
        }
        
        console.log('⚙️ Settings loaded:', { 
            notifications: notificationsEnabled, 
            darkMode: darkModeEnabled 
        });
    } catch (error) {
        console.error('❌ Error loading settings:', error);
    }
}

// Show guest profile
function showGuestProfile() {
    console.log('👤 Showing guest profile');
    
    const profileContent = document.getElementById('profileContent');
    const template = document.getElementById('guestProfileTemplate');
    
    if (!profileContent || !template) {
        console.error('❌ Required elements not found for guest profile');
        return;
    }

    // Clone template content
    const clone = template.content.cloneNode(true);
    
    // Clear and append new content
    profileContent.innerHTML = '';
    profileContent.appendChild(clone);
    
    console.log('✅ Guest profile displayed successfully');
}

// Show error state
function showErrorState(message) {
    const profileContent = document.getElementById('profileContent');
    if (profileContent) {
        profileContent.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3 class="error-title">Error</h3>
                <p class="error-message">${message}</p>
                <button class="retry-btn" onclick="initializeProfile()">Reintentar</button>
            </div>
        `;
    }
}

// ================================
// NAVIGATION FUNCTIONS
// ================================

function goBack() {
    // Smart back navigation
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '../pages/main.html';
    }
}

function goToFavorites() {
    if (!requireAuth()) return;
    window.location.href = '../pages/favorites.html';
}

function goToCart() {
    if (!requireAuth()) return;
    window.location.href = '../pages/cart.html';
}

// ================================
// PROFILE ACTIONS
// ================================

function editProfile() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Debes iniciar sesión', 'error');
        return;
    }
    
    // TODO: Implement edit profile modal
    showToast('Función de editar perfil en desarrollo', 'info');
    console.log('📝 Edit profile requested for:', user);
}

async function changePassword() {
    const user = getCurrentUser();
    const token = getCurrentToken();
    
    if (!user || !token) {
        showToast('Debes iniciar sesión', 'error');
        return;
    }
    
    // Simple prompt for now - TODO: Create proper modal
    const currentPassword = prompt('Contraseña actual:');
    if (!currentPassword) return;
    
    const newPassword = prompt('Nueva contraseña (mínimo 6 caracteres):');
    if (!newPassword || newPassword.length < 6) {
        showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    try {
        showToast('Cambiando contraseña...', 'info');
        
        const response = await fetch('http://localhost:3000/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('Contraseña cambiada exitosamente', 'success');
        } else {
            throw new Error(data.message || 'Error al cambiar contraseña');
        }
    } catch (error) {
        console.error('❌ Error changing password:', error);
        showToast(error.message || 'Error al cambiar contraseña', 'error');
    }
}

function viewOrders() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Debes iniciar sesión', 'error');
        return;
    }
    
    // TODO: Implement orders page
    showToast('Función de pedidos en desarrollo', 'info');
    console.log('📦 View orders requested for:', user);
}

// ================================
// SETTINGS FUNCTIONS
// ================================

function toggleNotifications() {
    try {
        const currentValue = getLocalStorage('notifications_enabled', true);
        const newValue = !currentValue;
        setLocalStorage('notifications_enabled', newValue);
        
        // Update toggle UI
        const toggle = document.getElementById('notificationsToggle');
        if (toggle) {
            if (newValue) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
        
        // Show confirmation
        showToast(
            newValue ? 'Notificaciones activadas' : 'Notificaciones desactivadas', 
            'success'
        );
        
        console.log('🔔 Notifications toggled:', newValue);
    } catch (error) {
        console.error('❌ Error toggling notifications:', error);
        showToast('Error al cambiar configuración', 'error');
    }
}

function toggleDarkMode() {
    try {
        const currentValue = getLocalStorage('dark_mode_enabled', false);
        const newValue = !currentValue;
        setLocalStorage('dark_mode_enabled', newValue);
        
        // Update toggle UI
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            if (newValue) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
        
        // Apply dark mode to body
        if (newValue) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Show confirmation
        showToast(
            newValue ? 'Modo oscuro activado' : 'Modo oscuro desactivado', 
            'success'
        );
        
        console.log('🌙 Dark mode toggled:', newValue);
    } catch (error) {
        console.error('❌ Error toggling dark mode:', error);
        showToast('Error al cambiar configuración', 'error');
    }
}

// ================================
// LOGOUT FUNCTION - REAL & COMPLETE
// ================================

async function logout() {
    try {
        console.log('🚪 Starting logout process...');
        
        const user = getCurrentUser();
        const token = getCurrentToken();
        
        // Show confirmation dialog
        const confirmLogout = confirm('¿Estás seguro de que quieres cerrar sesión?');
        if (!confirmLogout) {
            console.log('❌ Logout cancelled by user');
            return;
        }
        
        showToast('Cerrando sesión...', 'info');
        
        // Try to logout from backend first
        if (token) {
            try {
                const response = await fetch('http://localhost:3000/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    console.log('✅ Backend logout successful');
                } else {
                    console.log('⚠️ Backend logout failed, continuing with local logout');
                }
            } catch (error) {
                console.log('⚠️ Backend logout error:', error.message);
            }
        }
        
        // COMPLETE LOCAL CLEANUP
        console.log('🧹 Cleaning up local data...');
        
        // Remove main auth data
        setCurrentUser(null);
        setCurrentToken(null);
        localStorage.removeItem('petstyle_user');
        localStorage.removeItem('petstyle_token');
        
        // Remove user-specific data if we have user info
        if (user && user.email) {
            localStorage.removeItem(`favorites_${user.email}`);
            localStorage.removeItem(`cart_${user.email}`);
            console.log(`🗑️ Removed data for user: ${user.email}`);
        }
        
        // Remove any other PetStyle-related data
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (key.startsWith('petstyle_') || 
                key.startsWith('cart_') || 
                key.startsWith('favorites_') ||
                key.startsWith('auth_') ||
                key.includes('user_') ||
                key.includes('token')) {
                localStorage.removeItem(key);
                console.log(`🗑️ Removed: ${key}`);
            }
        });
        
        // Clear any session storage too
        sessionStorage.clear();
        
        // Remove any body classes
        document.body.classList.remove('dark-mode');
        
        console.log('✅ Complete logout successful');
        showToast('Sesión cerrada correctamente', 'success');
        
        // Short delay before redirect to show the toast
        setTimeout(() => {
            console.log('🔄 Redirecting to login...');
            window.location.href = '../pages/login.html';
        }, 1500);
        
        return true;
        
    } catch (error) {
        console.error('❌ Critical logout error:', error);
        
        // Force cleanup even if there's an error
        localStorage.clear();
        sessionStorage.clear();
        
        showToast('Error al cerrar sesión, pero datos limpiados', 'warning');
        
        setTimeout(() => {
            window.location.href = '../pages/login.html';
        }, 2000);
        
        return false;
    }
}

// ================================
// UTILITY FUNCTIONS
// ================================

function getUserInitials(name) {
    if (!name || typeof name !== 'string') return 'U';
    
    const cleanName = name.trim();
    if (cleanName.length === 0) return 'U';
    
    const words = cleanName.split(' ').filter(word => word.length > 0);
    
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    } else if (words.length >= 2) {
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
    
    return cleanName.charAt(0).toUpperCase();
}

// Refresh profile data
async function refreshProfile() {
    const user = getCurrentUser();
    const token = getCurrentToken();
    
    if (user && token) {
        showLoadingState();
        try {
            await loadUserProfileFromBackend(user, token);
            showToast('Perfil actualizado', 'success');
        } catch (error) {
            console.error('❌ Error refreshing profile:', error);
            showUserProfile(user);
            showToast('Error al actualizar perfil', 'error');
        }
    } else {
        showGuestProfile();
    }
}

// ================================
// ERROR HANDLING
// ================================

window.addEventListener('error', function(e) {
    console.error('❌ Profile page error:', e.error);
    
    // Only show error state if we're still loading
    const profileContent = document.getElementById('profileContent');
    if (profileContent && profileContent.innerHTML.includes('loading')) {
        showErrorState('Error al cargar la página');
    }
});

// ================================
// AUTO-REFRESH (Optional)
// ================================

// Auto-refresh user data every 5 minutes if logged in
setInterval(() => {
    const user = getCurrentUser();
    const token = getCurrentToken();
    
    if (user && token && document.visibilityState === 'visible') {
        console.log('🔄 Auto-refreshing profile data...');
        loadUserProfileFromBackend(user, token).catch(error => {
            console.log('⚠️ Auto-refresh failed:', error.message);
        });
    }
}, 5 * 60 * 1000); // 5 minutes

// ================================
// EXPORT FOR DEBUGGING (Optional)
// ================================

window.profileDebug = {
    refreshProfile,
    initializeProfile,
    getCurrentUser,
    getCurrentToken,
    logout
};