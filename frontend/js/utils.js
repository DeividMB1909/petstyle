// ===== UTILITY FUNCTIONS FOR PETSTYLE =====

// ================================
// LOCAL STORAGE HELPERS
// ================================

function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
    }
}

function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
        return false;
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error);
        return false;
    }
}

// ================================
// TOAST NOTIFICATIONS
// ================================

function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, duration);
    
    console.log(`📢 Toast (${type}): ${message}`);
}

// ================================
// DATE/TIME HELPERS
// ================================

function formatDate(date, options = {}) {
    if (!date) return '';
    
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleDateString('es-ES', formatOptions);
    } catch (error) {
        console.error('Error formatting date:', error);
        return date.toString();
    }
}

function formatTime(date) {
    if (!date) return '';
    
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting time:', error);
        return date.toString();
    }
}

function timeAgo(date) {
    if (!date) return '';
    
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diffInSeconds = Math.floor((now - dateObj) / 1000);
        
        if (diffInSeconds < 60) return 'Hace un momento';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
        
        return formatDate(dateObj);
    } catch (error) {
        console.error('Error calculating time ago:', error);
        return '';
    }
}

// ================================
// STRING HELPERS
// ================================

function truncateText(text, maxLength = 100, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
}

function capitalizeFirst(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function capitalizeWords(text) {
    if (!text) return '';
    return text.split(' ')
        .map(word => capitalizeFirst(word))
        .join(' ');
}

function slugify(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ================================
// NUMBER HELPERS
// ================================

function formatPrice(price, currency = 'MXN') {
    if (price === null || price === undefined) return '';
    
    try {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(price);
    } catch (error) {
        console.error('Error formatting price:', error);
        return `$${price.toFixed(2)}`;
    }
}

function formatNumber(number, options = {}) {
    if (number === null || number === undefined) return '';
    
    try {
        return new Intl.NumberFormat('es-MX', options).format(number);
    } catch (error) {
        console.error('Error formatting number:', error);
        return number.toString();
    }
}

function calculateDiscount(originalPrice, discountedPrice) {
    if (!originalPrice || !discountedPrice || originalPrice <= discountedPrice) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

// ================================
// VALIDATION HELPERS
// ================================

function isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    if (!phone) return false;
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

function isValidPassword(password) {
    if (!password) return false;
    return password.length >= 6;
}

function validateRequired(value, fieldName = 'Campo') {
    if (!value || value.toString().trim() === '') {
        return `${fieldName} es obligatorio`;
    }
    return null;
}

// ================================
// DOM HELPERS
// ================================

function createElement(tag, className = '', textContent = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
}

function removeAllChildren(element) {
    if (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
}

function toggleClass(element, className) {
    if (element) {
        element.classList.toggle(className);
    }
}

function fadeIn(element, duration = 300) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.display = 'block';
    
    const fadeInterval = setInterval(() => {
        const opacity = parseFloat(element.style.opacity);
        if (opacity < 1) {
            element.style.opacity = (opacity + 0.1).toString();
        } else {
            clearInterval(fadeInterval);
        }
    }, duration / 10);
}

function fadeOut(element, duration = 300) {
    if (!element) return;
    
    const fadeInterval = setInterval(() => {
        const opacity = parseFloat(element.style.opacity);
        if (opacity > 0) {
            element.style.opacity = (opacity - 0.1).toString();
        } else {
            clearInterval(fadeInterval);
            element.style.display = 'none';
        }
    }, duration / 10);
}

// ================================
// ARRAY HELPERS
// ================================

function removeDuplicates(array, key = null) {
    if (!Array.isArray(array)) return [];
    
    if (key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    }
    
    return [...new Set(array)];
}

function sortBy(array, key, direction = 'asc') {
    if (!Array.isArray(array)) return [];
    
    return [...array].sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];
        
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

function groupBy(array, key) {
    if (!Array.isArray(array)) return {};
    
    return array.reduce((groups, item) => {
        const group = item[key];
        if (!groups[group]) groups[group] = [];
        groups[group].push(item);
        return groups;
    }, {});
}

// ================================
// URL HELPERS
// ================================

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function updateUrlParameter(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}

function removeUrlParameter(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
}

// ================================
// DEBOUNCE/THROTTLE
// ================================

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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ================================
// DEVICE DETECTION
// ================================

function isMobile() {
    return window.innerWidth <= 768;
}

function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

function isDesktop() {
    return window.innerWidth > 1024;
}

function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// ================================
// RANDOM HELPERS
// ================================

function randomId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function randomColor() {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ================================
// LOADING STATES
// ================================

function showLoading(text = 'Cargando...') {
    const existingLoader = document.querySelector('.global-loader');
    if (existingLoader) existingLoader.remove();
    
    const loader = createElement('div', 'global-loader');
    loader.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        ">
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e2e8f0;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                "></div>
                <p style="color: #6b7280; margin: 0;">${text}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.querySelector('.global-loader');
    if (loader) loader.remove();
}

// ================================
// ERROR HANDLING
// ================================

function handleError(error, context = 'Application') {
    console.error(`${context} Error:`, error);
    
    let message = 'Ha ocurrido un error inesperado';
    
    if (error.message) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
            message = 'Error de conexión. Verifica tu internet.';
        } else if (error.message.includes('404')) {
            message = 'Recurso no encontrado.';
        } else if (error.message.includes('500')) {
            message = 'Error del servidor. Intenta más tarde.';
        } else {
            message = error.message;
        }
    }
    
    showToast(message, 'error');
    return message;
}

// ================================
// PERFORMANCE HELPERS
// ================================

function measureTime(label) {
    console.time(label);
    return () => console.timeEnd(label);
}

function lazy(fn) {
    let result;
    let hasRun = false;
    
    return function(...args) {
        if (!hasRun) {
            result = fn.apply(this, args);
            hasRun = true;
        }
        return result;
    };
}

// ================================
// EXPORT ALL FUNCTIONS
// ================================

// Make functions globally available
window.utils = {
    // Storage
    getLocalStorage,
    setLocalStorage,
    removeLocalStorage,
    
    // UI
    showToast,
    showLoading,
    hideLoading,
    
    // Date/Time
    formatDate,
    formatTime,
    timeAgo,
    
    // Strings
    truncateText,
    capitalizeFirst,
    capitalizeWords,
    slugify,
    
    // Numbers
    formatPrice,
    formatNumber,
    calculateDiscount,
    
    // Validation
    isValidEmail,
    isValidPhone,
    isValidPassword,
    validateRequired,
    
    // DOM
    createElement,
    removeAllChildren,
    toggleClass,
    fadeIn,
    fadeOut,
    
    // Arrays
    removeDuplicates,
    sortBy,
    groupBy,
    
    // URL
    getUrlParameter,
    updateUrlParameter,
    removeUrlParameter,
    
    // Performance
    debounce,
    throttle,
    measureTime,
    lazy,
    
    // Device
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    
    // Random
    randomId,
    randomColor,
    
    // Error handling
    handleError
};

// Also make individual functions available globally for compatibility
Object.assign(window, window.utils);

console.log('✅ Utils loaded successfully');