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

let favorites = [];
let cart = [];

document.addEventListener('DOMContentLoaded', function () {
    loadFavorites();
    loadCart();
    renderFavorites();
    updateCartBadge();
    setActiveNavItem();
});

function loadFavorites() {
    const savedFavorites = localStorage.getItem('petStyle_favorites');
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
    }
}

function loadCart() {
    const savedCart = localStorage.getItem('petStyle_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function saveFavorites() {
    localStorage.setItem('petStyle_favorites', JSON.stringify(favorites));
}

function saveCart() {
    localStorage.setItem('petStyle_cart', JSON.stringify(cart));
}

function renderFavorites() {
    const grid = document.getElementById('favoritesGrid');
    const emptyState = document.getElementById('emptyState');

    if (favorites.length === 0) {
        emptyState.style.display = 'block';
        grid.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    grid.style.display = 'grid';

    const favoriteProducts = products.filter(product => favorites.includes(product.id));

    grid.innerHTML = favoriteProducts.map(product => `
        <div class="favorite-card">
            <img src="${product.image}" alt="${product.name}" class="favorite-image">
            <div class="favorite-info">
                <h3 class="favorite-name">${product.name}</h3>
                <div class="favorite-price">${product.price}</div>
                <div class="favorite-rating">
                    <span class="stars">${'⭐'.repeat(Math.floor(product.rating))}</span>
                    <span>${product.rating}</span>
                </div>
            </div>
            <div class="favorite-actions">
                <button class="remove-favorite" onclick="removeFromFavorites(${product.id})" title="Quitar de favoritos">
                    💔
                </button>
                <button class="add-to-cart-small" onclick="addToCart(${product.id})">
                    Agregar
                </button>
            </div>
        </div>
    `).join('');
}

function removeFromFavorites(productId) {
    const index = favorites.indexOf(productId);
    if (index > -1) {
        favorites.splice(index, 1);
        saveFavorites();
        renderFavorites();
        showToast('Producto eliminado de favoritos', 'error');
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        saveCart();
        updateCartBadge();
        showToast('¡Producto agregado al carrito!');
    }
}

function updateCartBadge() {
    document.getElementById('cartBadge').textContent = cart.length;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInUp 0.3s ease reverse';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
}

function navigateTo(page) {
    window.location.href = page;
}

function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => item.classList.remove('active'));

    switch (currentPage) {
        case 'main.html':
        case '':
            navItems[0].classList.add('active');
            break;
        case 'favorites.html':
            navItems[1].classList.add('active');
            break;
        case 'carrito.html':
            navItems[2].classList.add('active');
            break;
        case 'profile.html':
            navItems[3].classList.add('active');
            break;
    }
}
