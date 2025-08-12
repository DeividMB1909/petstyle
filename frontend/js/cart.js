// ===== CART PAGE JAVASCRIPT - VERSIÓN CORREGIDA =====
console.log('🛒 Cart page script cargado correctamente');

let currentUser = null;
let cartItems = [];
let shippingCost = 0;
let discountAmount = 0;
let appliedDiscount = null;

// Mapeo de categorías ObjectId a nombres
const categoryMap = {
    '6898049bdd53186ec08fd313': 'Perros',
    '6898049bdd53186ec08fd316': 'Gatos',
    '6898049bdd53186ec08fd314': 'Aves',
    '6898049bdd53186ec08fd315': 'Peces',
    '6898049bdd53186ec08fd317': 'Roedores'
};

// Códigos de descuento disponibles
const discountCodes = {
    'PETSTYLE10': { discount: 0.10, minAmount: 50000, description: '10% de descuento' },
    'PRIMERA20': { discount: 0.20, minAmount: 30000, description: '20% de descuento primera compra' },
    'ENVIOGRATIS': { discount: 'free_shipping', minAmount: 25000, description: 'Envío gratis' }
};

// ===== FUNCIONES DE PERSISTENCIA =====
function getUserKey() {
    return (currentUser && currentUser.email) ? currentUser.email : 'guest';
}

function loadCartItems() {
    try {
        const userKey = getUserKey();
        const cartKey = `cart_${userKey}`;
        const storedCart = localStorage.getItem(cartKey);
        cartItems = storedCart ? JSON.parse(storedCart) : [];
        console.log(`📦 Carrito cargado para ${userKey}:`, cartItems.length);
        return cartItems;
    } catch (error) {
        console.error('Error cargando carrito:', error);
        cartItems = [];
        return [];
    }
}

function saveCartItems() {
    try {
        const userKey = getUserKey();
        const cartKey = `cart_${userKey}`;
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
        console.log(`💾 Carrito guardado para ${userKey}:`, cartItems.length);
        updateNavCounters();
    } catch (error) {
        console.error('Error guardando carrito:', error);
    }
}

function getFavorites() {
    try {
        const userKey = getUserKey();
        const favoritesKey = `favorites_${userKey}`;
        const favorites = localStorage.getItem(favoritesKey);
        return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
        console.error('Error cargando favoritos:', error);
        return [];
    }
}

function saveFavorites(favorites) {
    try {
        const userKey = getUserKey();
        const favoritesKey = `favorites_${userKey}`;
        localStorage.setItem(favoritesKey, JSON.stringify(favorites));
        updateNavCounters();
    } catch (error) {
        console.error('Error guardando favoritos:', error);
    }
}

// ===== FUNCIONES DE VISUALIZACIÓN =====
function updateNavCounters() {
    // Actualizar contador de carrito
    const cartCountElement = document.getElementById('nav-cart-count');
    if (cartCountElement) {
        const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
    }

    // Actualizar contador de favoritos
    const favCountElement = document.getElementById('nav-favorites-count');
    if (favCountElement) {
        const favorites = getFavorites();
        const favCount = favorites.length;
        favCountElement.textContent = favCount;
        favCountElement.style.display = favCount > 0 ? 'flex' : 'none';
    }
}

function updateCartCounter() {
    const counter = document.getElementById('cart-counter');
    if (counter) {
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        counter.textContent = `${totalItems} producto${totalItems !== 1 ? 's' : ''}`;
    }
}

function showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const cartContent = document.getElementById('cart-content');
    
    if (emptyState && cartContent) {
        emptyState.style.display = 'block';
        cartContent.style.display = 'none';
    }
}

function hideEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const cartContent = document.getElementById('cart-content');
    
    if (emptyState && cartContent) {
        emptyState.style.display = 'none';
        cartContent.style.display = 'block';
    }
}

async function displayCartItems() {
    console.log('🎨 Mostrando items del carrito:', cartItems.length);
    
    if (cartItems.length === 0) {
        showEmptyState();
        updateCartCounter();
        updateTotalPrice();
        return;
    }

    hideEmptyState();

    try {
        // Obtener productos desde API para datos actualizados
        const products = await fetchAllProducts();
        
        const cartList = document.getElementById('cart-items-list');
        if (!cartList) {
            console.error('No se encontró el contenedor cart-items-list');
            return;
        }

        const cartItemsHTML = cartItems.map(item => {
            // Buscar producto actualizado desde API
            const product = products.find(p => p._id === item.productId);
            const currentPrice = product ? product.price : item.price;
            const isOnSale = product && product.original_price && product.original_price > product.price;
            
            const imageUrl = item.image && item.image.startsWith('http') 
                ? item.image 
                : `../images/products/${item.image || 'placeholder.jpg'}`;

            // Verificar si está en favoritos
            const favorites = getFavorites();
            const isFavorite = favorites.includes(item.productId);

            return `
                <div class="cart-item" data-product-id="${item.productId}">
                    <div class="item-image">
                        <img src="${imageUrl}" 
                             alt="${item.name}" 
                             onerror="this.src='../images/products/placeholder.jpg'">
                        ${isOnSale ? '<div class="sale-badge">OFERTA</div>' : ''}
                    </div>
                    
                    <div class="item-details">
                        <div class="item-header">
                            <h3 class="item-name">${item.name}</h3>
                            <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" 
                                    onclick="toggleFavoriteFromCart('${item.productId}')">
                                <i class="fa${isFavorite ? 's' : 'r'} fa-heart"></i>
                            </button>
                        </div>
                        
                        <div class="item-price">
                            <span class="current-price">$${Number(currentPrice).toLocaleString()}</span>
                            ${isOnSale ? 
                                `<span class="original-price">$${Number(product.original_price).toLocaleString()}</span>` 
                                : ''}
                        </div>
                        
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateQuantity('${item.productId}', ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity('${item.productId}', ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        
                        <div class="item-total">
                            <span class="total-price">$${(Number(currentPrice) * item.quantity).toLocaleString()}</span>
                        </div>
                        
                        <button class="remove-item-btn" onclick="removeFromCart('${item.productId}')">
                            <i class="fas fa-trash"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        cartList.innerHTML = cartItemsHTML;
        updateCartCounter();
        updateTotalPrice();

    } catch (error) {
        console.error('Error mostrando items del carrito:', error);
        const cartList = document.getElementById('cart-items-list');
        if (cartList) {
            cartList.innerHTML = `
                <div class="error-message">
                    <p>Error cargando el carrito. Intenta recargar la página.</p>
                </div>
            `;
        }
    }
}

// ===== FUNCIONES DE CARRITO =====
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (newQuantity > 99) {
        showNotification('Cantidad máxima: 99 unidades', 'warning');
        return;
    }

    const item = cartItems.find(item => item.productId === productId);
    if (item) {
        const oldQuantity = item.quantity;
        item.quantity = newQuantity;
        
        saveCartItems();
        
        // Actualizar solo el item específico en el DOM
        updateCartItemDisplay(productId);
        updateTotalPrice();
        
        showNotification(
            `Cantidad ${newQuantity > oldQuantity ? 'aumentada' : 'reducida'}: ${item.name}`, 
            'success'
        );
    }
}

function updateCartItemDisplay(productId) {
    const cartItemElement = document.querySelector(`[data-product-id="${productId}"]`);
    const item = cartItems.find(item => item.productId === productId);
    
    if (cartItemElement && item) {
        const quantityElement = cartItemElement.querySelector('.quantity');
        const totalElement = cartItemElement.querySelector('.total-price');
        
        if (quantityElement) quantityElement.textContent = item.quantity;
        if (totalElement) {
            const total = Number(item.price) * item.quantity;
            totalElement.textContent = `$${total.toLocaleString()}`;
        }
    }
}

function removeFromCart(productId) {
    const item = cartItems.find(item => item.productId === productId);
    if (!item) return;

    cartItems = cartItems.filter(item => item.productId !== productId);
    saveCartItems();
    displayCartItems();
    
    showNotification(`Eliminado del carrito: ${item.name}`, 'success');
}

function clearCart() {
    cartItems = [];
    saveCartItems();
    displayCartItems();
    showNotification('Carrito vaciado', 'success');
}

async function toggleFavoriteFromCart(productId) {
    try {
        let favorites = getFavorites();
        const isFavorite = favorites.includes(productId);
        
        if (isFavorite) {
            favorites = favorites.filter(id => id !== productId);
            showNotification('Removido de favoritos', 'success');
        } else {
            favorites.push(productId);
            showNotification('Agregado a favoritos', 'success');
        }
        
        saveFavorites(favorites);
        
        // Actualizar icono
        const heartButton = document.querySelector(`[data-product-id="${productId}"] .favorite-btn`);
        const heartIcon = heartButton?.querySelector('i');
        
        if (heartIcon) {
            if (isFavorite) {
                heartIcon.className = 'far fa-heart';
                heartButton.classList.remove('favorited');
            } else {
                heartIcon.className = 'fas fa-heart';
                heartButton.classList.add('favorited');
            }
        }
        
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showNotification('Error al actualizar favoritos', 'error');
    }
}

// ===== FUNCIONES DE PRECIO Y DESCUENTOS =====
function calculateSubtotal() {
    return cartItems.reduce((total, item) => {
        return total + (Number(item.price) * item.quantity);
    }, 0);
}

function calculateShipping(subtotal) {
    // Envío gratis para compras mayores a $50.000
    if (subtotal >= 50000 || (appliedDiscount && appliedDiscount.discount === 'free_shipping')) {
        return 0;
    }
    // Envío estándar $5.000
    return 5000;
}

function applyDiscount(code) {
    const discount = discountCodes[code.toUpperCase()];
    if (!discount) {
        showNotification('Código de descuento no válido', 'error');
        return false;
    }

    const subtotal = calculateSubtotal();
    if (subtotal < discount.minAmount) {
        showNotification(`Compra mínima requerida: $${discount.minAmount.toLocaleString()}`, 'warning');
        return false;
    }

    appliedDiscount = { code: code.toUpperCase(), ...discount };
    
    if (discount.discount === 'free_shipping') {
        discountAmount = 0;
        shippingCost = 0;
    } else {
        discountAmount = Math.floor(subtotal * discount.discount);
        shippingCost = calculateShipping(subtotal);
    }

    updateTotalPrice();
    updateDiscountDisplay();
    showNotification(`Código aplicado: ${discount.description}`, 'success');
    
    // Limpiar el campo de código
    const discountInput = document.getElementById('discount-code');
    if (discountInput) discountInput.value = '';
    
    return true;
}

function removeDiscount() {
    appliedDiscount = null;
    discountAmount = 0;
    shippingCost = calculateShipping(calculateSubtotal());
    updateTotalPrice();
    updateDiscountDisplay();
    showNotification('Descuento removido', 'success');
}

function updateTotalPrice() {
    const subtotal = calculateSubtotal();
    shippingCost = calculateShipping(subtotal);
    const total = subtotal - discountAmount + shippingCost;

    // Actualizar elementos del DOM
    const subtotalElement = document.getElementById('subtotal-amount');
    const shippingElement = document.getElementById('shipping-amount');
    const discountElement = document.getElementById('discount-amount');
    const totalElement = document.getElementById('total-amount');

    if (subtotalElement) subtotalElement.textContent = `${subtotal.toLocaleString()}`;
    if (shippingElement) {
        shippingElement.textContent = shippingCost === 0 ? 'GRATIS' : `${shippingCost.toLocaleString()}`;
    }
    if (discountElement) {
        discountElement.textContent = discountAmount > 0 ? `-${discountAmount.toLocaleString()}` : '$0';
    }
    if (totalElement) totalElement.textContent = `${total.toLocaleString()}`;
}

function updateDiscountDisplay() {
    const discountSection = document.querySelector('.discount-applied');
    const discountInput = document.querySelector('.discount-input');

    if (appliedDiscount) {
        if (discountSection) {
            discountSection.style.display = 'flex';
            const discountText = discountSection.querySelector('.discount-text');
            if (discountText) {
                discountText.textContent = `${appliedDiscount.code} - ${appliedDiscount.description}`;
            }
        }
        if (discountInput) {
            discountInput.style.display = 'none';
        }
    } else {
        if (discountSection) discountSection.style.display = 'none';
        if (discountInput) discountInput.style.display = 'flex';
    }
}

// ===== FUNCIONES DE COMPRA =====
function proceedToCheckout() {
    if (cartItems.length === 0) {
        showNotification('El carrito está vacío', 'warning');
        return;
    }

    const total = calculateSubtotal() - discountAmount + shippingCost;
    
    // Crear datos de la compra
    const purchaseData = {
        items: cartItems,
        subtotal: calculateSubtotal(),
        discount: {
            code: appliedDiscount?.code || null,
            amount: discountAmount
        },
        shipping: shippingCost,
        total: total,
        timestamp: new Date().toISOString(),
        user: currentUser || { email: 'guest' }
    };

    // Guardar datos de compra temporalmente
    sessionStorage.setItem('pendingPurchase', JSON.stringify(purchaseData));
    
    showNotification('Procesando compra...', 'success');
    
    // Simular proceso de compra
    setTimeout(() => {
        completePurchase();
    }, 2000);
}

function completePurchase() {
    // Limpiar carrito
    clearCart();
    
    // Mostrar mensaje de éxito
    showPurchaseSuccess();
    
    // Limpiar datos temporales
    sessionStorage.removeItem('pendingPurchase');
}

function showPurchaseSuccess() {
    const modal = document.createElement('div');
    modal.className = 'purchase-success-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>¡Compra Exitosa!</h3>
            <p>Tu pedido ha sido procesado correctamente</p>
            <div class="modal-actions">
                <button class="btn-primary" onclick="closePurchaseModal()">
                    Continuar Comprando
                </button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closePurchaseModal() {
    const modal = document.querySelector('.purchase-success-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
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
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#FF9800' : '#2196F3'};
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

// ===== EVENT HANDLERS =====
function handleDiscountCode() {
    const discountInput = document.getElementById('discount-code');
    const code = discountInput?.value.trim();
    
    if (!code) {
        showNotification('Ingresa un código de descuento', 'warning');
        return;
    }
    
    applyDiscount(code);
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando página de carrito');
    
    try {
        // Cargar sesión de usuario
        loadUserSession();
        
        // Cargar items del carrito
        loadCartItems();
        
        // Mostrar items del carrito
        await displayCartItems();
        
        // Actualizar contadores
        updateNavCounters();
        
        // Configurar event listeners para descuentos
        const applyDiscountBtn = document.getElementById('apply-discount');
        if (applyDiscountBtn) {
            applyDiscountBtn.addEventListener('click', handleDiscountCode);
        }
        
        const discountInput = document.getElementById('discount-code');
        if (discountInput) {
            discountInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleDiscountCode();
                }
            });
        }
        
        console.log('✅ Página de carrito inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando página de carrito:', error);
    }
});

// ===== EVENT LISTENERS =====
// Detectar cambios de localStorage (sincronización entre pestañas)
window.addEventListener('storage', function(e) {
    if (e.key && (e.key.includes('cart_') || e.key.includes('favorites_'))) {
        console.log('🔄 Detectado cambio en storage, recargando...');
        loadCartItems();
        displayCartItems();
        updateNavCounters();
    }
});

console.log('🛒 Cart page script inicializado completamente');