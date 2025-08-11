// ===== FAVORITES PAGE JAVASCRIPT - ARCHIVO LIMPIO =====
let currentUser = null;
let favorites = [];
let productToRemove = null;

// Mapeo de categorías ObjectId a nombres
const categoryMap = {
    '6898049bdd53186ec08fd313': 'Perros',
    '6898049bdd53186ec08fd316': 'Gatos', 
    '6898049bdd53186ec08fd319': 'Aves',
    '6898049bdd53186ec08fd31c': 'Peces',
    '6898049bdd53186ec08fd31f': 'Accesorios'
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('❤️ Inicializando página de favoritos...');
    initializeFavoritesPage();
});

function initializeFavoritesPage() {
    try {
        console.log('🚀 Iniciando inicialización...');
        
        // Obtener usuario actual PRIMERO
        currentUser = getCurrentUser();
        console.log('👤 Usuario actual obtenido:', currentUser);
        
        // Solo continuar si tenemos un usuario válido
        if (!currentUser || !currentUser.email) {
            console.log('❌ No hay usuario válido, mostrando estado vacío');
            showEmptyState();
            return;
        }
        
        // Cargar favoritos
        loadFavorites();
        
        // Actualizar contadores de navegación
        updateNavigationCounts();
        
        console.log('✅ Página de favoritos inicializada correctamente');
    } catch (error) {
        console.error('❌ Error inicializando favoritos:', error);
        showEmptyState();
    }
}

function getCurrentUser() {
    console.log('👤 === OBTENIENDO USUARIO ACTUAL ===');
    
    // Método 1: localStorage.currentUser
    let userData = localStorage.getItem('currentUser');
    console.log('📦 Método 1 - localStorage.currentUser:', userData);
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user && user.email) {
                console.log('✅ Usuario válido desde localStorage.currentUser:', user);
                return user;
            }
        } catch (error) {
            console.error('❌ Error parsing currentUser:', error);
        }
    }
    
    // Método 2: sessionStorage.currentUser
    userData = sessionStorage.getItem('currentUser');
    console.log('📦 Método 2 - sessionStorage.currentUser:', userData);
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user && user.email) {
                console.log('✅ Usuario válido desde sessionStorage.currentUser:', user);
                return user;
            }
        } catch (error) {
            console.error('❌ Error parsing sessionStorage currentUser:', error);
        }
    }
    
    // Método 3: userEmail y userName separados
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    console.log('📧 Método 3 - userEmail:', userEmail);
    console.log('👤 Método 3 - userName:', userName);
    
    if (userEmail && userName) {
        const user = { name: userName, email: userEmail };
        console.log('✅ Usuario construido desde email/name separados:', user);
        return user;
    }
    
    // Método 4: Buscar en todas las claves
    console.log('🔍 Método 4 - Buscando en todas las claves de localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`- ${key}: ${value?.substring(0, 100)}...`);
        
        // Buscar claves que contengan información de usuario
        if (key && (key.includes('user') || key.includes('email') || key.includes('login'))) {
            console.log(`  🎯 Clave potencial de usuario: ${key}`);
        }
    }
    
    // Si no encontramos nada, crear usuario de prueba
    console.log('⚠️ No se encontró usuario válido, usando usuario de prueba');
    const testUser = { name: 'Usuario Prueba', email: 'test@petstyle.com' };
    console.log('🧪 Usuario de prueba creado:', testUser);
    return testUser;
}

function loadFavorites() {
    console.log('📋 Cargando favoritos...');
    
    if (!currentUser || !currentUser.email) {
        console.log('❌ No hay usuario válido');
        showEmptyState();
        return;
    }
    
    const favoritesKey = `favorites_${currentUser.email}`;
    console.log('🔑 Buscando favoritos con clave:', favoritesKey);
    
    const favoritesData = localStorage.getItem(favoritesKey);
    console.log('📦 Datos de favoritos encontrados:', favoritesData);
    
    favorites = favoritesData ? JSON.parse(favoritesData) : [];
    console.log(`📦 Favoritos cargados: ${favorites.length} productos`);
    
    // Debug: mostrar contenido de favoritos
    if (favorites.length > 0) {
        console.log('❤️ Productos en favoritos:');
        favorites.forEach((fav, index) => {
            console.log(`${index + 1}. ${fav.name} - ID: ${fav.id}`);
        });
    } else {
        console.log('💔 No hay productos en favoritos');
        
        // Debug: verificar si hay favoritos con diferentes claves
        console.log('🔍 Verificando otras posibles claves de favoritos...');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('favorites_')) {
                const data = localStorage.getItem(key);
                console.log(`- ${key}: ${JSON.parse(data).length} items`);
            }
        }
    }
    
    updateFavoritesCounter();
    renderFavorites();
}

function updateFavoritesCounter() {
    const counter = document.getElementById('favorites-counter');
    if (counter) {
        const count = favorites.length;
        counter.textContent = count === 1 ? '1 producto' : `${count} productos`;
    }
}

function renderFavorites() {
    const emptyState = document.getElementById('empty-state');
    const favoritesList = document.getElementById('favorites-list');
    
    if (favorites.length === 0) {
        showEmptyState();
        return;
    }
    
    // Ocultar estado vacío y mostrar lista
    if (emptyState) emptyState.style.display = 'none';
    if (favoritesList) {
        favoritesList.style.display = 'block';
        favoritesList.className = 'favorites-list show';
    }
    
    // Limpiar lista
    favoritesList.innerHTML = '';
    
    // Renderizar cada favorito
    favorites.forEach(favorite => {
        const favoriteCard = createFavoriteCard(favorite);
        favoritesList.appendChild(favoriteCard);
    });
    
    console.log(`✅ ${favorites.length} favoritos renderizados`);
}

function createFavoriteCard(favorite) {
    const card = document.createElement('div');
    card.className = 'favorite-card';
    card.dataset.favoriteId = favorite.id;
    
    // Procesar datos
    const name = favorite.name || 'Producto sin nombre';
    const price = favorite.price || 0;
    const image = favorite.image || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop';
    const category = getCategoryName(favorite.category) || 'General';
    
    card.innerHTML = `
        <div class="favorite-card-content">
            <div class="favorite-image">
                <img src="${image}" alt="${name}" onerror="this.src='https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop'">
            </div>
            <div class="favorite-info">
                <div class="favorite-header">
                    <div class="favorite-name">${name}</div>
                    <button class="remove-favorite-btn" onclick="showRemoveConfirmation('${favorite.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="favorite-category">${category}</div>
                <div class="favorite-footer">
                    <div class="favorite-price">$${price.toFixed(2)}</div>
                    <button class="add-to-cart-btn" onclick="addToCartFromFavorites('${favorite.id}')">
                        <i class="fas fa-shopping-cart"></i>
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function getCategoryName(categoryId) {
    if (!categoryId) return 'General';
    return categoryMap[categoryId] || categoryId;
}

function showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const favoritesList = document.getElementById('favorites-list');
    
    if (emptyState) emptyState.style.display = 'flex';
    if (favoritesList) favoritesList.style.display = 'none';
}

// Funciones de acciones
function showRemoveConfirmation(productId) {
    console.log('❤️ Mostrando confirmación para remover:', productId);
    productToRemove = productId;
    
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    productToRemove = null;
}

function confirmRemoveFavorite() {
    if (!productToRemove) return;
    
    console.log('💔 Removiendo de favoritos:', productToRemove);
    
    // Encontrar y remover el producto
    const index = favorites.findIndex(fav => fav.id === productToRemove);
    if (index > -1) {
        const removedProduct = favorites.splice(index, 1)[0];
        console.log('✅ Producto removido:', removedProduct.name);
        
        // Guardar favoritos actualizados
        saveFavorites();
        
        // Actualizar UI
        updateFavoritesCounter();
        renderFavorites();
        updateNavigationCounts();
        
        // Mostrar notificación
        showNotification('Removido de favoritos', 'remove');
    }
    
    // Cerrar modal
    closeConfirmModal();
}

function addToCartFromFavorites(productId) {
    console.log('🛒 Agregando al carrito desde favoritos:', productId);
    
    if (!currentUser || !currentUser.email) {
        showNotification('Debes iniciar sesión', 'error');
        return;
    }
    
    // Encontrar el producto en favoritos
    const favorite = favorites.find(fav => fav.id === productId);
    if (!favorite) {
        showNotification('Producto no encontrado', 'error');
        return;
    }
    
    // Obtener carrito actual
    let cart = getCart();
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
        showNotification('Cantidad actualizada en el carrito', 'success');
    } else {
        cart.push({
            id: productId,
            name: favorite.name,
            price: favorite.price,
            quantity: 1,
            subtotal: favorite.price,
            image: favorite.image,
            addedAt: new Date().toISOString()
        });
        showNotification('Agregado al carrito', 'success');
    }
    
    // Guardar carrito
    saveCart(cart);
    
    // Actualizar contadores
    updateNavigationCounts();
}

// Funciones de persistencia
function saveFavorites() {
    if (!currentUser || !currentUser.email) return;
    
    const favoritesKey = `favorites_${currentUser.email}`;
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
    console.log('💾 Favoritos guardados:', favorites.length);
}

function getCart() {
    if (!currentUser || !currentUser.email) return [];
    
    const cartKey = `cart_${currentUser.email}`;
    const cart = localStorage.getItem(cartKey);
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    if (!currentUser || !currentUser.email) return;
    
    const cartKey = `cart_${currentUser.email}`;
    localStorage.setItem(cartKey, JSON.stringify(cart));
    console.log('💾 Carrito guardado:', cart.length, 'items');
}

// Actualizar contadores de navegación
function updateNavigationCounts() {
    const favoritesFromStorage = getCurrentFavorites();
    const cart = getCart();
    
    // Actualizar contador de favoritos
    const favoritesCount = document.getElementById('nav-favorites-count');
    if (favoritesCount) {
        favoritesCount.textContent = favoritesFromStorage.length;
        favoritesCount.className = `notification-badge ${favoritesFromStorage.length > 0 ? 'show' : ''}`;
    }
    
    // Actualizar contador de carrito
    const cartCount = document.getElementById('nav-cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.className = `notification-badge ${totalItems > 0 ? 'show' : ''}`;
    }
}

function getCurrentFavorites() {
    if (!currentUser || !currentUser.email) return [];
    
    const favoritesKey = `favorites_${currentUser.email}`;
    const favoritesData = localStorage.getItem(favoritesKey);
    return favoritesData ? JSON.parse(favoritesData) : [];
}

// Funciones de navegación
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'main.html';
    }
}

function goToProducts() {
    window.location.href = 'main.html';
}

// Función de notificaciones
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'remove' ? '#FF9800' : '#f44336'};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
        max-width: 280px;
        font-size: 14px;
    `;
    
    const icon = type === 'success' ? '✅' : type === 'remove' ? '💔' : '❌';
    notification.innerHTML = `${icon} ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Event listeners
window.addEventListener('storage', function(e) {
    if (e.key === 'currentUser' || e.key === 'userEmail' || e.key === 'userName') {
        console.log('🔔 Detectado cambio de usuario en favoritos, recargando...');
        setTimeout(() => {
            location.reload();
        }, 100);
    }
});

document.addEventListener('click', function(e) {
    const modal = document.getElementById('confirm-modal');
    if (e.target === modal) {
        closeConfirmModal();
    }
});

// Funciones globales para debugging
window.debugFavorites = function() {
    console.log('🔍 Debug favoritos:');
    console.log('- Usuario actual:', currentUser);
    console.log('- Email del usuario:', currentUser ? currentUser.email : 'No hay usuario');
    console.log('- Favoritos en memoria:', favorites);
    console.log('- Longitud de favoritos:', favorites ? favorites.length : 0);
    
    if (currentUser && currentUser.email) {
        const favKey = `favorites_${currentUser.email}`;
        const cartKey = `cart_${currentUser.email}`;
        console.log('- Clave de favoritos:', favKey);
        console.log('- Favoritos en localStorage:', localStorage.getItem(favKey));
        console.log('- Carrito en localStorage:', localStorage.getItem(cartKey));
    } else {
        console.log('❌ No se puede acceder a localStorage sin usuario válido');
    }
    
    console.log('📦 Todas las claves de favoritos en localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('favorites_')) {
            const data = localStorage.getItem(key);
            const count = data ? JSON.parse(data).length : 0;
            console.log(`  - ${key}: ${count} productos`);
        }
    }
};

window.showUserInfo = function() {
    console.log('👤 Información del usuario:');
    console.log('- currentUser:', currentUser);
    console.log('- localStorage.currentUser:', localStorage.getItem('currentUser'));
    console.log('- sessionStorage.currentUser:', sessionStorage.getItem('currentUser'));
    console.log('- localStorage.userEmail:', localStorage.getItem('userEmail'));
    console.log('- localStorage.userName:', localStorage.getItem('userName'));
};

window.testFavoriteData = function() {
    console.log('🧪 Agregando producto de prueba...');
    
    if (!currentUser || !currentUser.email) {
        console.log('❌ No hay usuario válido para agregar producto de prueba');
        return;
    }
    
    const testFavorite = {
        id: 'test-product-' + Date.now(),
        name: 'Producto de Prueba',
        price: 25.99,
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop',
        category: '6898049bdd53186ec08fd313',
        addedAt: new Date().toISOString()
    };
    
    const favKey = `favorites_${currentUser.email}`;
    const currentFavs = JSON.parse(localStorage.getItem(favKey) || '[]');
    currentFavs.push(testFavorite);
    localStorage.setItem(favKey, JSON.stringify(currentFavs));
    
    console.log('✅ Producto de prueba agregado:', testFavorite);
    loadFavorites();
};

// Añadir estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .favorite-card {
        animation: fadeInUp 0.3s ease;
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

console.log('❤️ Favorites page script cargado correctamente');