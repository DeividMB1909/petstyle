// ===== MAIN PAGE JAVASCRIPT - CORREGIDO PARA TUS CATEGORÍAS REALES =====

let allProducts = [];
let filteredProducts = [];
let currentCategory = '';
let currentSort = 'newest';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

async function initializePage() {
    checkAuthStatus();
    setupEventListeners();
    await loadProducts();
}

// Check authentication status and update UI
function checkAuthStatus() {
    const user = getCurrentUser();
    const userGreeting = document.getElementById('user-greeting');
    const userInfo = document.getElementById('user-info');
    
    if (user) {
        userGreeting.textContent = `Hola, ${user.name || user.nombre || 'Usuario'}`;
        userInfo.onclick = () => window.location.href = 'profile.html';
    } else {
        userGreeting.textContent = 'Hola, Invitado';
        userInfo.onclick = () => window.location.href = 'login.html';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Category buttons
    const categoryButtons = document.querySelectorAll('.category-item');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => handleCategoryChange(btn));
    });
    
    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
}

// Load products from API
async function loadProducts() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const productsGrid = document.getElementById('products-grid');
    
    try {
        console.log('📦 Cargando productos desde el backend...');
        
        if (loadingState) loadingState.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
        if (productsGrid) productsGrid.style.display = 'none';
        
        // Try to fetch from API using your api.js
        try {
            allProducts = await api.getAllProducts();
            console.log('✅ Productos cargados desde API:', allProducts.length, allProducts);
        } catch (apiError) {
            console.log('⚠️ Error del API:', apiError.message);
            allProducts = [];
            showToast('Error al cargar productos del servidor', 'error');
        }
        
        filteredProducts = [...allProducts];
        
        if (allProducts.length === 0) {
            showEmptyState();
        } else {
            renderProducts();
        }
        
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        showEmptyState();
        showToast('Error al cargar productos', 'error');
    } finally {
        if (loadingState) loadingState.style.display = 'none';
    }
}

// Show empty state
function showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const productsGrid = document.getElementById('products-grid');
    
    if (emptyState) emptyState.style.display = 'block';
    if (productsGrid) productsGrid.style.display = 'none';
}

// Render products
function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!productsGrid) {
        console.error('❌ No se encontró el contenedor de productos');
        return;
    }
    
    if (filteredProducts.length === 0) {
        showEmptyState();
        return;
    }
    
    console.log('🎨 Renderizando productos:', filteredProducts.length);
    
    productsGrid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
    
    if (emptyState) emptyState.style.display = 'none';
    productsGrid.style.display = 'grid';
    
    console.log('✅ Productos renderizados');
}

// Create product card HTML
function createProductCard(product) {
    // Manejar imagen del producto con mejores fallbacks
    let imageUrl = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop&crop=center';
    
    if (product.images && product.images.length > 0) {
        // Si tiene array de imágenes (formato nuevo del admin)
        imageUrl = product.images[0].url || imageUrl;
    } else if (product.imagen && product.imagen !== 'https://via.placeholder.com/300x300?text=Producto') {
        // Si tiene imagen válida como string (formato legacy)
        imageUrl = product.imagen;
    } else if (product.image && product.image !== 'https://via.placeholder.com/300x300?text=Producto') {
        // Otro formato posible
        imageUrl = product.image;
    }
    
    // Manejar nombre de categoría
    let categoryName = 'General';
    const categoryMap = {
        '6898049bdd53186ec08fd313': 'Perros',
        '6898049bdd53186ec08fd316': 'Gatos',
        '6898049bdd53186ec08fd319': 'Aves',
        '6898049bdd53186ec08fd31c': 'Peces',
        '6898049bdd53186ec08fd31f': 'Accesorios'
    };
    
    if (product.category) {
        if (typeof product.category === 'object' && product.category.name) {
            categoryName = product.category.name;
        } else if (categoryMap[product.category]) {
            categoryName = categoryMap[product.category];
        } else if (typeof product.category === 'string') {
            categoryName = product.category;
        }
    } else if (product.categoria) {
        categoryName = product.categoria;
    }
    
    // Datos del producto
    const productName = product.nombre || product.name || 'Producto sin nombre';
    const productPrice = product.precio || product.price || 0;
    const productDescription = product.descripcion || product.description || 'Sin descripción disponible';
    const productStock = product.stock || 0;
    const isFavorite = isProductFavorite ? isProductFavorite(product._id) : false;
    
    return `
        <div class="product-card" data-id="${product._id}">
            <div class="product-image">
                <img src="${imageUrl}" 
                     alt="${productName}" 
                     loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop'">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                        onclick="handleFavoriteClick('${product._id}', this)">
                    <i class="fas fa-heart"></i>
                </button>
                ${productStock <= 0 ? '<div class="stock-badge out-of-stock">Agotado</div>' : ''}
                ${product.featured ? '<div class="stock-badge featured">Destacado</div>' : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${categoryName}</div>
                <h3 class="product-name" title="${productName}">${productName}</h3>
                <p class="product-description">${productDescription.substring(0, 50)}${productDescription.length > 50 ? '...' : ''}</p>
                <div class="product-price">
                    <span class="current-price">${parseFloat(productPrice).toFixed(2)}</span>
                    ${product.originalPrice && product.originalPrice > productPrice ? 
                        `<span class="original-price">${parseFloat(product.originalPrice).toFixed(2)}</span>` : ''
                    }
                </div>
                <button class="add-to-cart-btn" 
                        onclick="handleAddToCart('${product._id}')"
                        ${productStock <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${productStock <= 0 ? 'Agotado' : 'Agregar'}
                </button>
            </div>
        </div>
    `;
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    console.log('🔍 Buscando:', searchTerm);
    
    filteredProducts = allProducts.filter(product => {
        const productName = (product.nombre || product.name || '').toLowerCase();
        const productDescription = (product.descripcion || product.description || '').toLowerCase();
        
        // Manejar categoría para búsqueda
        let categoryName = '';
        const categoryMap = {
            '6898049bdd53186ec08fd313': 'perros',
            '6898049bdd53186ec08fd316': 'gatos',
            '6898049bdd53186ec08fd319': 'aves',
            '6898049bdd53186ec08fd31c': 'peces',
            '6898049bdd53186ec08fd31f': 'accesorios'
        };
        
        if (product.category) {
            if (typeof product.category === 'object' && product.category.name) {
                categoryName = product.category.name.toLowerCase();
            } else if (categoryMap[product.category]) {
                categoryName = categoryMap[product.category];
            }
        } else if (product.categoria) {
            categoryName = product.categoria.toLowerCase();
        }
        
        const matchesSearch = !searchTerm || 
            productName.includes(searchTerm) ||
            productDescription.includes(searchTerm) ||
            categoryName.includes(searchTerm);
        
        const matchesCategory = !currentCategory || matchesCurrentCategory(product);
        
        return matchesSearch && matchesCategory;
    });
    
    applySorting();
    renderProducts();
    
    console.log(`📊 ${filteredProducts.length} productos filtrados`);
}

// Check if product matches current category
function matchesCurrentCategory(product) {
    if (!currentCategory) return true;
    
    const categoryMap = {
        'alimento': ['6898049bdd53186ec08fd313'], // Perros - algunos productos de perros pueden ser alimento
        'juguetes': ['6898049bdd53186ec08fd313', '6898049bdd53186ec08fd316'], // Perros y Gatos
        'accesorios': ['6898049bdd53186ec08fd31f'], // Accesorios
        'higiene': ['6898049bdd53186ec08fd316'], // Gatos - algunos productos de gatos pueden ser higiene
        'salud': ['6898049bdd53186ec08fd319', '6898049bdd53186ec08fd31c'] // Aves y Peces
    };
    
    const allowedCategoryIds = categoryMap[currentCategory] || [];
    
    if (product.category) {
        if (typeof product.category === 'object' && product.category._id) {
            return allowedCategoryIds.includes(product.category._id);
        } else if (typeof product.category === 'string') {
            return allowedCategoryIds.includes(product.category);
        }
    }
    
    // Fallback: match by category name
    return (product.categoria || '').toLowerCase() === currentCategory;
}

// Handle category change
function handleCategoryChange(clickedButton) {
    console.log('📂 Cambiando categoría...');
    
    // Update active category button
    document.querySelectorAll('.category-item').forEach(btn => {
        btn.classList.remove('active');
    });
    clickedButton.classList.add('active');
    
    // Get selected category
    currentCategory = clickedButton.dataset.category || '';
    console.log('📂 Categoría seleccionada:', currentCategory);
    
    // Filter products
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = !searchTerm || 
            (product.nombre || product.name || '').toLowerCase().includes(searchTerm) ||
            (product.descripcion || product.description || '').toLowerCase().includes(searchTerm);
        
        const matchesCategory = !currentCategory || matchesCurrentCategory(product);
        
        return matchesSearch && matchesCategory;
    });
    
    applySorting();
    renderProducts();
    
    // Update section title
    const sectionTitle = document.querySelector('.section-title');
    if (sectionTitle) {
        sectionTitle.textContent = currentCategory ? 
            `Productos - ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}` : 
            'Todos los Productos';
    }
    
    console.log(`📊 ${filteredProducts.length} productos en categoría`);
}

// Handle sort change
function handleSortChange(event) {
    currentSort = event.target.value;
    console.log('🔄 Ordenando por:', currentSort);
    applySorting();
    renderProducts();
}

// Apply sorting to filtered products
function applySorting() {
    switch (currentSort) {
        case 'price-low':
            filteredProducts.sort((a, b) => {
                const priceA = parseFloat(a.precio || a.price || 0);
                const priceB = parseFloat(b.precio || b.price || 0);
                return priceA - priceB;
            });
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => {
                const priceA = parseFloat(a.precio || a.price || 0);
                const priceB = parseFloat(b.precio || b.price || 0);
                return priceB - priceA;
            });
            break;
        case 'name':
            filteredProducts.sort((a, b) => {
                const nameA = (a.nombre || a.name || '').toLowerCase();
                const nameB = (b.nombre || b.name || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
            break;
        case 'newest':
        default:
            filteredProducts.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.fechaCreacion || a._id);
                const dateB = new Date(b.createdAt || b.fechaCreacion || b._id);
                return dateB - dateA;
            });
            break;
    }
}

// Handle favorite button click
function handleFavoriteClick(productId, button) {
    if (typeof getCurrentUser !== 'function') {
        showToast('Sistema de favoritos no disponible', 'warning');
        return;
    }
    
    const user = getCurrentUser();
    
    if (!user) {
        showToast('Debes iniciar sesión para usar favoritos', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const isCurrentlyFavorite = button.classList.contains('active');
    
    if (isCurrentlyFavorite) {
        if (typeof removeFromFavorites === 'function') {
            removeFromFavorites(productId);
        }
        button.classList.remove('active');
        showToast('Eliminado de favoritos', 'success');
    } else {
        if (typeof addToFavorites === 'function') {
            addToFavorites(productId);
        }
        button.classList.add('active');
        showToast('Agregado a favoritos', 'success');
    }
}

// Handle add to cart
function handleAddToCart(productId) {
    if (typeof getCurrentUser !== 'function') {
        showToast('Sistema de carrito no disponible', 'warning');
        return;
    }
    
    const user = getCurrentUser();
    
    if (!user) {
        showToast('Debes iniciar sesión para agregar al carrito', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    try {
        if (typeof addToCart === 'function') {
            addToCart(productId, 1);
        }
        showToast('Producto agregado al carrito', 'success');
        
        // Add visual feedback
        const productCard = document.querySelector(`[data-id="${productId}"]`);
        if (productCard) {
            productCard.style.transform = 'scale(0.95)';
            setTimeout(() => {
                productCard.style.transform = '';
            }, 150);
        }
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Error al agregar al carrito', 'error');
    }
}

// Utility function for debouncing
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

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        checkAuthStatus();
        if (typeof updateFavoriteButtons === 'function') {
            updateFavoriteButtons();
        }
    }
});

// Update favorite buttons based on current user
function updateFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        const productCard = button.closest('.product-card');
        const productId = productCard?.dataset.id;
        
        if (productId && typeof isProductFavorite === 'function' && isProductFavorite(productId)) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Export functions for global use
window.PetStyleApp = {
    loadProducts,
    handleFavoriteClick,
    handleAddToCart,
    allProducts,
    filteredProducts
};