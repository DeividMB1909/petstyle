// ===== FAVORITES PAGE JAVASCRIPT =====

// Initialize favorites page
document.addEventListener('DOMContentLoaded', async function() {
    await loadFavorites();
});

async function loadFavorites() {
    const loadingEl = document.getElementById('loading-favorites');
    const emptyEl = document.getElementById('empty-favorites');
    const authEl = document.getElementById('auth-required');
    const gridEl = document.getElementById('favorites-grid');

    try {
        // Show loading state
        loadingEl.style.display = 'block';
        emptyEl.style.display = 'none';
        authEl.style.display = 'none';
        gridEl.style.display = 'none';

        // Check if user is logged in
        const user = getCurrentUser();
        if (!user) {
            loadingEl.style.display = 'none';
            authEl.style.display = 'block';
            return;
        }

        // Get favorite product IDs
        const favoriteIds = getFavoriteProducts();
        
        if (favoriteIds.length === 0) {
            loadingEl.style.display = 'none';
            emptyEl.style.display = 'block';
            return;
        }

        // Fetch product details for favorites
        const favoritesWithDetails = await Promise.all(
            favoriteIds.map(async (productId) => {
                try {
                    const product = await api.getProduct(productId);
                    return product;
                } catch (error) {
                    console.error('Error fetching product:', error);
                    return null;
                }
            })
        );

        // Filter out failed requests
        const validFavorites = favoritesWithDetails.filter(item => item !== null);

        if (validFavorites.length === 0) {
            loadingEl.style.display = 'none';
            emptyEl.style.display = 'block';
            return;
        }

        // Render favorites
        renderFavorites(validFavorites);

        // Show favorites grid
        loadingEl.style.display = 'none';
        gridEl.style.display = 'grid';

    } catch (error) {
        console.error('Error loading favorites:', error);
        loadingEl.style.display = 'none';
        emptyEl.style.display = 'block';
        showToast('Error al cargar favoritos', 'error');
    }
}

function renderFavorites(favorites) {
    const container = document.getElementById('favorites-grid');
    container.innerHTML = favorites.map(product => `
        <div class="favorite-card" data-id="${product._id}">
            <div class="card-image">
                <img src="${product.imagen || 'https://via.placeholder.com/200'}" 
                     alt="${product.nombre}" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/200?text=Sin+Imagen'">
                <button class="favorite-btn active" onclick="toggleFavorite('${product._id}', this)">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="card-content">
                <h3 class="product-name" title="${product.nombre}">${product.nombre}</h3>
                <p class="product-category">${product.categoria}</p>
                <p class="product-price">$${product.precio}</p>
                <div class="card-actions">
                    <button class="btn-cart" onclick="handleAddToCart('${product._id}')">
                        <i class="fas fa-shopping-cart"></i>
                        Agregar
                    </button>
                    <button class="btn-view" onclick="viewProduct('${product._id}')">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleFavorite(productId, button) {
    const user = getCurrentUser();
    if (!user) {
        showToast('Debes iniciar sesión', 'warning');
        window.location.href = 'login.html';
        return;
    }

    const isActive = button.classList.contains('active');
    
    if (isActive) {
        // Remove from favorites
        removeFromFavorites(productId);
        
        // Animate card removal
        const card = button.closest('.favorite-card');
        card.classList.add('removing');
        
        // Remove card after animation
        setTimeout(() => {
            loadFavorites(); // Reload to update grid
        }, 300);
        
        showToast('Eliminado de favoritos', 'success');
    }
}

function handleAddToCart(productId) {
    const user = getCurrentUser();
    if (!user) {
        showToast('Debes iniciar sesión para agregar al carrito', 'warning');
        window.location.href = 'login.html';
        return;
    }

    try {
        addToCart(productId, 1);
        showToast('Agregado al carrito', 'success');
        
        // Update cart badge if exists
        updateCartBadge();
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Error al agregar al carrito', 'error');
    }
}

function viewProduct(productId) {
    // For now, show toast. In real app, redirect to product detail page
    showToast('Vista detallada próximamente', 'info');
    // Future: window.location.href = `product-detail.html?id=${productId}`;
}

function clearFavorites() {
    const user = getCurrentUser();
    if (!user) {
        showToast('Debes iniciar sesión', 'warning');
        return;
    }

    const favorites = getFavoriteProducts();
    if (favorites.length === 0) {
        showToast('No tienes favoritos para eliminar', 'info');
        return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar todos los favoritos?')) {
        clearFavoriteProducts();
        loadFavorites();
        showToast('Todos los favoritos eliminados', 'success');
    }
}

// Helper function to update cart badge (if exists in navigation)
function updateCartBadge() {
    const cartItems = getCartItems();
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        badge.textContent = cartItems.length;
        badge.style.display = cartItems.length > 0 ? 'block' : 'none';
    }
}

// Error handling for failed image loads
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'https://via.placeholder.com/200?text=Sin+Imagen';
    }
}, true);

// Refresh favorites when page becomes visible (user switches back to tab)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        const user = getCurrentUser();
        if (user) {
            loadFavorites();
        }
    }
});