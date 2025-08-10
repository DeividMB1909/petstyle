// js/cart.js
function getCartItems() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const cart = localStorage.getItem(`cart_${user.email}`);
    return cart ? JSON.parse(cart) : [];
}

function addToCart(productId, quantity = 1) {
    const user = getCurrentUser();
    if (!user) return false;
    
    let cart = getCartItems();
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ 
            productId, 
            quantity, 
            addedAt: new Date().toISOString() 
        });
    }
    
    localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
    return true;
}

function removeCartItem(productId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    let cart = getCartItems();
    cart = cart.filter(item => item.productId !== productId);
    
    localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
    return true;
}

function updateCartItemQuantity(productId, newQuantity) {
    const user = getCurrentUser();
    if (!user) return false;
    
    let cart = getCartItems();
    const item = cart.find(item => item.productId === productId);
    
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
        return true;
    }
    
    return false;
}

function clearCartItems() {
    const user = getCurrentUser();
    if (!user) return false;
    
    localStorage.removeItem(`cart_${user.email}`);
    return true;
}