// ===== ADMIN PANEL JAVASCRIPT =====

let currentEditingProduct = null;
let allProducts = [];
let allUsers = [];

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    initializeAdmin();
});

function checkAdminAccess() {
    const user = getCurrentUser();
    if (!user || (user.role !== 'admin' && user.email !== 'admin@petstyle.com')) {
        showToast('Acceso denegado. Se requieren permisos de administrador.', 'error');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 2000);
        return false;
    }
    return true;
}

async function initializeAdmin() {
    await loadDashboardData();
    await loadProducts();
    await loadUsers();
    setupEventListeners();
}

// Dashboard Functions
async function loadDashboardData() {
    try {
        // Load products for stats
        const products = await api.getAllProducts();
        allProducts = products;
        
        // Generate mock users data
        generateMockUsers();
        
        updateDashboardStats();
        generateCategoryChart();
        generateActivityLog();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error al cargar datos del dashboard', 'error');
    }
}

function updateDashboardStats() {
    document.getElementById('total-products').textContent = allProducts.length;
    document.getElementById('total-users').textContent = allUsers.length;
    document.getElementById('total-orders').textContent = Math.floor(Math.random() * 50) + 10;
    document.getElementById('total-revenue').textContent = `$${(Math.random() * 10000 + 5000).toFixed(2)}`;
}

function generateCategoryChart() {
    const categories = {};
    allProducts.forEach(product => {
        categories[product.categoria] = (categories[product.categoria] || 0) + 1;
    });

    const chartContainer = document.getElementById('category-chart');
    const maxValue = Math.max(...Object.values(categories));
    
    chartContainer.innerHTML = Object.entries(categories).map(([category, count]) => `
        <div class="chart-bar" style="height: ${(count / maxValue) * 160}px;">
            ${count}
            <div class="chart-label">${category}</div>
        </div>
    `).join('');
}

function generateActivityLog() {
    const activities = [
        { icon: 'fas fa-plus', text: 'Nuevo producto agregado', time: '2 min' },
        { icon: 'fas fa-user', text: 'Usuario registrado', time: '5 min' },
        { icon: 'fas fa-edit', text: 'Producto actualizado', time: '10 min' },
        { icon: 'fas fa-shopping-cart', text: 'Nueva orden recibida', time: '15 min' },
        { icon: 'fas fa-star', text: 'Nueva reseña recibida', time: '20 min' }
    ];

    const activityContainer = document.getElementById('activity-log');
    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-text">${activity.text}</div>
            <div class="activity-time">hace ${activity.time}</div>
        </div>
    `).join('');
}

// Products Management
async function loadProducts() {
    try {
        showProductsLoading();
        const products = await api.getAllProducts();
        allProducts = products;
        renderProductsTable(products);
        populateCategoryFilter();
    } catch (error) {
        console.error('Error loading products:', error);
        showProductsError();
    }
}

function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    <i class="fas fa-box-open"></i>
                    <p>No hay productos disponibles</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.imagen || 'https://via.placeholder.com/40'}" 
                     alt="${product.nombre}"
                     onerror="this.src='https://via.placeholder.com/40?text=No+Image'">
            </td>
            <td>${product.nombre}</td>
            <td>${product.categoria}</td>
            <td>$${product.precio}</td>
            <td>${product.stock || 'N/A'}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editProduct('${product._id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteProduct('${product._id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showProductsLoading() {
    document.getElementById('products-table-body').innerHTML = `
        <tr>
            <td colspan="6" class="loading-row">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando productos...</p>
            </td>
        </tr>
    `;
}

function showProductsError() {
    document.getElementById('products-table-body').innerHTML = `
        <tr>
            <td colspan="6" class="empty-table">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar productos</p>
            </td>
        </tr>
    `;
}

function populateCategoryFilter() {
    const categories = [...new Set(allProducts.map(p => p.categoria))];
    const select = document.getElementById('category-filter');
    
    // Clear existing options except "Todas las categorías"
    select.innerHTML = '<option value="">Todas las categorías</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    
    const filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.nombre.toLowerCase().includes(searchTerm) ||
                            product.categoria.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.categoria === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    renderProductsTable(filteredProducts);
}

// Product Modal Functions
function openProductModal(productId = null) {
    currentEditingProduct = productId;
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    const submitBtn = document.getElementById('product-submit-btn');
    
    if (productId) {
        // Edit mode
        title.textContent = 'Editar Producto';
        submitBtn.textContent = 'Actualizar Producto';
        
        const product = allProducts.find(p => p._id === productId);
        if (product) {
            document.getElementById('product-name').value = product.nombre;
            document.getElementById('product-category').value = product.categoria;
            document.getElementById('product-price').value = product.precio;
            document.getElementById('product-stock').value = product.stock || 0;
            document.getElementById('product-description').value = product.descripcion || '';
            document.getElementById('product-image').value = product.imagen || '';
        }
    } else {
        // Create mode
        title.textContent = 'Nuevo Producto';
        submitBtn.textContent = 'Crear Producto';
        document.getElementById('product-form').reset();
    }
    
    modal.style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    currentEditingProduct = null;
}

// Users Management
function generateMockUsers() {
    const currentUser = getCurrentUser();
    allUsers = [
        currentUser,
        {
            _id: 'user1',
            nombre: 'Juan Pérez',
            email: 'juan@email.com',
            role: 'user',
            fechaRegistro: '2024-01-15'
        },
        {
            _id: 'user2',
            nombre: 'María García',
            email: 'maria@email.com',
            role: 'user',
            fechaRegistro: '2024-02-10'
        },
        {
            _id: 'user3',
            nombre: 'Carlos López',
            email: 'carlos@email.com',
            role: 'user',
            fechaRegistro: '2024-03-05'
        }
    ];
}

function loadUsers() {
    renderUsersTable(allUsers);
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    <i class="fas fa-users"></i>
                    <p>No hay usuarios disponibles</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre || 'U')}&background=6366f1&color=fff&size=32" 
                     alt="${user.nombre}" class="avatar">
            </td>
            <td>${user.nombre}</td>
            <td>${user.email}</td>
            <td>
                <span class="role-badge ${user.role || 'user'}">
                    ${user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
            </td>
            <td>${new Date(user.fechaRegistro || Date.now()).toLocaleDateString()}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editUser('${user._id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${user._id !== getCurrentUser()._id ? `
                        <button class="action-btn delete" onclick="deleteUser('${user._id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function filterUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const roleFilter = document.getElementById('role-filter').value;
    
    const filteredUsers = allUsers.filter(user => {
        const matchesSearch = user.nombre.toLowerCase().includes(searchTerm) ||
                            user.email.toLowerCase().includes(searchTerm);
        const matchesRole = !roleFilter || user.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });
    
    renderUsersTable(filteredUsers);
}

// Event Listeners
function setupEventListeners() {
    // Product form submission
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    
    // Close modals when clicking outside
    document.getElementById('product-modal').addEventListener('click', function(e) {
        if (e.target === this) closeProductModal();
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = {
        nombre: document.getElementById('product-name').value.trim(),
        categoria: document.getElementById('product-category').value,
        precio: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value) || 0,
        descripcion: document.getElementById('product-description').value.trim(),
        imagen: document.getElementById('product-image').value.trim()
    };

    // Basic validation
    if (!formData.nombre || !formData.categoria || formData.precio <= 0) {
        showToast('Por favor completa todos los campos obligatorios', 'error');
        return;
    }

    try {
        if (currentEditingProduct) {
            // Update existing product
            await api.updateProduct(currentEditingProduct, formData);
            showToast('Producto actualizado correctamente', 'success');
        } else {
            // Create new product
            await api.createProduct(formData);
            showToast('Producto creado correctamente', 'success');
        }
        
        closeProductModal();
        await loadProducts();
        await loadDashboardData(); // Refresh dashboard stats
        
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Error al guardar el producto', 'error');
    }
}

// Product Actions
function editProduct(productId) {
    openProductModal(productId);
}

async function deleteProduct(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar "${product.nombre}"?`)) {
        try {
            await api.deleteProduct(productId);
            showToast('Producto eliminado correctamente', 'success');
            await loadProducts();
            await loadDashboardData();
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast('Error al eliminar el producto', 'error');
        }
    }
}

// User Actions
function editUser(userId) {
    showToast('Edición de usuarios próximamente', 'info');
}

function deleteUser(userId) {
    const user = allUsers.find(u => u._id === userId);
    if (!user) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario "${user.nombre}"?`)) {
        allUsers = allUsers.filter(u => u._id !== userId);
        renderUsersTable(allUsers);
        showToast('Usuario eliminado correctamente', 'success');
        updateDashboardStats();
    }
}

function exportUsers() {
    const csvContent = [
        ['Nombre', 'Email', 'Rol', 'Fecha de Registro'],
        ...allUsers.map(user => [
            user.nombre,
            user.email,
            user.role === 'admin' ? 'Administrador' : 'Usuario',
            new Date(user.fechaRegistro || Date.now()).toLocaleDateString()
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios_petstyle.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Lista de usuarios exportada', 'success');
}

// Navigation Functions
function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="showSection('${sectionName}')"]`).classList.add('active');
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
    document.getElementById(`${sectionName}-section`).classList.add('active');
}

async function refreshData() {
    showToast('Actualizando datos...', 'info');
    await loadDashboardData();
    await loadProducts();
    loadUsers();
    showToast('Datos actualizados', 'success');
}