// Product data
const products = [
    {
        id: 1,
        name: "Collar de Cuero Perro",
        price: "$16.00",
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop",
        rating: 4.8,
        category: "collars",
        description: "Collar de cuero genuino con hebilla ajustable, perfecto para perros medianos y grandes. Resistente y cómodo."
    },
    {
        id: 2,
        name: "Collar con Campanita Gato",
        price: "$9.99",
        image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=300&h=300&fit=crop",
        rating: 4.6,
        category: "collars",
        description: "Collar suave con campanita para gatos, disponible en varios colores. Material hipoalergénico y seguro."
    },
    {
        id: 3,
        name: "Collar Reflectante Nocturno",
        price: "$13.75",
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop",
        rating: 4.9,
        category: "collars",
        description: "Collar LED recargable con material reflectante para caminatas nocturnas. Incluye cable USB."
    },
    {
        id: 4,
        name: "Collar Ajustable Universal",
        price: "$11.99",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
        rating: 4.5,
        category: "collars",
        description: "Collar ajustable universal con diseño colorido y resistente. Ideal para mascotas de todos los tamaños."
    },
    {
        id: 5,
        name: "Cama Ortopédica Premium",
        price: "$45.99",
        image: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3eaf?w=300&h=300&fit=crop",
        rating: 4.9,
        category: "beds",
        description: "Cama ortopédica con espuma de memoria, ideal para mascotas mayores. Funda lavable incluida."
    },
    {
        id: 6,
        name: "Juguete Interactivo",
        price: "$22.50",
        image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop",
        rating: 4.7,
        category: "toys",
        description: "Juguete interactivo que estimula la mente de tu mascota. Incluye premios y diferentes niveles de dificultad."
    }
];

let cart = [];
let favorites = [];
let currentCategory = 'all';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadFavorites();
    loadCart();
    renderProducts();
    updateCartBadge();
    setActiveNavItem();
    
    // Category filter event listeners
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            renderProducts();
        });
    });

    // Search functionality
    document.querySelector('.search-bar').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        renderProducts(searchTerm);
    });

    // Modal click outside to close
    document.getElementById('productModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
});

function loadFavorites() {
    if (window.petStyleData && window.petStyleData.favorites) {
        favorites = window.petStyleData.favorites;
    }
}

function loadCart() {
    if (window.petStyleData && window.petStyleData.cart) {
        cart = window.petStyleData.cart;
    }
}

function saveFavorites() {
    if (!window.petStyleData) window.petStyleData = {};
    window.petStyleData.favorites = favorites;
}

function saveCart() {
    if (!window.petStyleData) window.petStyleData = {};
    window.petStyleData.cart = cart;
}

function renderProducts(searchTerm = '') {
    const grid = document.getElementById('productGrid');
    let filteredProducts = products;

    // Filter by category
    if (currentCategory !== 'all') {
        filteredProducts = products.filter(product => product.category === currentCategory);
    }

    // Filter by search term
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm)
        );
    }

    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <button class="favorite-btn ${favorites.includes(product.id) ? 'active' : ''}" 
                    onclick="event.stopPropagation(); toggleFavorite(${product.id})">
                ${favorites.includes(product.id) ? '❤️' : '🤍'}
            </button>
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">${product.price}</div>
            <div class="product-rating">
                <span class="stars">${'⭐'.repeat(Math.floor(product.rating))}</span>
                <span>${product.rating}</span>
            </div>
        </div>
    `).join('');
}

function toggleFavorite(productId) {
    const index = favorites.indexOf(productId);
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('Producto eliminado de favoritos');
    } else {
        favorites.push(productId);
        showToast('¡Producto agregado a favoritos!');
    }
    saveFavorites();
    renderProducts(); // Re-render to update heart icons
}

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalPrice').textContent = product.price;
    document.getElementById('modalStars').textContent = '⭐'.repeat(Math.floor(product.rating));
    document.getElementById('modalRating').textContent = `${product.rating} (${Math.floor(Math.random() * 100 + 50)} reseñas)`;
    document.getElementById('modalDescription').textContent = product.description;
    
    // Update favorite button in modal
    const modalFavoriteBtn = document.getElementById('modalFavoriteBtn');
    const isFavorite = favorites.includes(productId);
    modalFavoriteBtn.textContent = isFavorite ? '❤️' : '🤍';
    modalFavoriteBtn.className = `modal-favorite-btn ${isFavorite ? 'active' : ''}`;
    
    document.getElementById('productModal').classList.add('active');
    document.getElementById('productModal').dataset.productId = productId;
}

function toggleModalFavorite() {
    const productId = parseInt(document.getElementById('productModal').dataset.productId);
    toggleFavorite(productId);
    
    // Update modal favorite button
    const modalFavoriteBtn = document.getElementById('modalFavoriteBtn');
    const isFavorite = favorites.includes(productId);
    modalFavoriteBtn.textContent = isFavorite ? '❤️' : '🤍';
    modalFavoriteBtn.className = `modal-favorite-btn ${isFavorite ? 'active' : ''}`;
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
}

function addToCart() {
    const productId = parseInt(document.getElementById('productModal').dataset.productId);
    const product = products.find(p => p.id === productId);
    
    if (product) {
        cart.push(product);
        saveCart();
        updateCartBadge();
        closeModal();
        
        // Show success feedback
        showToast('¡Producto agregado al carrito!');
    }
}

function updateCartBadge() {
    document.getElementById('cartBadge').textContent = cart.length;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #059669;
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        font-weight: 500;
        z-index: 1001;
        animation: slideInUp 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
}

// Navigation functions
function navigateTo(page) {
    // Remover la clase active de todos los nav-items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Agregar la clase active al item clickeado
    event.currentTarget.classList.add('active');
    
    // Redirigir a la página correspondiente
    window.location.href = page;
}

function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.nav-item');
    
    // Remover todas las clases active
    navItems.forEach(item => item.classList.remove('active'));
    
    // Establecer el item activo basado en la página actual
    switch(currentPage) {
        case 'main.html':
        case '':
            navItems[0].classList.add('active'); // Inicio
            break;
        case 'favorites.html':
            navItems[1].classList.add('active'); // Favoritos
            break;
        case 'carrito.html':
            navItems[2].classList.add('active'); // Carrito
            break;
        case 'profile.html':
            navItems[3].classList.add('active'); // Perfil
            break;
    }
}