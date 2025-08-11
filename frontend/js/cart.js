// ===== CART PAGE JAVASCRIPT - ESTILO MERCADOLIBRE =====
let currentUser = null;
let cartItems = [];
let shippingCost = 0;
let discountAmount = 0;
let appliedDiscount = null;

// Mapeo de categorías ObjectId a nombres
const categoryMap = {
    '6898049bdd53186ec08fd313': 'Perros',
    '6898049bdd53186ec08fd316': 'Gatos', 
    '6898049bdd53186ec08fd319': 'Aves',
    '6898049bdd53186ec08fd31c': 'Peces',
    '6898049bdd53186ec08fd31f': 'Accesorios'
};

// Códigos de descuento válidos
const validDiscountCodes = {
    'PETSTYLE10': { discount: 10, type: 'percentage', description: '10% de descuento' },
    'WELCOME5': { discount: 5, type: 'fixed', description: '$5 de descuento' },
    'NEWPET15': { discount: 15, type: 'percentage', description: '15% de descuento' },
    'SAVE20': { discount: 20, type: 'fixed', description: '$20 de descuento' }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Inicializando página de carrito...');
    initializeCartPage();
});

function initializeCartPage() {
    try {
        console.log('🚀 Iniciando inicialización del carrito...');
        
        // Obtener usuario actual
        currentUser = getCurrentUser();
        console.log('👤 Usuario actual obtenido:', currentUser);
        
        // Cargar productos del carrito
        loadCartItems();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Actualizar contadores de navegación
        updateNavigationCounts();
        
        console.log('✅ Página de carrito inicializada correctamente');
    } catch (error) {
        console.error('❌ Error inicializando carrito:', error);
        showEmptyCart();
    }
}

function getCurrentUser() {
    console.log('👤 === OBTENIENDO USUARIO PARA CARRITO ===');
    
    // Método 1: localStorage.currentUser
    let userData = localStorage.getItem('currentUser');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user && user.email) {
                console.log('✅ Usuario desde localStorage.currentUser:', user);
                return user;
            }
        } catch (error) {
            console.error('❌ Error parsing currentUser:', error);
        }
    }
    
    // Método 2: sessionStorage.currentUser
    userData = sessionStorage.getItem('currentUser');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user && user.email) {
                console.log('✅ Usuario desde sessionStorage.currentUser:', user);
                return user;
            }
        } catch (error) {
            console.error('❌ Error parsing sessionStorage currentUser:', error);
        }
    }
    
    // Método 3: userEmail y userName separados
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    
    if (userEmail && userName) {
        const user = { name: userName, email: userEmail };
        console.log('✅ Usuario desde email/name separados:', user);
        return user;
    }
    
    console.log('⚠️ No se encontró usuario válido, usando usuario de prueba');
    return { name: 'Usuario Prueba', email: 'test@petstyle.com' };
}

function loadCartItems() {
    console.log('🛒 Cargando items del carrito...');
    
    if (!currentUser || !currentUser.email) {
        console.log('❌ No hay usuario válido');
        showEmptyCart();
        return;
    }
    
    const cartKey = `cart_${currentUser.email}`;
    console.log('🔑 Buscando carrito con clave:', cartKey);
    
    const cartData = localStorage.getItem(cartKey);
    console.log('📦 Datos del carrito encontrados:', cartData);
    
    cartItems = cartData ? JSON.parse(cartData) : [];
    console.log(`🛒 Items del carrito cargados: ${cartItems.length} productos`);
    
    // Debug: mostrar contenido del carrito
    if (cartItems.length > 0) {
        console.log('🛒 Productos en carrito:');
        cartItems.forEach((item, index) => {
            console.log(`${index + 1}. ${item.name} - Cantidad: ${item.quantity} - Precio: $${item.price}`);
        });
    } else {
        console.log('🛒 Carrito vacío');
    }
    
    renderCartPage();
}

function renderCartPage() {
    const emptyCart = document.getElementById('empty-cart');
    const cartSection = document.getElementById('cart-items');
    const discountSection = document.getElementById('discount-section');
    const shippingSection = document.getElementById('shipping-section');
    const paymentSection = document.getElementById('payment-section');
    const orderSummary = document.getElementById('order-summary');
    const checkoutSection = document.getElementById('checkout-section');
    
    if (cartItems.length === 0) {
        // Mostrar estado vacío
        emptyCart.style.display = 'flex';
        cartSection.classList.add('hidden');
        discountSection.classList.add('hidden');
        shippingSection.classList.add('hidden');
        paymentSection.classList.add('hidden');
        orderSummary.classList.add('hidden');
        checkoutSection.classList.add('hidden');
    } else {
        // Mostrar carrito con productos
        emptyCart.style.display = 'none';
        cartSection.classList.remove('hidden');
        discountSection.classList.remove('hidden');
        shippingSection.classList.remove('hidden');
        paymentSection.classList.remove('hidden');
        orderSummary.classList.remove('hidden');
        checkoutSection.classList.remove('hidden');
        
        renderCartItems();
        updateCartCounter();
        updateOrderSummary();
    }
}

function renderCartItems() {
    const cartProductsList = document.getElementById('cart-products-list');
    
    if (!cartProductsList) return;
    
    cartProductsList.innerHTML = '';
    
    cartItems.forEach((item, index) => {
        const productCard = createCartProductCard(item, index);
        cartProductsList.appendChild(productCard);
    });
    
    console.log(`✅ ${cartItems.length} productos renderizados en carrito`);
}

function createCartProductCard(item, index) {
    const card = document.createElement('div');
    card.className = 'cart-product-card';
    card.dataset.itemIndex = index;
    
    const name = item.name || 'Producto sin nombre';
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    const subtotal = price * quantity;
    const image = item.image || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop';
    
    card.innerHTML = `
        <div class="product-content">
            <div class="product-image">
                <img src="${image}" alt="${name}" onerror="this.src='https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop'">
            </div>
            <div class="product-info">
                <div class="product-header">
                    <div class="product-name">${name}</div>
                    <button class="remove-product-btn" onclick="removeFromCart(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="product-footer">
                    <div class="product-price">$${subtotal.toFixed(2)}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="decreaseQuantity(${index})" ${quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-value">${quantity}</span>
                        <button class="quantity-btn" onclick="increaseQuantity(${index})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function updateCartCounter() {
    const counter = document.getElementById('cart-counter');
    if (counter) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        counter.textContent = totalItems === 1 ? '1 producto' : `${totalItems} productos`;
    }
}

function updateOrderSummary() {
    // Calcular subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calcular envío basado en la opción seleccionada
    const selectedShipping = document.querySelector('input[name="shipping"]:checked');
    if (selectedShipping) {
        switch (selectedShipping.value) {
            case 'express':
                shippingCost = 5.99;
                break;
            case 'priority':
                shippingCost = 12.99;
                break;
            default:
                shippingCost = 0;
                break;
        }
    }
    
    // Calcular descuento
    if (appliedDiscount) {
        if (appliedDiscount.type === 'percentage') {
            discountAmount = subtotal * (appliedDiscount.discount / 100);
        } else {
            discountAmount = appliedDiscount.discount;
        }
    }
    
    // Calcular total
    const total = subtotal + shippingCost - discountAmount;
    
    // Actualizar elementos del DOM
    const summaryItems = document.getElementById('summary-items');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryShipping = document.getElementById('summary-shipping');
    const summaryTotal = document.getElementById('summary-total');
    const discountRow = document.getElementById('discount-row');
    const summaryDiscount = document.getElementById('summary-discount');
    
    if (summaryItems) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        summaryItems.textContent = totalItems === 1 ? '1 producto' : `${totalItems} productos`;
    }
    
    if (summarySubtotal) {
        summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
    }
    
    if (summaryShipping) {
        if (shippingCost === 0) {
            summaryShipping.textContent = 'Gratis';
            summaryShipping.className = 'free';
        } else {
            summaryShipping.textContent = `$${shippingCost.toFixed(2)}`;
            summaryShipping.className = '';
        }
    }
    
    if (discountRow && summaryDiscount) {
        if (discountAmount > 0) {
            discountRow.style.display = 'flex';
            summaryDiscount.textContent = `-$${discountAmount.toFixed(2)}`;
        } else {
            discountRow.style.display = 'none';
        }
    }
    
    if (summaryTotal) {
        summaryTotal.textContent = `$${total.toFixed(2)}`;
    }
}

// Funciones de manipulación del carrito
function increaseQuantity(index) {
    if (index >= 0 && index < cartItems.length) {
        cartItems[index].quantity += 1;
        cartItems[index].subtotal = cartItems[index].quantity * cartItems[index].price;
        
        saveCartItems();
        renderCartItems();
        updateCartCounter();
        updateOrderSummary();
        updateNavigationCounts();
        
        console.log(`➕ Aumentada cantidad del producto: ${cartItems[index].name}`);
    }
}

function decreaseQuantity(index) {
    if (index >= 0 && index < cartItems.length && cartItems[index].quantity > 1) {
        cartItems[index].quantity -= 1;
        cartItems[index].subtotal = cartItems[index].quantity * cartItems[index].price;
        
        saveCartItems();
        renderCartItems();
        updateCartCounter();
        updateOrderSummary();
        updateNavigationCounts();
        
        console.log(`➖ Disminuida cantidad del producto: ${cartItems[index].name}`);
    }
}

function removeFromCart(index) {
    if (index >= 0 && index < cartItems.length) {
        const removedItem = cartItems.splice(index, 1)[0];
        
        saveCartItems();
        renderCartPage();
        updateNavigationCounts();
        
        showNotification(`${removedItem.name} removido del carrito`, 'remove');
        console.log(`🗑️ Producto removido del carrito: ${removedItem.name}`);
    }
}

// Funciones de descuento
function applyDiscount() {
    const discountInput = document.getElementById('discount-code');
    const discountMessage = document.getElementById('discount-message');
    const code = discountInput.value.trim().toUpperCase();
    
    if (!code) {
        showDiscountMessage('Por favor ingresa un código', 'error');
        return;
    }
    
    if (validDiscountCodes[code]) {
        appliedDiscount = validDiscountCodes[code];
        showDiscountMessage(`✅ ${appliedDiscount.description} aplicado`, 'success');
        discountInput.disabled = true;
        document.querySelector('.apply-btn').disabled = true;
        document.querySelector('.apply-btn').textContent = 'Aplicado';
        
        updateOrderSummary();
        console.log(`🏷️ Descuento aplicado: ${code}`);
    } else {
        showDiscountMessage('Código de descuento inválido', 'error');
        console.log(`❌ Código inválido: ${code}`);
    }
}

function showDiscountMessage(message, type) {
    const discountMessage = document.getElementById('discount-message');
    if (discountMessage) {
        discountMessage.textContent = message;
        discountMessage.className = `discount-message ${type}`;
    }
}

// Event listeners
function setupEventListeners() {
    // Opciones de envío
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    shippingOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Actualizar clases visuales
            document.querySelectorAll('.shipping-option').forEach(opt => opt.classList.remove('selected'));
            this.closest('.shipping-option').classList.add('selected');
            
            updateOrderSummary();
            console.log(`🚚 Opción de envío cambiada: ${this.value}`);
        });
    });
    
    // Opciones de pago
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Actualizar clases visuales
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
            this.closest('.payment-option').classList.add('selected');
            
            // Mostrar/ocultar formularios
            showPaymentForm(this.value);
            console.log(`💳 Método de pago cambiado: ${this.value}`);
        });
    });
    
    // Formateo de campos de tarjeta
    setupCardFormatting();
    
    console.log('✅ Event listeners del carrito configurados');
}

function showPaymentForm(paymentMethod) {
    const cardForm = document.getElementById('card-form');
    const paypalForm = document.getElementById('paypal-form');
    
    // Ocultar todos los formularios
    if (cardForm) cardForm.style.display = 'none';
    if (paypalForm) paypalForm.style.display = 'none';
    
    // Mostrar formulario correspondiente
    switch (paymentMethod) {
        case 'card':
            if (cardForm) cardForm.style.display = 'block';
            break;
        case 'paypal':
            if (paypalForm) paypalForm.style.display = 'block';
            break;
        default:
            // Para transferencia y OXXO no hay formulario adicional
            break;
    }
}

function setupCardFormatting() {
    const cardNumber = document.getElementById('card-number');
    const cardExpiry = document.getElementById('card-expiry');
    const cardCvv = document.getElementById('card-cvv');
    
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
            if (formattedValue.length > 19) formattedValue = formattedValue.substring(0, 19);
            e.target.value = formattedValue;
        });
    }
    
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    if (cardCvv) {
        cardCvv.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

// Funciones de persistencia
function saveCartItems() {
    if (!currentUser || !currentUser.email) return;
    
    const cartKey = `cart_${currentUser.email}`;
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
    console.log('💾 Carrito guardado:', cartItems.length, 'items');
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

function showEmptyCart() {
    const emptyCart = document.getElementById('empty-cart');
    if (emptyCart) {
        emptyCart.style.display = 'flex';
    }
}

// Funciones de modales
function showClearCartModal() {
    if (cartItems.length === 0) return;
    
    const modal = document.getElementById('clear-cart-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeClearCartModal() {
    const modal = document.getElementById('clear-cart-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function confirmClearCart() {
    cartItems = [];
    saveCartItems();
    renderCartPage();
    updateNavigationCounts();
    
    closeClearCartModal();
    showNotification('Carrito vaciado', 'remove');
    console.log('🗑️ Carrito vaciado completamente');
}

// Función de checkout
function processCheckout() {
    console.log('💳 Procesando checkout...');
    
    if (cartItems.length === 0) {
        showNotification('El carrito está vacío', 'error');
        return;
    }
    
    // Validar formulario de pago
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    if (!selectedPayment) {
        showNotification('Selecciona un método de pago', 'error');
        return;
    }
    
    // Validar campos según el método de pago
    if (!validatePaymentForm(selectedPayment.value)) {
        return;
    }
    
    // Mostrar loading en el botón
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.classList.add('loading');
    checkoutBtn.disabled = true;
    
    // Simular procesamiento
    setTimeout(() => {
        // Generar número de orden
        const orderNumber = 'PQ' + Date.now().toString().slice(-6);
        
        // Limpiar carrito
        cartItems = [];
        saveCartItems();
        
        // Quitar loading
        checkoutBtn.classList.remove('loading');
        checkoutBtn.disabled = false;
        
        // Mostrar modal de éxito
        showOrderSuccessModal(orderNumber);
        
        // Actualizar contadores
        updateNavigationCounts();
        
        console.log(`✅ Pedido procesado exitosamente: #PET-${orderNumber}`);
    }, 2000);
}

function validatePaymentForm(paymentMethod) {
    switch (paymentMethod) {
        case 'card':
            return validateCardForm();
        case 'paypal':
            return validatePayPalForm();
        default:
            return true; // Para transferencia y OXXO no hay validación adicional
    }
}

function validateCardForm() {
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvv = document.getElementById('card-cvv').value;
    const cardName = document.getElementById('card-name').value.trim();
    
    if (!cardNumber || cardNumber.length < 16) {
        showNotification('Número de tarjeta inválido', 'error');
        return false;
    }
    
    if (!cardExpiry || cardExpiry.length < 5) {
        showNotification('Fecha de vencimiento inválida', 'error');
        return false;
    }
    
    if (!cardCvv || cardCvv.length < 3) {
        showNotification('CVV inválido', 'error');
        return false;
    }
    
    if (!cardName) {
        showNotification('Ingresa el nombre del titular', 'error');
        return false;
    }
    
    return true;
}

function validatePayPalForm() {
    const paypalEmail = document.getElementById('paypal-email').value.trim();
    
    if (!paypalEmail) {
        showNotification('Ingresa tu email de PayPal', 'error');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paypalEmail)) {
        showNotification('Email de PayPal inválido', 'error');
        return false;
    }
    
    return true;
}

function showOrderSuccessModal(orderNumber) {
    const modal = document.getElementById('order-success-modal');
    const orderIdElement = document.getElementById('order-id');
    
    if (modal && orderIdElement) {
        orderIdElement.textContent = orderNumber;
        modal.classList.add('active');
    }
}

function continueShoppingFromSuccess() {
    const modal = document.getElementById('order-success-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    window.location.href = 'main.html';
}

function trackOrderFromSuccess() {
    const modal = document.getElementById('order-success-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    // Aquí podrías redirigir a una página de seguimiento
    showNotification('Función de seguimiento próximamente', 'info');
}

// Actualizar contadores de navegación
function updateNavigationCounts() {
    const favorites = getCurrentFavorites();
    const cart = cartItems;
    
    // Actualizar contador de favoritos
    const favoritesCount = document.getElementById('nav-favorites-count');
    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
        favoritesCount.className = `notification-badge ${favorites.length > 0 ? 'show' : ''}`;
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

// Función de notificaciones
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'remove' ? '#FF9800' : type === 'info' ? '#2196F3' : '#f44336'};
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
    
    const icon = type === 'success' ? '✅' : type === 'remove' ? '🗑️' : type === 'info' ? 'ℹ️' : '❌';
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

// Event listeners globales
window.addEventListener('storage', function(e) {
    if (e.key === 'currentUser' || e.key === 'userEmail' || e.key === 'userName') {
        console.log('🔔 Detectado cambio de usuario en carrito, recargando...');
        setTimeout(() => {
            location.reload();
        }, 100);
    }
});

document.addEventListener('click', function(e) {
    const clearModal = document.getElementById('clear-cart-modal');
    const successModal = document.getElementById('order-success-modal');
    
    if (e.target === clearModal) {
        closeClearCartModal();
    }
    
    if (e.target === successModal) {
        successModal.classList.remove('active');
    }
});

// Funciones globales para debugging
window.debugCart = function() {
    console.log('🔍 Debug carrito:');
    console.log('- Usuario actual:', currentUser);
    console.log('- Email del usuario:', currentUser ? currentUser.email : 'No hay usuario');
    console.log('- Items en carrito:', cartItems);
    console.log('- Cantidad total:', cartItems.reduce((sum, item) => sum + item.quantity, 0));
    console.log('- Subtotal:', cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0));
    console.log('- Descuento aplicado:', appliedDiscount);
    console.log('- Costo de envío:', shippingCost);
    
    if (currentUser && currentUser.email) {
        const cartKey = `cart_${currentUser.email}`;
        console.log('- Clave del carrito:', cartKey);
        console.log('- Carrito en localStorage:', localStorage.getItem(cartKey));
    }
};

window.addTestProduct = function() {
    console.log('🧪 Agregando producto de prueba al carrito...');
    
    if (!currentUser || !currentUser.email) {
        console.log('❌ No hay usuario válido');
        return;
    }
    
    const testProduct = {
        id: 'test-product-' + Date.now(),
        name: 'Producto de Prueba para Carrito',
        price: 29.99,
        quantity: 1,
        subtotal: 29.99,
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop',
        addedAt: new Date().toISOString()
    };
    
    cartItems.push(testProduct);
    saveCartItems();
    renderCartPage();
    updateNavigationCounts();
    
    console.log('✅ Producto de prueba agregado:', testProduct);
};

window.clearTestCart = function() {
    console.log('🗑️ Limpiando carrito de prueba...');
    cartItems = [];
    saveCartItems();
    renderCartPage();
    updateNavigationCounts();
    console.log('✅ Carrito limpiado');
};

window.testDiscount = function(code = 'PETSTYLE10') {
    console.log(`🏷️ Probando código de descuento: ${code}`);
    const discountInput = document.getElementById('discount-code');
    if (discountInput) {
        discountInput.value = code;
        applyDiscount();
    }
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
`;
document.head.appendChild(style);

console.log('🛒 Cart page script cargado correctamente');