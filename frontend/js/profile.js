// ===== PROFILE PAGE JAVASCRIPT =====
console.log('👤 Profile page script cargado correctamente');

// Variables globales
let currentUser = null;
let stats = { favorites: 0, cart: 0, orders: 0 };

// === Inicialización ===
document.addEventListener('DOMContentLoaded', () => {
    getCurrentUser();
    loadProfileData();
    loadStats();
    setupEventListeners();
});

// === Obtener usuario actual ===
function getCurrentUser() {
    try {
        // 1. Buscar en sessionStorage
        if (sessionStorage.getItem('currentUser')) {
            currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        }
        // 2. Buscar en localStorage
        else if (localStorage.getItem('currentUser')) {
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
        }
        // 3. Buscar en otros datos (fallback)
        else {
            const possibleKeys = Object.keys(localStorage).filter(k => k.includes('user_'));
            if (possibleKeys.length > 0) {
                currentUser = JSON.parse(localStorage.getItem(possibleKeys[0]));
            }
        }

        if (!currentUser || !currentUser.email) {
            console.warn('⚠ No hay usuario activo, redirigiendo al login...');
            window.location.href = 'login.html';
        } else {
            console.log('✅ Usuario actual:', currentUser);
        }
    } catch (error) {
        console.error('❌ Error obteniendo el usuario actual:', error);
        window.location.href = 'login.html';
    }
}

// === Cargar datos del perfil ===
function loadProfileData() {
    if (!currentUser) return;

    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const imgEl = document.getElementById('profileImage');

    nameEl.textContent = currentUser.name || 'Usuario';
    emailEl.textContent = currentUser.email || '';
    imgEl.src = currentUser.avatar || 'img/default-avatar.png';
}

// === Cargar estadísticas ===
function loadStats() {
    if (!currentUser) return;

    // Obtener favoritos
    const favKey = `favorites_${currentUser.email}`;
    const favorites = JSON.parse(localStorage.getItem(favKey)) || [];

    // Obtener carrito
    const cartKey = `cart_${currentUser.email}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    // Obtener pedidos
    const ordersKey = `orders_${currentUser.email}`;
    const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];

    stats = {
        favorites: favorites.length,
        cart: cart.length,
        orders: orders.length
    };

    document.getElementById('statFavorites').textContent = stats.favorites;
    document.getElementById('statCart').textContent = stats.cart;
    document.getElementById('statOrders').textContent = stats.orders;
}

// === Eventos ===
function setupEventListeners() {
    // Cerrar sesión
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

    // Navegación rápida
    document.getElementById('goFavorites').addEventListener('click', () => {
        window.location.href = 'favorites.html';
    });

    document.getElementById('goCart').addEventListener('click', () => {
        window.location.href = 'cart.html';
    });

    document.getElementById('goOrders').addEventListener('click', () => {
        window.location.href = 'orders.html';
    });
}

// === Funciones de debug ===
function debugProfile() {
    console.log('👤 Usuario actual:', currentUser);
    console.log('📊 Stats:', stats);
}

function resetProfileData() {
    if (!currentUser) return;
    localStorage.removeItem(`favorites_${currentUser.email}`);
    localStorage.removeItem(`cart_${currentUser.email}`);
    localStorage.removeItem(`orders_${currentUser.email}`);
    console.log('🗑 Datos del perfil eliminados');
    loadStats();
}
