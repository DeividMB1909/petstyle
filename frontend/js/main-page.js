// ===== MAIN PAGE JAVASCRIPT - LIMPIO Y FUNCIONAL =====
let allProducts = [];
let filteredProducts = [];
let currentCategory = '';
let currentSort = 'newest';
let currentUser = null;
let currentModalProduct = null;
let modalQuantity = 1;

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
    console.log('🚀 Inicializando main page...');
    initializePage();
});

async function initializePage() {
    try {
        // Obtener usuario actual
        currentUser = getCurrentUser();
        updateUserGreeting();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Cargar productos
        await loadProducts();
        
        // Actualizar contadores
        updateNavigationCounts();
        
        console.log('✅ Main page inicializada correctamente');
    } catch (error) {
        console.error('❌ Error inicializando main page:', error);
        showError('Error cargando la página');
    }
}

function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
    return { name: 'Invitado', email: 'guest@example.com' };
}

function updateUserGreeting() {
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && currentUser) {
        userNameElement.textContent = currentUser.name || 'Invitado';
    }
}

function setupEventListeners() {
    // Búsqueda
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Ordenamiento
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }

    // Categorías
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;
            handleCategoryFilter(category);
            
            // Actualizar visual
            categoryItems.forEach(cat => cat.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Modal
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }

    console.log('✅ Event listeners configurados');
}

async function loadProducts() {
    try {
        console.log('📦 Cargando productos...');
        
        // Mostrar loading
        showLoading();
        
        // Obtener productos de la API
        const products = await api.getAllProducts();
        console.log('📦 Productos obtenidos:', products);
        
        allProducts = products || [];
        filteredProducts = [...allProducts];
        
        // Renderizar productos
        renderProducts();
        
        console.log(`✅ ${allProducts.length} productos cargados`);
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        showError('Error cargando productos');
        
        // Mostrar mensaje de error
        const grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message" style="grid-column: 1 / -1; text-align: center; color: white; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i>
                    <h3>Error cargando productos</h3>
                    <p>Por favor, intenta recargar la página</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Recargar
                    </button>
                </div>
            `;
        }
    }
}

function showLoading() {
    const grid = document.getElementById('products-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="loading" style="grid-column: 1 / -1; text-align: center; color: white; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                <div>Cargando productos...</div>
            </div>
        `;
    }
}

function showError(message) {
    // Aquí puedes implementar un sistema de notificaciones
    console.error('Error:', message);
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    const title = document.getElementById('products-title');
    
    if (!grid) return;
    
    // Actualizar título
    if (title) {
        const categoryName = currentCategory ? categoryMap[currentCategory] || 'Categoría' : 'Todos los Productos';
        title.textContent = `${categoryName} (${filteredProducts.length})`;
    }
    
    // Limpiar grid
    grid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="no-products" style="grid-column: 1 / -1; text-align: center; color: white; padding: 40px;">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>No se encontraron productos</h3>
                <p>Intenta cambiar los filtros de búsqueda</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cada producto
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
    
    console.log(`✅ ${filteredProducts.length} productos renderizados`);
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product._id;
    
    // Procesar datos del producto
    const name = product.name || product.nombre || 'Producto sin nombre';
    const price = product.price || product.precio || 0;
    const description = product.description || product.descripcion || '';
    const stock = product.stock || 0;
    const category = getCategoryName(product.category || product.categoria);
    
    // Procesar imagen
    let imageUrl = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop';
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = product.images[0].url || product.images[0];
    } else if (product.image) {
        imageUrl = product.image;
    }
    
    // Verificar si está en favoritos
    const isFavorite = isProductInFavorites(product._id);
    
    // Crear HTML del card
    card.innerHTML = `
        <div class="product-image">
            <img src="${imageUrl}" alt="${name}" onerror="this.src='https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop'">
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${product._id}', event)">
                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
            </button>
        </div>
        <div class="product-info">
            <div class="product-category">${category}</div>
            <div class="product-name">${name}</div>
            <div class="product-description">${truncateText(description, 45)}</div>
            <div class="product-footer">
                <div class="product-price">${price.toFixed(2)}</div>
                <button class="add-to-cart-btn ${stock <= 0 ? 'disabled' : ''}" 
                        onclick="addToCart('${product._id}', event)" 
                        ${stock <= 0 ? 'disabled' : ''}>
                    ${stock <= 0 ? 'Agotado' : 'Agregar'}
                </button>
            </div>
        </div>
    `;
    
    // Agregar event listener para abrir modal
    card.addEventListener('click', (e) => {
        // Verificar si el clic fue en un botón
        if (e.target.closest('.favorite-btn') || e.target.closest('.add-to-cart-btn')) {
            return;
        }
        openProductModal(product._id);
    });
    
    return card;
}

function getCategoryName(categoryId) {
    if (!categoryId) return 'Sin categoría';
    return categoryMap[categoryId] || categoryId;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Funciones de filtrado y búsqueda
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    console.log('🔍 Buscando:', searchTerm);
    
    filteredProducts = allProducts.filter(product => {
        const name = (product.name || product.nombre || '').toLowerCase();
        const description = (product.description || product.descripcion || '').toLowerCase();
        const category = getCategoryName(product.category || product.categoria).toLowerCase();
        
        return name.includes(searchTerm) || 
               description.includes(searchTerm) || 
               category.includes(searchTerm);
    });
    
    // Aplicar filtro de categoría si está activo
    if (currentCategory) {
        filteredProducts = filteredProducts.filter(product => 
            product.category === currentCategory || product.categoria === currentCategory
        );
    }
    
    renderProducts();
}

function handleCategoryFilter(categoryId) {
    console.log('🏷️ Filtrando por categoría:', categoryId);
    currentCategory = categoryId;
    
    if (!categoryId) {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            product.category === categoryId || product.categoria === categoryId
        );
    }
    
    // Aplicar ordenamiento actual
    sortProducts(currentSort);
    renderProducts();
}

function handleSort(e) {
    const sortType = e.target.value;
    console.log('📊 Ordenando por:', sortType);
    currentSort = sortType;
    sortProducts(sortType);
    renderProducts();
}

function sortProducts(sortType) {
    switch (sortType) {
        case 'price-low':
            filteredProducts.sort((a, b) => (a.price || a.precio || 0) - (b.price || b.precio || 0));
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => (b.price || b.precio || 0) - (a.price || a.precio || 0));
            break;
        case 'name':
            filteredProducts.sort((a, b) => {
                const nameA = (a.name || a.nombre || '').toLowerCase();
                const nameB = (b.name || b.nombre || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
            break;
        case 'newest':
        default:
            filteredProducts.sort((a, b) => new Date(b.createdAt || b.fechaCreacion || 0) - new Date(a.createdAt || a.fechaCreacion || 0));
            break;
    }
}

// Funciones del modal
function openProductModal(productId) {
    console.log('🎯 Abriendo modal para producto:', productId);
    
    const product = allProducts.find(p => p._id === productId);
    if (!product) {
        console.error('❌ Producto no encontrado:', productId);
        return;
    }
    
    currentModalProduct = product;
    modalQuantity = 1;
    
    populateModal(product);
    
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeProductModal() {
    console.log('❌ Cerrando modal');
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    currentModalProduct = null;
    modalQuantity = 1;
}

function populateModal(product) {
    // Datos básicos
    const name = product.name || product.nombre || 'Producto sin nombre';
    const price = product.price || product.precio || 0;
    const description = product.description || product.descripcion || 'Sin descripción';
    const stock = product.stock || 0;
    const sku = product.sku || 'N/A';
    const category = getCategoryName(product.category || product.categoria);
    
    // Imagen
    let imageUrl = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop';
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = product.images[0].url || product.images[0];
    } else if (product.image) {
        imageUrl = product.image;
    }
    
    // Actualizar elementos del modal
    const elements = {
        'modal-title': 'Detalles del Producto',
        'modal-name': name,
        'modal-description': description,
        'modal-category': category,
        'modal-price': `${price.toFixed(2)}`,
        'modal-sku': sku,
        'modal-stock': `${stock} disponibles`,
        'modal-quantity': modalQuantity
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
    
    // Actualizar imagen
    const modalImage = document.getElementById('modal-image');
    if (modalImage) {
        modalImage.src = imageUrl;
        modalImage.alt = name;
    }
    
    // Actualizar botón de favoritos
    const favoriteBtn = document.getElementById('modal-favorite-btn');
    if (favoriteBtn) {
        const isFavorite = isProductInFavorites(product._id);
        favoriteBtn.className = `btn-favorite ${isFavorite ? 'active' : ''}`;
        favoriteBtn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
    }
    
    console.log('✅ Modal poblado con producto:', name);
}

// Funciones de cantidad en modal
function increaseQuantity() {
    if (currentModalProduct && modalQuantity < (currentModalProduct.stock || 0)) {
        modalQuantity++;
        document.getElementById('modal-quantity').textContent = modalQuantity;
    }
}

function decreaseQuantity() {
    if (modalQuantity > 1) {
        modalQuantity--;
        document.getElementById('modal-quantity').textContent = modalQuantity;
    }
}

// Funciones de favoritos
function isProductInFavorites(productId) {
    if (!currentUser || !currentUser.email) return false;
    
    const favorites = getFavorites();
    return favorites.some(fav => fav.id === productId);
}

function getFavorites() {
    if (!currentUser || !currentUser.email) return [];
    
    const favoritesKey = `favorites_${currentUser.email}`;
    const favorites = localStorage.getItem(favoritesKey);
    return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites) {
    if (!currentUser || !currentUser.email) return;
    
    const favoritesKey = `favorites_${currentUser.email}`;
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
}

function toggleFavorite(productId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    console.log('❤️ Toggle favorito:', productId);
    
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;
    
    let favorites = getFavorites();
    const existingIndex = favorites.findIndex(fav => fav.id === productId);
    
    if (existingIndex > -1) {
        // Remover de favoritos
        favorites.splice(existingIndex, 1);
        console.log('💔 Removido de favoritos');
    } else {
        // Agregar a favoritos
        favorites.push({
            id: productId,
            name: product.name || product.nombre,
            price: product.price || product.precio,
            image: getProductImage(product),
            addedAt: new Date().toISOString()
        });
        console.log('💖 Agregado a favoritos');
    }
    
    saveFavorites(favorites);
    updateNavigationCounts();
    
    // Actualizar UI
    updateFavoriteButtons(productId);
}

function toggleModalFavorite() {
    if (currentModalProduct) {
        toggleFavorite(currentModalProduct._id);
    }
}

function updateFavoriteButtons(productId) {
    const isFavorite = isProductInFavorites(productId);
    
    // Actualizar botón en card
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (card) {
        const btn = card.querySelector('.favorite-btn');
        if (btn) {
            btn.className = `favorite-btn ${isFavorite ? 'active' : ''}`;
            btn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
        }
    }
    
    // Actualizar botón en modal si está abierto
    if (currentModalProduct && currentModalProduct._id === productId) {
        const modalBtn = document.getElementById('modal-favorite-btn');
        if (modalBtn) {
            modalBtn.className = `btn-favorite ${isFavorite ? 'active' : ''}`;
            modalBtn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
        }
    }
}

// Funciones de carrito
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
}

function addToCart(productId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    console.log('🛒 Agregando al carrito:', productId);
    
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;
    
    if ((product.stock || 0) <= 0) {
        alert('Producto agotado');
        return;
    }
    
    let cart = getCart();
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
        cart.push({
            id: productId,
            name: product.name || product.nombre,
            price: product.price || product.precio,
            quantity: 1,
            subtotal: product.price || product.precio,
            image: getProductImage(product),
            addedAt: new Date().toISOString()
        });
    }
    
    saveCart(cart);
    updateNavigationCounts();
    
    // Feedback visual
    showCartNotification();
    
    console.log('✅ Producto agregado al carrito');
}

function addToCartFromModal() {
    if (!currentModalProduct) return;
    
    console.log(`🛒 Agregando ${modalQuantity} unidades al carrito desde modal`);
    
    if ((currentModalProduct.stock || 0) <= 0) {
        alert('Producto agotado');
        return;
    }
    
    let cart = getCart();
    const existingItem = cart.find(item => item.id === currentModalProduct._id);
    
    if (existingItem) {
        existingItem.quantity += modalQuantity;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
        cart.push({
            id: currentModalProduct._id,
            name: currentModalProduct.name || currentModalProduct.nombre,
            price: currentModalProduct.price || currentModalProduct.precio,
            quantity: modalQuantity,
            subtotal: (currentModalProduct.price || currentModalProduct.precio) * modalQuantity,
            image: getProductImage(currentModalProduct),
            addedAt: new Date().toISOString()
        });
    }
    
    saveCart(cart);
    updateNavigationCounts();
    
    // Feedback y cerrar modal
    showCartNotification();
    closeProductModal();
}

function getProductImage(product) {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0].url || product.images[0];
    }
    return product.image || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop';
}

function showCartNotification() {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        Producto agregado al carrito
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 2 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

// Actualizar contadores de navegación
function updateNavigationCounts() {
    const favorites = getFavorites();
    const cart = getCart();
    
    // Actualizar contador de favoritos
    const favoritesCount = document.getElementById('favorites-count');
    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
        favoritesCount.className = `notification-badge ${favorites.length > 0 ? 'show' : ''}`;
    }
    
    // Actualizar contador de carrito
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.className = `notification-badge ${totalItems > 0 ? 'show' : ''}`;
    }
}

// Funciones globales para debugging (accesibles desde consola)
window.testModal = function() {
    console.log('🧪 Probando modal...');
    if (allProducts.length > 0) {
        openProductModal(allProducts[0]._id);
    } else {
        console.log('❌ No hay productos para probar');
    }
};

window.debugProducts = function() {
    console.log('🔍 Debug productos:');
    console.log('Total productos:', allProducts.length);
    console.log('Productos filtrados:', filteredProducts.length);
    console.log('Categoría actual:', currentCategory);
    console.log('Productos:', allProducts);
};

window.debugUser = function() {
    console.log('👤 Debug usuario:');
    console.log('Usuario actual:', currentUser);
    console.log('Favoritos:', getFavorites().length);
    console.log('Carrito:', getCart().length);
};

// Añadir estilos de animación al head
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

console.log('📱 Main page script cargado correctamente');