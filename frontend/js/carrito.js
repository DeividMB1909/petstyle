// Productos de ejemplo para demostración
const availableProducts = [
    {
        id: 1,
        name: "Collar Elegante",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&crop=center"
    },
    {
        id: 2,
        name: "Juguete Pelota",
        price: 12.99,
        image: "https://images.unsplash.com/photo-1615789591457-74a63395c990?w=200&h=200&fit=crop&crop=center"
    },
    {
        id: 3,
        name: "Cama Premium",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop&crop=center"
    },
    {
        id: 4,
        name: "Transportadora",
        price: 45.99,
        image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&h=200&fit=crop&crop=center"
    }
];

// Estado global de la aplicación
let cart = [];
let selectedShipping = 'standard';
let selectedPayment = 'card';
let appliedPromoCode = null;
let promoDiscountPercent = 0;

const shippingCosts = {
    standard: 0,
    express: 5.99,
    priority: 12.99
};

const promoCodes = {
    'MASCOTA20': 20,
    'NUEVO15': 15,
    'PETSTYLE10': 10,
    'SUMMER25': 25
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    renderCart();
    updateCartBadge();
    
    // Agregar algunos productos de ejemplo para demostración
    setTimeout(() => {
        addToCart(availableProducts[0]);
        addToCart(availableProducts[2]);
    }, 1000);
}

function setupEventListeners() {
    // Shipping options
    document.querySelectorAll('.shipping-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.shipping-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedShipping = this.dataset.shipping;
            this.querySelector('input').checked = true;
            updateSummary();
        });
    });

    // Payment options
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedPayment = this.dataset.payment;
            this.querySelector('input').checked = true;
            
            // Show/hide payment forms
            document.querySelectorAll('.card-form, .payment-form').forEach(form => {
                form.classList.remove('active');
            });
            
            if (selectedPayment === 'card') {
                document.getElementById('cardForm').classList.add('active');
            } else if (selectedPayment === 'paypal') {
                document.getElementById('paypalForm').classList.add('active');
            } else if (selectedPayment === 'transfer') {
                document.getElementById('transferForm').classList.add('active');
            } else if (selectedPayment === 'oxxo') {
                document.getElementById('oxxoForm').classList.add('active');
            }
        });
    });

    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            this.value = formattedValue;
        });
    }

    // Card expiry formatting
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }

    // CVV formatting
    const cardCvvInput = document.getElementById('cardCvv');
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });
    }

    // Promo code input enter key
    const promoInput = document.getElementById('promoInput');
    if (promoInput) {
        promoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyPromoCode();
            }
        });
    }
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showToast(`${product.name} agregado al carrito (${existingItem.quantity})`, 'success');
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
        showToast(`${product.name} agregado al carrito`, 'success');
    }
    
    renderCart();
    updateCartBadge();
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        const cartItem = document.querySelector(`[data-id="${productId}"]`);
        
        if (cartItem) {
            cartItem.classList.add('removing');
            setTimeout(() => {
                cart.splice(itemIndex, 1);
                renderCart();
                updateCartBadge();
                showToast(`${item.name} eliminado del carrito`, 'warning');
            }, 300);
        }
    }
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            renderCart();
            updateCartBadge();
        }
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const emptyState = document.getElementById('emptyState');
    const shippingSection = document.getElementById('shippingSection');
    const paymentSection = document.getElementById('paymentSection');
    const summarySection = document.getElementById('summarySection');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const promoSection = document.getElementById('promoSection');

    if (cart.length === 0) {
        cartItems.innerHTML = '';
        emptyState.style.display = 'block';
        shippingSection.style.display = 'none';
        paymentSection.style.display = 'none';
        summarySection.style.display = 'none';
        checkoutBtn.style.display = 'none';
        promoSection.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        shippingSection.style.display = 'block';
        paymentSection.style.display = 'block';
        summarySection.style.display = 'block';
        checkoutBtn.style.display = 'block';
        promoSection.style.display = 'block';

        cartItems.innerHTML = '';
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.dataset.id = item.id;
            cartItem.style.animationDelay = `${index * 0.1}s`;
            
            const itemTotal = (item.price * item.quantity).toFixed(2);
            
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">${item.price}</div>
                    <div class="item-total">Total: ${itemTotal}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">✕</button>
            `;
            
            cartItems.appendChild(cartItem);
        });

        updateSummary();
    }
}

function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = shippingCosts[selectedShipping];
    const discountAmount = (subtotal * promoDiscountPercent) / 100;
    const total = subtotal + shippingCost - discountAmount;

    document.getElementById('itemCount').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)}`;
    document.getElementById('shippingCost').textContent = shippingCost === 0 ? 'Gratis' : `${shippingCost.toFixed(2)}`;
    document.getElementById('total').textContent = `${total.toFixed(2)}`;

    // Mostrar/ocultar descuento
    const discountRow = document.getElementById('discountRow');
    const savingsRow = document.getElementById('savingsRow');
    
    if (discountAmount > 0) {
        discountRow.style.display = 'flex';
        savingsRow.style.display = 'flex';
        document.getElementById('discount').textContent = `-${discountAmount.toFixed(2)}`;
        document.getElementById('savings').textContent = `${discountAmount.toFixed(2)}`;
        document.getElementById('discountCode').textContent = appliedPromoCode;
    } else {
        discountRow.style.display = 'none';
        savingsRow.style.display = 'none';
    }
}

function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.getElementById('cartBadge');
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
}

function applyPromoCode() {
    const promoInput = document.getElementById('promoInput');
    const code = promoInput.value.trim().toUpperCase();
    
    if (promoCodes[code]) {
        if (appliedPromoCode === code) {
            showToast('Este código ya está aplicado', 'warning');
            return;
        }
        
        appliedPromoCode = code;
        promoDiscountPercent = promoCodes[code];
        promoInput.value = '';
        updateSummary();
        showToast(`¡Código aplicado! ${promoDiscountPercent}% de descuento`, 'success');
    } else if (code === '') {
        showToast('Por favor ingresa un código', 'warning');
    } else {
        showToast('Código inválido', 'error');
        promoInput.value = '';
    }
}

function processOrder() {
    if (cart.length === 0) {
        showToast('Tu carrito está vacío', 'error');
        return;
    }

    // Validar según el método de pago seleccionado
    if (selectedPayment === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCvv = document.getElementById('cardCvv').value;
        const cardName = document.getElementById('cardName').value;

        if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
            showToast('Por favor completa todos los datos de la tarjeta', 'error');
            return;
        }

        if (cardNumber.replace(/\s/g, '').length < 16) {
            showToast('Número de tarjeta inválido', 'error');
            return;
        }

        if (cardExpiry.length < 5) {
            showToast('Fecha de vencimiento inválida', 'error');
            return;
        }

        if (cardCvv.length < 3) {
            showToast('CVV inválido', 'error');
            return;
        }
    } else if (selectedPayment === 'paypal') {
        const paypalEmail = document.getElementById('paypalEmail').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!paypalEmail) {
            showToast('Por favor ingresa tu email de PayPal', 'error');
            return;
        }
        
        if (!emailRegex.test(paypalEmail)) {
            showToast('Email de PayPal inválido', 'error');
            return;
        }
    } else if (selectedPayment === 'transfer') {
        const transferProof = document.getElementById('transferProof').value;
        
        if (!transferProof) {
            showToast('Por favor sube el comprobante de transferencia', 'error');
            return;
        }
    }

    // Mostrar loading
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutText = document.getElementById('checkoutText');
    const checkoutLoading = document.getElementById('checkoutLoading');
    
    checkoutBtn.disabled = true;
    checkoutText.style.display = 'none';
    checkoutLoading.style.display = 'inline-block';

    // Mensaje específico según método de pago
    let processingMessage = 'Procesando pedido...';
    if (selectedPayment === 'paypal') {
        processingMessage = 'Conectando con PayPal...';
    } else if (selectedPayment === 'transfer') {
        processingMessage = 'Validando transferencia...';
    } else if (selectedPayment === 'oxxo') {
        processingMessage = 'Generando código OXXO...';
    }

    showToast(processingMessage, 'success');

    // Simular procesamiento
    setTimeout(() => {
        // Generar número de orden
        const orderNumber = 'PET-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        document.getElementById('orderNumber').textContent = '#' + orderNumber;
        
        // Mostrar modal de éxito
        document.getElementById('orderModal').classList.add('active');
        
        // Ocultar loading
        checkoutBtn.disabled = false;
        checkoutText.style.display = 'inline';
        checkoutLoading.style.display = 'none';
        
        // Limpiar carrito
        cart = [];
        appliedPromoCode = null;
        promoDiscountPercent = 0;
        renderCart();
        updateCartBadge();
        
        // Limpiar formularios
        clearPaymentForms();
        
        // Limpiar código de descuento
        const promoInput = document.getElementById('promoInput');
        if (promoInput) {
            promoInput.value = '';
        }
        
    }, 2500);
}

function clearPaymentForms() {
    // Limpiar formulario de tarjeta
    const fields = ['cardNumber', 'cardExpiry', 'cardCvv', 'cardName', 'paypalEmail', 'transferProof'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = '';
        }
    });
}

function closeModal() {
    document.getElementById('orderModal').classList.remove('active');
    showToast('¡Gracias por tu compra!', 'success');
}

function trackOrder() {
    const orderNumber = document.getElementById('orderNumber').textContent;
    document.getElementById('orderModal').classList.remove('active');
    showToast(`Rastreando pedido ${orderNumber}...`, 'success');
}

function showToast(message, type = 'success') {
    // Remover toast existente
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// Funciones auxiliares para el carrito
function clearCart() {
    if (cart.length === 0) {
        showToast('El carrito ya está vacío', 'warning');
        return;
    }
    
    cart = [];
    appliedPromoCode = null;
    promoDiscountPercent = 0;
    renderCart();
    updateCartBadge();
    showToast('Carrito limpiado', 'success');
}

// Exponer funciones globalmente para uso desde otros archivos
window.PetStyleCart = {
    addToCart: addToCart,
    getCartCount: () => cart.reduce((sum, item) => sum + item.quantity, 0),
    clearCart: clearCart
};