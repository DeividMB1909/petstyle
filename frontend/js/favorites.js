// ===== FAVORITES MANAGEMENT =====

// Get favorites from localStorage for current user
function getFavoriteProducts() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const favorites = localStorage.getItem(`favorites_${user.email}`);
    return favorites ? JSON.parse(favorites) : [];
}

// Add product to favorites
function addToFavorites(productId) {
    const user = getCurrentUser();
    if (!user) {
        showToast('Debes iniciar sesión para agregar favoritos', 'warning');
        return false;
    }
    
    let favorites = getFavoriteProducts();
    
    if (!favorites.includes(productId)) {
        favorites.push(productId);
        localStorage.setItem(`favorites_${user.email}`, JSON.stringify(favorites));
        return true;
    }
    
    return false;
}

// Remove product from favorites
function removeFromFavorites(productId) {
    const user = getCurrentUser();
    if (!user) return false;
    
    let favorites = getFavoriteProducts();
    favorites = favorites.filter(id => id !== productId);
    
    localStorage.setItem(`favorites_${user.email}`, JSON.stringify(favorites));
    return true;
}

// Check if product is in favorites
function isProductFavorite(productId) {
    const favorites = getFavoriteProducts();
    return favorites.includes(productId);
}

// Clear all favorites for current user
function clearFavoriteProducts() {
    const user = getCurrentUser();
    if (!user) return false;
    
    localStorage.removeItem(`favorites_${user.email}`);
    return true;
}

// Toggle favorite status
function toggleFavorite(productId) {
    const user = getCurrentUser();
    if (!user) {
        showToast('Debes iniciar sesión para usar favoritos', 'warning');
        return false;
    }
    
    if (isProductFavorite(productId)) {
        removeFromFavorites(productId);
        showToast('Eliminado de favoritos', 'success');
        return false;
    } else {
        addToFavorites(productId);
        showToast('Agregado a favoritos', 'success');
        return true;
    }
}