// ===== MAIN PAGE JAVASCRIPT WITH FALLBACK =====

let allProducts = [];
let filteredProducts = [];
let currentCategory = '';
let currentSort = 'newest';

// Mock data for testing
const mockProducts = [
    {
        _id: 'mock1',
        nombre: 'Alimento Premium para Perros',
        categoria: 'alimento',
        precio: 45.99,
        imagen: 'https://via.placeholder.com/200?text=Alimento+Perros',
        descripcion: 'Alimento nutritivo para perros adultos'
    },
    {
        _id: 'mock2',
        nombre: 'Pelota de Juguete',
        categoria: 'juguetes',
        precio: 12.50,
        imagen: 'https://via.placeholder.com/200?text=Pelota+Juguete',
        descripcion: 'Pelota resistente para perros'
    },
    {
        _id: 'mock3',
        nombre: 'Collar Elegante',
        categoria: 'accesorios',
        precio: 28.00,
        imagen: 'https://via.placeholder.com/200?text=Collar+Elegante',
        descripcion: 'Collar ajustable para mascotas'
    },
    {
        _id: 'mock4',
        nombre: 'Shampoo para Gatos',
        categoria: 'higiene',
        precio: 18.75,
        imagen: 'https://via.placeholder.com/200?text=Shampoo+Gatos',
        descripcion: 'Shampoo suave para gatos'
    },
    {
        _id: 'mock5',
        nombre: 'Vitaminas para Mascotas',
        categoria: 'salud',
        precio: 35.20,
        imagen: 'https://via.placeholder.com/200?text=Vitaminas',
        descripcion: 'Suplemento vitamínico para mascotas'
    },
    {
        _id: 'mock6',
        nombre: 'Cama para Perros Grande',
        categoria: 'accesorios',
        precio: 89.99,
        imagen: 'https://via.placeholder.com/200?text=Cama+Perros',
        descripcion: 'Cama cómoda para perros grandes'
    }
];

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
        userGreeting.textContent = `Hola, ${user.nombre || 'Usuario'}`;
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
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Category buttons
    const categoryButtons = document.querySelectorAll('.category-item');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => handleCategoryChange(btn));
    });
    
    // Sort select
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', handleSortChange);
}

// Load products from API with fallback
async function loadProducts() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const productsGrid = document.getElementById('products-grid');
    
    try {
        loadingState.style.display = 'block';
        emptyState.style.display = 'none';
        productsGrid.style.display = 'none';
        
        console.log('🔄 Trying to load products from API...');
        
        // Try to fetch from API first
        try {
            const response = await fetch('http://localhost:3000/api/productos');
            
            if (response.ok) {
                allProducts = await response.json();
                console.log('✅ Products loaded from API:', allProducts.length);
            } else {
                throw new Error(`API returned ${response.status}`);
            }
        } catch (apiError) {
            console.log('⚠️ API failed, using mock data:', apiError.message);
            allProducts = mockProducts;
            
            // Show info toast
            showToast('Usando datos de prueba (Backend no disponible)', 'info', 5000);
        }
        
        filteredProducts = [...allProducts];
        
        if (allProducts.length === 0) {
            showEmptyState();
        } else {
            renderProducts();
        }
        
    } catch (error) {
        console.error('Error loading products:', error);
        // Use mock data as final fallback
        allProducts = mockProducts;
        filteredProducts = [...allProducts];
        renderProducts();
        showToast('Usando datos de prueba', 'warning');
    } finally {
        loadingState.style.display = 'none';
    }
}

// Handle loading error
function handleLoadError() {
    const emptyState = document.getElementById('empty-state');
    emptyState.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; color: #ef4444;"></i>
        <h3>Error al cargar productos</h3>
        <p>No se pudo conectar con el servidor. Usando datos de prueba.</p>
        <button class="add-to-cart-btn" onclick="loadProducts()" style="max-width: 200px; margin: 1rem auto;">
            Reintentar
        </button>
    `;
    emptyState.style.display = 'block';
    
    // Load mock data
    allProducts = mockProducts;
    filteredProducts = [...allProducts];
    setTimeout(() => {
        renderProducts();
    }, 2000);
}

// Show empty state
function showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const productsGrid = document.getElementById('products-grid');
    
    emptyState.style.display = 'block';
    productsGrid.style.display = 'none';
}

// Render products
function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (filteredProducts.length === 0) {
        showEmptyState();
        return;
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
    
    emptyState.style.display = 'none';
    productsGrid.style.display = 'grid';
}

// Create product card HTML
function createProductCard(product) {
    const isFavorite = isProductFavorite ? isProductFavorite(product._id) : false;
    const imageUrl = product.imagen || 'https://via.placeholder.com/200?text=Sin+Imagen';
    
    return `
        <div class="product-card" data-id="${product._id}">
            <div class="product-image">
                <img src="${imageUrl}" 
                     alt="${product.nombre}" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/200?text=Sin+Imagen'">
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                        onclick="handleFavoriteClick('${product._id}', this)">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-name" title="${product.nombre}">${product.nombre}</h3>
                <p class="product-category">${product.categoria}</p>
                <p class="product-price">$${product.precio}</p>
                <button class="add-to-cart-btn" onclick="handleAddToCart('${product._id}')">
                    <i class="fas fa-shopping-cart"></i> Agregar al carrito
                </button>
            </div>
        </div>
    `;
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = !searchTerm || 
            product.nombre.toLowerCase().includes(searchTerm) ||
            product.categoria.toLowerCase().includes(searchTerm) ||
            (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm));
        
        const matchesCategory = !currentCategory || product.categoria === currentCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    applySorting();
    renderProducts();
}

// Handle category change
function handleCategoryChange(clickedButton) {
    // Update active category button
    document.querySelectorAll('.category-item').forEach(btn => {
        btn.classList.remove('active');
    });
    clickedButton.classList.add('active');
    
    // Get selected category
    currentCategory = clickedButton.dataset.category || '';
    
    // Filter products
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = !searchTerm || 
            product.nombre.toLowerCase().includes(searchTerm) ||
            product.categoria.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !currentCategory || product.categoria === currentCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    applySorting();
    renderProducts();
    
    // Update section title
    const sectionTitle = document.querySelector('.section-title');
    sectionTitle.textContent = currentCategory ? 
        `Productos - ${currentCategory}` : 
        'Todos los Productos';
}

// Handle sort change
function handleSortChange(event) {
    currentSort = event.target.value;
    applySorting();
    renderProducts();
}

// Apply sorting to filtered products
function applySorting() {
    switch (currentSort) {
        case 'price-low':
            filteredProducts.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case 'newest':
        default:
            // Keep original order or sort by date if available
            filteredProducts.sort((a, b) => {
                const dateA = new Date(a.fechaCreacion || a._id);
                const dateB = new Date(b.fechaCreacion || b._id);
                return dateB - dateA;
            });
            break;
    }
}

// Handle favorite button click
function handleFavoriteClick(productId, button) {
    // Check if favorites functions exist
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
    // Check if cart functions exist
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

// Handle page visibility change (refresh data when user returns)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        checkAuthStatus();
        // Refresh favorite buttons in case user logged in/out in another tab
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
        const productId = productCard.dataset.id;
        
        if (typeof isProductFavorite === 'function' && isProductFavorite(productId)) {
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
    mockProducts
};