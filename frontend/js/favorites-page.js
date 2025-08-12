// ===== FAVORITES PAGE JAVASCRIPT - VERSIÓN CORREGIDA =====
console.log('❤️ Favorites page script cargado correctamente');

let currentUser = null;
let favorites = [];
let productToRemove = null;

// Mapeo de categorías ObjectId a nombres
const categoryMap = {
    '6898049bdd53186ec08fd313': 'Perros',
    '6898049bdd53186ec08fd316': 'Gatos',
    '6898049bdd53186ec08fd314': 'Aves',
    '6898049bdd53186ec08fd315': 'Peces',
    '6898049bdd53186ec08fd317': 'Roedores'
};

// ===== FUNCIONES DE PERSISTENCIA =====
function getUserKey() {
    return (currentUser && currentUser.email) ? currentUser.email : 'guest';
}

function loadFavorites() {
    try {
        const userKey = getUserKey();
        const favoritesKey = `favorites_${userKey}`;
        const storedFavorites = localStorage.getItem(favoritesKey);
        favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
        console.log(`📦 Favoritos cargados para ${userKey}:`, favorites.length);
        return favorites;
    } catch (error) {
        console.error('Error cargando favoritos:', error);
        favorites = [];
        return [];
    }
}

function saveFavorites() {
    try {
        const userKey = getUserKey();
        const favoritesKey = `favorites_${userKey}`;
        localStorage.setItem(favoritesKey, JSON.stringify(favorites));
        console.log(`💾 Favoritos guardados para ${userKey}:`, favorites.length);
        updateFavoritesCounter();
        updateNavCounters();
    } catch (error) {
        console.error('Error guardando favoritos:', error);
    }
}

function removeFavorite(productId) {
    favorites = favorites.filter(id => id !== productId);
    saveFavorites();
    displayFavorites();
    
    // Actualizar el corazón en main si existe
    const heartIcon = document.querySelector(`[data-product-id="${productId}"] .favorite-btn i`);
    if (heartIcon) {
        heartIcon.classList.remove('fas', 'favorited');
        heartIcon.classList.add('far');
    }
}

// ===== FUNCIONES DE VISUALIZACIÓN =====
function updateFavoritesCounter() {
    const counter = document.getElementById('favorites-counter');
    if (counter) {
        const count = favorites.length;
        counter.textContent = `${count} producto${count !== 1 ? 's' : ''}`;
    }
}

function updateNavCounters() {
    // Actualizar contador de favoritos en nav
    const favCountElement = document.getElementById('nav-favorites-count');
    if (favCountElement) {
        const favCount = favorites.length;
        favCountElement.textContent = favCount;
        favCountElement.style.display = favCount > 0 ? 'flex' : 'none';
    }

    // Actualizar contador de carrito en nav
    const cartCountElement = document.getElementById('nav-cart-count');
    if (cartCountElement) {
        const userKey = getUserKey();
        const cartKey = `cart_${userKey}`;
        const cartItems = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}

function showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const favoritesList = document.getElementById('favorites-list');
    
    if (emptyState && favoritesList) {
        emptyState.style.display = 'block';
        favoritesList.style.display = 'none';
    }
}

function hideEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const favoritesList = document.getElementById('favorites-list');
    
    if (emptyState && favoritesList) {
        emptyState.style.display = 'none';
        favoritesList.style.display = 'block';
    }
}

async function displayFavorites() {
    console.log('🎨 Mostrando favoritos:', favorites.length);
    
    if (favorites.length === 0) {
        showEmptyState();
        updateFavoritesCounter();
        return;
    }

    hideEmptyState();
    
    try {
        // Obtener productos desde API
        const products = await fetchAllProducts();
        const favoriteProducts = products.filter(product => 
            favorites.includes(product._id)
        );

        console.log('🛍️ Productos favoritos encontrados:', favoriteProducts.length);

        const favoritesList = document.getElementById('favorites-list');
        if (!favoritesList) {
            console.error('No se encontró el contenedor favorites-list');
            return;
        }

        if (favoriteProducts.length === 0) {
            favoritesList.innerHTML = `
                <div class="no-products-message">
                    <p>Algunos productos favoritos ya no están disponibles</p>
                </div>
            `;
            return;
        }

        favoritesList.innerHTML = favoriteProducts.map(product => {
            const categoryName = categoryMap[product.category_id] || 'Sin categoría';
            const imageUrl = product.image && product.image.startsWith('http') 
                ? product.image 
                : `../images/products/${product.image || 'placeholder.jpg'}`;

            return `
                <div class="favorite-item" data-product-id="${product._id}">
                    <div class="product-image-container">
                        <img src="${imageUrl}" 
                             alt="${product.name}" 
                             class="product-image"
                             onerror="this.src='../images/products/placeholder.jpg'">
                        <button class="remove-favorite-btn" onclick="showRemoveConfirmation('${product._id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="product-info">
                        <div class="product-header">
                            <h3 class="product-name">${product.name}</h3>
                            <span class="product-category">${categoryName}</span>
                        </div>
                        
                        <p class="product-description">${product.description || 'Sin descripción disponible'}</p>
                        
                        <div class="product-price">
                            <span class="current-price">$${Number(product.price).toLocaleString()}</span>
                            ${product.original_price && product.original_price > product.price ? 
                                `<span class="original-price">$${Number(product.original_price).toLocaleString()}</span>` : ''
                            }
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn-add-to-cart" onclick="addToCartFromFavorites('${product._id}')">
                                <i class="fas fa-shopping-cart"></i>
                                Agregar al Carrito
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error mostrando favoritos:', error);
        const favoritesList = document.getElementById('favorites-list');
        if (favoritesList) {
            favoritesList.innerHTML = `
                <div class="error-message">
                    <p>Error cargando los favoritos. Intenta recargar la página.</p>
                </div>
            `;
        }
    }
    
    updateFavoritesCounter();
}

// ===== FUNCIONES DE CARRITO =====
function getCart() {
    try {
        const userKey = getUserKey();
        const cartKey = `cart_${userKey}`;
        const cart = localStorage.getItem(cartKey);
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Error cargando carrito:', error);
        return [];
    }
}

function saveCart(cartItems) {
    try {
        const userKey = getUserKey();
        const cartKey = `cart_${userKey}`;
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
        console.log(`🛒 Carrito guardado para ${userKey}:`, cartItems.length);
        updateNavCounters();
    } catch (error) {
        console.error('Error guardando carrito:', error);
    }
}

async function addToCartFromFavorites(productId) {
    try {
        console.log('🛒 Agregando al carrito desde favoritos:', productId);
        
        const products = await fetchAllProducts();
        const product = products.find(p => p._id === productId);
        
        if (!product) {
            showNotification('Producto no encontrado', 'error');
            return;
        }

        let cartItems = getCart();
        const existingItem = cartItems.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += 1;
            showNotification(`Cantidad aumentada: ${product.name}`, 'success');
        } else {
            cartItems.push({
                productId: productId,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
            showNotification(`Agregado al carrito: ${product.name}`, 'success');
        }

        saveCart(cartItems);
        
        // Animar el botón
        const button = event.target.closest('.btn-add-to-cart');
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        }

    } catch (error) {
        console.error('Error agregando al carrito:', error);
        showNotification('Error al agregar al carrito', 'error');
    }
}

// ===== FUNCIONES DE CONFIRMACIÓN =====
function showRemoveConfirmation(productId) {
    productToRemove = productId;
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    productToRemove = null;
}

function confirmRemoveFavorite() {
    if (productToRemove) {
        removeFavorite(productToRemove);
        showNotification('Producto removido de favoritos', 'success');
    }
    closeConfirmModal();
}

// ===== FUNCIONES DE API =====
async function fetchAllProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.products || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback: intentar cargar productos desde localStorage como backup
        const backupProducts = localStorage.getItem('backup_products');
        return backupProducts ? JSON.parse(backupProducts) : [];
    }
}

// ===== FUNCIONES DE NAVEGACIÓN =====
function goToProducts() {
    window.location.href = 'main.html';
}

// ===== FUNCIONES DE NOTIFICACIÓN =====
function showNotification(message, type = 'info') {
    // Crear o reutilizar contenedor de notificaciones
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        transform: translateX(300px);
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: auto;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    container.appendChild(notification);

    // Mostrar notificación
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);

    // Ocultar y eliminar notificación
    setTimeout(() => {
        notification.style.transform = 'translateX(300px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===== FUNCIONES DE AUTENTICACIÓN =====
function loadUserSession() {
    try {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            currentUser = JSON.parse(userData);
            console.log('👤 Usuario cargado:', currentUser.email || 'guest');
        } else {
            currentUser = null;
            console.log('👤 Usuario invitado');
        }
    } catch (error) {
        console.error('Error cargando sesión:', error);
        currentUser = null;
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando página de favoritos');
    
    try {
        // Cargar sesión de usuario
        loadUserSession();
        
        // Cargar favoritos
        loadFavorites();
        
        // Mostrar favoritos
        await displayFavorites();
        
        // Actualizar contadores
        updateNavCounters();
        
        console.log('✅ Página de favoritos inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando página de favoritos:', error);
    }
});

// ===== EVENT LISTENERS =====
// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(event) {
    const modal = document.getElementById('confirm-modal');
    if (modal && event.target === modal) {
        closeConfirmModal();
    }
});

// Detectar cambios de localStorage (sincronización entre pestañas)
window.addEventListener('storage', function(e) {
    if (e.key && (e.key.includes('favorites_') || e.key.includes('cart_'))) {
        console.log('🔄 Detectado cambio en storage, recargando...');
        loadFavorites();
        displayFavorites();
        updateNavCounters();
    }
});

console.log('❤️ Favorites page script inicializado completamente');