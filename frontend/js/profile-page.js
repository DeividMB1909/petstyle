// Profile Page JavaScript - FIXED VERSION

// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');
    loadProfile();
});

function loadProfile() {
    const profileContent = document.getElementById('profileContent');
    
    if (!profileContent) {
        console.error('Profile content container not found');
        return;
    }

    // Show loading state
    showLoadingState();
    
    // Check if user is logged in
    const currentUser = getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (currentUser && currentUser.email) {
        // User is logged in - show user profile
        setTimeout(() => {
            showUserProfile(currentUser);
        }, 500); // Small delay to show loading
    } else {
        // User is not logged in - show guest profile
        setTimeout(() => {
            showGuestProfile();
        }, 500);
    }
}

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

function showUserProfile(user) {
    console.log('Showing user profile for:', user);
    
    const profileContent = document.getElementById('profileContent');
    const template = document.getElementById('userProfileTemplate');
    
    if (!profileContent || !template) {
        console.error('Required elements not found:', { profileContent: !!profileContent, template: !!template });
        return;
    }

    // Clone template content
    const clone = template.content.cloneNode(true);
    
    // Populate user data
    const userAvatar = clone.getElementById('userAvatar');
    const userName = clone.getElementById('userName');
    const userEmail = clone.getElementById('userEmail');
    const userRole = clone.getElementById('userRole');
    
    if (userAvatar) userAvatar.textContent = getUserInitials(user.name || user.email);
    if (userName) userName.textContent = user.name || 'Usuario';
    if (userEmail) userEmail.textContent = user.email;
    if (userRole) userRole.textContent = user.role === 'admin' ? 'Administrador' : 'Usuario';
    
    // Update stats
    updateUserStats(clone, user);
    
    // Load settings
    loadUserSettings(clone);
    
    // Clear and append new content
    profileContent.innerHTML = '';
    profileContent.appendChild(clone);
    
    console.log('User profile displayed successfully');
}

function showGuestProfile() {
    console.log('Showing guest profile');
    
    const profileContent = document.getElementById('profileContent');
    const template = document.getElementById('guestProfileTemplate');
    
    if (!profileContent || !template) {
        console.error('Required elements not found for guest profile');
        return;
    }

    // Clone template content
    const clone = template.content.cloneNode(true);
    
    // Clear and append new content
    profileContent.innerHTML = '';
    profileContent.appendChild(clone);
    
    console.log('Guest profile displayed successfully');
}

function updateUserStats(container, user) {
    try {
        // Get favorites count
        const favoritesCount = getFavoritesCount(user.email);
        const favoritesElement = container.getElementById('favoritesCount');
        if (favoritesElement) {
            favoritesElement.textContent = favoritesCount;
        }
        
        // Get cart count
        const cartCount = getCartCount(user.email);
        const cartElement = container.getElementById('cartCount');
        if (cartElement) {
            cartElement.textContent = cartCount;
        }
        
        // Orders count (placeholder)
        const ordersElement = container.getElementById('ordersCount');
        if (ordersElement) {
            ordersElement.textContent = '0';
        }
        
        console.log('Stats updated:', { favorites: favoritesCount, cart: cartCount });
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

function getFavoritesCount(email) {
    try {
        const favorites = getLocalStorage(`favorites_${email}`, []);
        return Array.isArray(favorites) ? favorites.length : 0;
    } catch (error) {
        console.error('Error getting favorites count:', error);
        return 0;
    }
}

function getCartCount(email) {
    try {
        const cart = getLocalStorage(`cart_${email}`, []);
        if (Array.isArray(cart)) {
            return cart.reduce((total, item) => total + (item.quantity || 1), 0);
        }
        return 0;
    } catch (error) {
        console.error('Error getting cart count:', error);
        return 0;
    }
}

function loadUserSettings(container) {
    try {
        // Load notifications setting
        const notificationsEnabled = getLocalStorage('notifications_enabled', true);
        const notificationsToggle = container.getElementById('notificationsToggle');
        if (notificationsToggle) {
            if (notificationsEnabled) {
                notificationsToggle.classList.add('active');
            }
        }
        
        // Load dark mode setting
        const darkModeEnabled = getLocalStorage('dark_mode_enabled', false);
        const darkModeToggle = container.getElementById('darkModeToggle');
        if (darkModeToggle) {
            if (darkModeEnabled) {
                darkModeToggle.classList.add('active');
            }
        }
        
        console.log('Settings loaded:', { notifications: notificationsEnabled, darkMode: darkModeEnabled });
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Navigation functions
function goBack() {
    window.history.back();
}

function goToFavorites() {
    window.location.href = '../pages/favorites.html';
}

function goToCart() {
    window.location.href = '../pages/cart.html';
}

// Profile actions
function editProfile() {
    showToast('Función en desarrollo', 'info');
}

function changePassword() {
    showToast('Función en desarrollo', 'info');
}

function viewOrders() {
    showToast('Función en desarrollo', 'info');
}

// Settings functions
function toggleNotifications() {
    try {
        const currentValue = getLocalStorage('notifications_enabled', true);
        const newValue = !currentValue;
        setLocalStorage('notifications_enabled', newValue);
        
        const toggle = document.getElementById('notificationsToggle');
        if (toggle) {
            if (newValue) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
        
        showToast(
            newValue ? 'Notificaciones activadas' : 'Notificaciones desactivadas', 
            'success'
        );
    } catch (error) {
        console.error('Error toggling notifications:', error);
        showToast('Error al cambiar configuración', 'error');
    }
}

function toggleDarkMode() {
    try {
        const currentValue = getLocalStorage('dark_mode_enabled', false);
        const newValue = !currentValue;
        setLocalStorage('dark_mode_enabled', newValue);
        
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            if (newValue) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
        
        // Apply dark mode to body (basic implementation)
        if (newValue) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        showToast(
            newValue ? 'Modo oscuro activado' : 'Modo oscuro desactivado', 
            'success'
        );
    } catch (error) {
        console.error('Error toggling dark mode:', error);
        showToast('Error al cambiar configuración', 'error');
    }
}

// Utility function for initials (fallback if not in utils.js)
function getUserInitials(name) {
    if (!name) return 'U';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Profile page error:', e.error);
    const profileContent = document.getElementById('profileContent');
    if (profileContent && profileContent.innerHTML.includes('loading')) {
        profileContent.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3 class="error-title">Error al cargar perfil</h3>
                <p class="error-message">Ha ocurrido un problema. Intenta recargar la página.</p>
                <button class="retry-btn" onclick="loadProfile()">Reintentar</button>
            </div>
        `;
    }
});