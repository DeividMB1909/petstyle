// Utility functions for PetStyle

// Toast notification system
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const toastStyles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        fontSize: '14px',
        zIndex: '10000',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.3s ease-out',
        transition: 'all 0.3s ease'
    };

    // Apply base styles
    Object.assign(toast.style, toastStyles);

    // Apply type-specific colors
    const typeColors = {
        success: '#10b981',
        error: '#ef4444', 
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    toast.style.background = typeColors[type] || typeColors.info;
    toast.textContent = message;

    // Add CSS animation if not exists
    if (!document.querySelector('#toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 3000);

    // Click to dismiss
    toast.addEventListener('click', () => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    });
}

// Local Storage helpers
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Generate random ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get user initials for avatar
function getUserInitials(name) {
    if (!name) return 'U';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

// Logout function - NUEVA FUNCIÓN
function logout() {
    try {
        // Clear user data from localStorage
        localStorage.removeItem('petstyle_user');
        localStorage.removeItem('petstyle_token');
        
        // Clear any user-specific data
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('cart_') || key.startsWith('favorites_')) {
                localStorage.removeItem(key);
            }
        });
        
        // Show success message
        showToast('Sesión cerrada exitosamente', 'success');
        
        // Redirect to login after a short delay
        setTimeout(() => {
            window.location.href = '../pages/login.html';
        }, 1000);
        
        return true;
    } catch (error) {
        console.error('Error during logout:', error);
        showToast('Error al cerrar sesión', 'error');
        return false;
    }
}

// Check if user is logged in
function isLoggedIn() {
    const user = getLocalStorage('petstyle_user');
    return user && user.email;
}

// Get current user data
function getCurrentUser() {
    return getLocalStorage('petstyle_user');
}

// Redirect if not logged in
function requireAuth() {
    if (!isLoggedIn()) {
        showToast('Debes iniciar sesión para acceder a esta página', 'warning');
        setTimeout(() => {
            window.location.href = '../pages/login.html';
        }, 1500);
        return false;
    }
    return true;
}

// Loading state helpers
function showLoading(element) {
    if (element) {
        element.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <p style="color: #6b7280;">Cargando...</p>
            </div>
        `;
    }
}

function hideLoading(element) {
    if (element) {
        element.innerHTML = '';
    }
}

// Error handling
function handleError(error, context = '') {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    
    let message = 'Ha ocurrido un error inesperado';
    
    if (error.message) {
        if (error.message.includes('fetch')) {
            message = 'Error de conexión. Verifica tu internet.';
        } else if (error.message.includes('404')) {
            message = 'Recurso no encontrado';
        } else if (error.message.includes('401')) {
            message = 'No autorizado. Inicia sesión nuevamente.';
            logout();
            return;
        } else {
            message = error.message;
        }
    }
    
    showToast(message, 'error');
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        setLocalStorage,
        getLocalStorage,
        removeLocalStorage,
        formatCurrency,
        formatDate,
        debounce,
        isValidEmail,
        generateId,
        getUserInitials,
        logout,
        isLoggedIn,
        getCurrentUser,
        requireAuth,
        showLoading,
        hideLoading,
        handleError
    };
}