// ===== PROFILE PAGE JAVASCRIPT =====

// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
    loadUserPreferences();
});

function loadProfile() {
    const user = getCurrentUser();
    const guestProfile = document.getElementById('guest-profile');
    const userProfile = document.getElementById('user-profile');
    
    if (!user) {
        guestProfile.style.display = 'block';
        userProfile.style.display = 'none';
    } else {
        guestProfile.style.display = 'none';
        userProfile.style.display = 'block';
        populateUserProfile(user);
    }
}

function populateUserProfile(user) {
    // Set user basic info
    document.getElementById('user-name').textContent = user.nombre || 'Usuario';
    document.getElementById('user-email').textContent = user.email || '';
    
    // Set user avatar
    const avatarImg = document.getElementById('user-avatar-img');
    if (user.avatar) {
        avatarImg.src = user.avatar;
    } else {
        // Generate a default avatar based on user name
        const initials = (user.nombre || 'U').charAt(0).toUpperCase();
        avatarImg.src = `https://ui-avatars.com/api/?name=${initials}&background=6366f1&color=fff&size=100`;
    }
    
    // Set user role
    const roleEl = document.getElementById('user-role');
    const isAdmin = user.role === 'admin' || user.email === 'admin@petstyle.com';
    roleEl.textContent = isAdmin ? 'Administrador' : 'Usuario';
    roleEl.className = isAdmin ? 'user-role admin' : 'user-role';
    
    // Show/hide admin section
    const adminSection = document.getElementById('admin-section');
    if (isAdmin) {
        adminSection.style.display = 'block';
    } else {
        adminSection.style.display = 'none';
    }

    // Update profile stats
    updateProfileStats();
}

function updateProfileStats() {
    try {
        const favorites = getFavoriteProducts();
        const cartItems = getCartItems();
        
        document.getElementById('favorites-count').textContent = favorites.length;
        document.getElementById('cart-count').textContent = cartItems.length;
        document.getElementById('orders-count').textContent = '0'; // Placeholder for orders
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

function loadUserPreferences() {
    // Load notification preference
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    document.getElementById('notifications-toggle').checked = notificationsEnabled;
    
    // Load dark mode preference
    const darkModeEnabled = localStorage.getItem('darkModeEnabled') === 'true';
    document.getElementById('darkmode-toggle').checked = darkModeEnabled;
    
    // Apply dark mode if enabled
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    }
}

// Profile editing functions
function editProfile() {
    const user = getCurrentUser();
    if (!user) return;

    // Populate form with current user data
    document.getElementById('edit-name').value = user.nombre || '';
    document.getElementById('edit-email').value = user.email || '';
    document.getElementById('edit-phone').value = user.telefono || '';
    
    // Show modal
    document.getElementById('edit-profile-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-profile-modal').style.display = 'none';
}

// Handle edit profile form submission
document.getElementById('edit-profile-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        nombre: document.getElementById('edit-name').value.trim(),
        email: document.getElementById('edit-email').value.trim(),
        telefono: document.getElementById('edit-phone').value.trim()
    };

    // Basic validation
    if (!formData.nombre || !formData.email) {
        showToast('Nombre y email son obligatorios', 'error');
        return;
    }

    if (!isValidEmail(formData.email)) {
        showToast('Email no válido', 'error');
        return;
    }

    try {
        // In a real app, this would make an API call
        const user = getCurrentUser();
        const updatedUser = { ...user, ...formData };
        
        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update UI
        populateUserProfile(updatedUser);
        closeEditModal();
        showToast('Perfil actualizado correctamente', 'success');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Error al actualizar perfil', 'error');
    }
});

// Other profile functions
function changePassword() {
    showToast('Función de cambio de contraseña próximamente', 'info');
    // In real app: window.location.href = 'change-password.html';
}

function manageAddresses() {
    showToast('Gestión de direcciones próximamente', 'info');
    // In real app: window.location.href = 'addresses.html';
}

function viewOrders() {
    showToast('Historial de pedidos próximamente', 'info');
    // In real app: window.location.href = 'orders.html';
}

function changeAvatar() {
    showToast('Cambio de avatar próximamente', 'info');
    // In real app, this would open file picker or camera
}

// Settings functions
function toggleNotifications() {
    const toggle = document.getElementById('notifications-toggle');
    const enabled = toggle.checked;
    
    // Save preference
    localStorage.setItem('notificationsEnabled', enabled.toString());
    
    // Show feedback
    showToast(
        enabled ? 'Notificaciones activadas' : 'Notificaciones desactivadas', 
        'info'
    );
    
    // In real app, register/unregister for push notifications
    if (enabled && 'Notification' in window) {
        Notification.requestPermission();
    }
}

function toggleDarkMode() {
    const toggle = document.getElementById('darkmode-toggle');
    const enabled = toggle.checked;
    
    // Apply/remove dark mode
    document.body.classList.toggle('dark-mode', enabled);
    
    // Save preference
    localStorage.setItem('darkModeEnabled', enabled.toString());
    
    // Show feedback
    showToast(
        enabled ? 'Modo oscuro activado' : 'Modo claro activado', 
        'info'
    );
}

function toggleSettings() {
    showToast('Configuración avanzada próximamente', 'info');
}

// Logout function
function handleLogout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        try {
            logout();
            showToast('Sesión cerrada correctamente', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 1000);
            
        } catch (error) {
            console.error('Error during logout:', error);
            showToast('Error al cerrar sesión', 'error');
        }
    }
}

// Close modal when clicking outside
document.getElementById('edit-profile-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeEditModal();
    }
});

// Handle escape key to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEditModal();
    }
});

// Refresh stats when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && getCurrentUser()) {
        updateProfileStats();
    }
});

// Helper function for email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Auto-refresh profile data periodically
setInterval(() => {
    const user = getCurrentUser();
    if (user && document.getElementById('user-profile').style.display !== 'none') {
        updateProfileStats();
    }
}, 30000); // Update every 30 seconds