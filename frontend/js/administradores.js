// ===== CONFIGURACIÓN Y VARIABLES GLOBALES =====
const API_BASE_URL = 'http://localhost:3000/api'; // Ajusta según tu configuración
let currentTab = 'users';
let users = [];
let products = [];
let allUsers = [];
let allProducts = [];
let selectedImageFile = null;
let currentImageData = null;

// ===== UTILIDADES =====
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(price);
}

function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Cargando datos...</div>';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===== FUNCIONES DE MANEJO DE IMÁGENES =====
function handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showToast('Formato de imagen no válido. Usa JPG, PNG o WebP', 'error');
        input.value = '';
        return;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        showToast('La imagen es demasiado grande. Máximo 5MB', 'error');
        input.value = '';
        return;
    }

    selectedImageFile = file;
    displayImagePreview(file);
}

function displayImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        const container = document.getElementById('imagePreviewContainer');
        const info = document.getElementById('imageInfo');
        
        preview.src = e.target.result;
        currentImageData = e.target.result;
        
        container.style.display = 'block';
        info.innerHTML = `
            <strong>Archivo:</strong> ${file.name}<br>
            <strong>Tamaño:</strong> ${formatFileSize(file.size)}<br>
            <strong>Tipo:</strong> ${file.type}
        `;
        
        // Ocultar el área de upload
        document.querySelector('.image-upload-container').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    selectedImageFile = null;
    currentImageData = null;
    
    const container = document.getElementById('imagePreviewContainer');
    const uploadContainer = document.querySelector('.image-upload-container');
    const fileInput = document.getElementById('productImageInput');
    
    container.style.display = 'none';
    uploadContainer.style.display = 'block';
    fileInput.value = '';
    
    document.getElementById('imagePreview').src = '';
    document.getElementById('imageInfo').innerHTML = '';
}

// Drag and drop functionality
function setupDragAndDrop() {
    const uploadContainer = document.querySelector('.image-upload-container');
    
    uploadContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    uploadContainer.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });
    
    uploadContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const fileInput = document.getElementById('productImageInput');
            fileInput.files = files;
            handleImageUpload(fileInput);
        }
    });
}

// ===== FUNCIONES DE API =====
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message || 'Error de conexión', 'error');
        throw error;
    }
}

// ===== NAVEGACIÓN DE PESTAÑAS =====
function switchTab(tabName) {
    // Actualizar pestañas activas
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-section').forEach(section => {
        section.classList.remove('active');
    });

    // Activar pestaña seleccionada
    event.target.closest('.nav-tab').classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    currentTab = tabName;

    // Cargar datos según la pestaña
    if (tabName === 'users') {
        loadUsers();
    } else if (tabName === 'products') {
        loadProducts();
    }
}

// ===== GESTIÓN DE USUARIOS =====
async function loadUsers() {
    try {
        showLoading('usersTableBody');
        showLoading('usersCardsContainer');
        
        // Simular datos por ahora - reemplazar con API real
        const userData = await simulateUsersAPI();
        
        allUsers = userData.data || [];
        users = [...allUsers];
        
        renderUsersTable();
        renderUsersCards();
        updateUsersStats();
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="8">Error al cargar usuarios</td></tr>';
        document.getElementById('usersCardsContainer').innerHTML = '<p>Error al cargar usuarios</p>';
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No hay usuarios para mostrar</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user._id.substr(-6)}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'N/A'}</td>
            <td><span class="status ${user.role}">${user.role === 'admin' ? 'Admin' : 'Cliente'}</span></td>
            <td><span class="status ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Activo' : 'Inactivo'}</span></td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editUser('${user._id}')">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser('${user._id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function renderUsersCards() {
    const container = document.getElementById('usersCardsContainer');
    
    if (users.length === 0) {
        container.innerHTML = '<p style="text-align: center;">No hay usuarios para mostrar</p>';
        return;
    }

    container.innerHTML = users.map(user => `
        <div class="item-card">
            <div class="item-card-header">
                <div>
                    <div class="item-card-title">${user.name}</div>
                    <div class="item-card-subtitle">${user.email}</div>
                </div>
                <span class="status ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Activo' : 'Inactivo'}</span>
            </div>
            <div class="item-card-info">
                <div class="item-card-field">
                    <label>Teléfono</label>
                    <span>${user.phone || 'N/A'}</span>
                </div>
                <div class="item-card-field">
                    <label>Rol</label>
                    <span class="status ${user.role}">${user.role === 'admin' ? 'Admin' : 'Cliente'}</span>
                </div>
                <div class="item-card-field">
                    <label>Registro</label>
                    <span>${formatDate(user.createdAt)}</span>
                </div>
                <div class="item-card-field">
                    <label>ID</label>
                    <span>${user._id.substr(-6)}</span>
                </div>
            </div>
            <div class="item-card-actions">
                <button class="btn btn-warning btn-sm" onclick="editUser('${user._id}')">✏️ Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser('${user._id}')">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

function updateUsersStats() {
    const total = allUsers.length;
    const active = allUsers.filter(u => u.isActive).length;
    const admins = allUsers.filter(u => u.role === 'admin').length;
    const newUsers = allUsers.filter(u => {
        const userDate = new Date(u.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return userDate > weekAgo;
    }).length;

    document.getElementById('totalUsers').textContent = total;
    document.getElementById('activeUsers').textContent = active;
    document.getElementById('adminUsers').textContent = admins;
    document.getElementById('newUsers').textContent = newUsers;
}

function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    
    if (searchTerm === '') {
        users = [...allUsers];
    } else {
        users = allUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.phone?.includes(searchTerm)
        );
    }
    
    renderUsersTable();
    renderUsersCards();
}

async function saveUser() {
    try {
        const userId = document.getElementById('userId').value;
        const userData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            phone: document.getElementById('userPhone').value,
            role: document.getElementById('userRole').value,
            isActive: document.getElementById('userIsActive').value === 'true'
        };

        if (!userId) {
            userData.password = document.getElementById('userPassword').value;
        }

        if (userId) {
            // Actualizar usuario existente
            await apiRequest(`/admin/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
            showToast('Usuario actualizado exitosamente');
        } else {
            // Crear nuevo usuario
            await apiRequest('/admin/users', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            showToast('Usuario creado exitosamente');
        }

        closeModal('userModal');
        loadUsers();
    } catch (error) {
        showToast('Error al guardar usuario', 'error');
    }
}

function editUser(userId) {
    const user = allUsers.find(u => u._id === userId);
    if (!user) return;

    document.getElementById('userId').value = user._id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userRole').value = user.role;
    document.getElementById('userIsActive').value = user.isActive.toString();
    
    // Ocultar campo de contraseña en edición
    document.getElementById('passwordGroup').style.display = 'none';
    document.getElementById('userPassword').required = false;
    
    document.getElementById('userModalTitle').textContent = 'Editar Usuario';
    openModal('userModal');
}

async function deleteUser(userId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
        await apiRequest(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
        showToast('Usuario eliminado exitosamente');
        loadUsers();
    } catch (error) {
        showToast('Error al eliminar usuario', 'error');
    }
}

// ===== GESTIÓN DE PRODUCTOS =====
async function loadProducts() {
    try {
        showLoading('productsTableBody');
        showLoading('productsCardsContainer');
        
        // Simular datos por ahora - reemplazar con API real
        const productData = await simulateProductsAPI();
        
        allProducts = productData.data || [];
        products = [...allProducts];
        
        renderProductsTable();
        renderProductsCards();
        updateProductsStats();
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsTableBody').innerHTML = '<tr><td colspan="8">Error al cargar productos</td></tr>';
        document.getElementById('productsCardsContainer').innerHTML = '<p>Error al cargar productos</p>';
    }
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No hay productos para mostrar</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.sku}</td>
            <td>${product.name}</td>
            <td><span class="pet-category ${product.category}">${getCategoryName(product.category)}</span></td>
            <td>${product.brand}</td>
            <td class="price">${formatPrice(product.price)}</td>
            <td>${product.stock}</td>
            <td><span class="status ${getStockStatus(product)}">${getStockStatusText(product)}</span></td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editProduct('${product._id}')">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product._id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function renderProductsCards() {
    const container = document.getElementById('productsCardsContainer');
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center;">No hay productos para mostrar</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="item-card">
            <div class="item-card-header">
                <div>
                    <div class="item-card-title">${product.name}</div>
                    <div class="item-card-subtitle">${product.brand}</div>
                </div>
                <span class="status ${getStockStatus(product)}">${getStockStatusText(product)}</span>
            </div>
            <div class="item-card-info">
                <div class="item-card-field">
                    <label>SKU</label>
                    <span>${product.sku}</span>
                </div>
                <div class="item-card-field">
                    <label>Categoría</label>
                    <span class="pet-category ${product.category}">${getCategoryName(product.category)}</span>
                </div>
                <div class="item-card-field">
                    <label>Precio</label>
                    <span class="price">${formatPrice(product.price)}</span>
                </div>
                <div class="item-card-field">
                    <label>Stock</label>
                    <span>${product.stock} unidades</span>
                </div>
            </div>
            <div class="item-card-actions">
                <button class="btn btn-warning btn-sm" onclick="editProduct('${product._id}')">✏️ Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product._id}')">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

function updateProductsStats() {
    const total = allProducts.length;
    const inStock = allProducts.filter(p => p.stock > p.minStock).length;
    const lowStock = allProducts.filter(p => p.stock <= p.minStock && p.stock > 0).length;
    const outStock = allProducts.filter(p => p.stock === 0).length;

    document.getElementById('totalProducts').textContent = total;
    document.getElementById('inStockProducts').textContent = inStock;
    document.getElementById('lowStockProducts').textContent = lowStock;
    document.getElementById('outStockProducts').textContent = outStock;
}

function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    
    if (searchTerm === '') {
        products = [...allProducts];
    } else {
        products = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.sku.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    
    renderProductsTable();
    renderProductsCards();
}

async function saveProduct() {
    try {
        const productId = document.getElementById('productId').value;
        const productData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            category: document.getElementById('productCategory').value,
            brand: document.getElementById('productBrand').value,
            sku: document.getElementById('productSku').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            minStock: parseInt(document.getElementById('productMinStock').value),
            featured: document.getElementById('productFeatured').value === 'true',
            isActive: document.getElementById('productIsActive').value === 'true'
        };

        // Agregar imagen si hay una seleccionada
        if (selectedImageFile || currentImageData) {
            productData.image = currentImageData;
            productData.imageName = selectedImageFile ? selectedImageFile.name : 'imagen_producto.jpg';
        }

        if (productId) {
            // Actualizar producto existente
            await apiRequest(`/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
            showToast('Producto actualizado exitosamente');
        } else {
            // Crear nuevo producto
            await apiRequest('/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
            showToast('Producto creado exitosamente');
        }

        closeModal('productModal');
        loadProducts();
    } catch (error) {
        showToast('Error al guardar producto', 'error');
    }
}

function editProduct(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;

    document.getElementById('productId').value = product._id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productBrand').value = product.brand;
    document.getElementById('productSku').value = product.sku;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productMinStock').value = product.minStock;
    document.getElementById('productFeatured').value = product.featured.toString();
    document.getElementById('productIsActive').value = product.isActive.toString();
    
    // Si el producto tiene imagen, mostrarla
    if (product.image) {
        currentImageData = product.image;
        const preview = document.getElementById('imagePreview');
        const container = document.getElementById('imagePreviewContainer');
        const info = document.getElementById('imageInfo');
        
        preview.src = product.image;
        container.style.display = 'block';
        info.innerHTML = `<strong>Imagen actual del producto</strong>`;
        
        document.querySelector('.image-upload-container').style.display = 'none';
    } else {
        removeImage();
    }
    
    document.getElementById('productModalTitle').textContent = 'Editar Producto';
    openModal('productModal');
}

async function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
        await apiRequest(`/products/${productId}`, {
            method: 'DELETE'
        });
        showToast('Producto eliminado exitosamente');
        loadProducts();
    } catch (error) {
        showToast('Error al eliminar producto', 'error');
    }
}

// ===== UTILIDADES PARA PRODUCTOS =====
function getCategoryName(category) {
    const categories = {
        'perros': 'Perros 🐕',
        'gatos': 'Gatos 🐱',
        'aves': 'Aves 🐦',
        'peces': 'Peces 🐠'
    };
    return categories[category] || category;
}

function getStockStatus(product) {
    if (product.stock === 0) return 'out-stock';
    if (product.stock <= product.minStock) return 'low-stock';
    return 'in-stock';
}

function getStockStatusText(product) {
    if (product.stock === 0) return 'Agotado';
    if (product.stock <= product.minStock) return 'Stock Bajo';
    return 'En Stock';
}

// ===== GESTIÓN DE MODALES =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    
    // Reset form if it's a new item
    if (modalId === 'userModal' && !document.getElementById('userId').value) {
        document.getElementById('userForm').reset();
        document.getElementById('passwordGroup').style.display = 'block';
        document.getElementById('userPassword').required = true;
        document.getElementById('userModalTitle').textContent = 'Nuevo Usuario';
    } else if (modalId === 'productModal' && !document.getElementById('productId').value) {
        document.getElementById('productForm').reset();
        removeImage(); // Reset image upload
        document.getElementById('productModalTitle').textContent = 'Nuevo Producto';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    
    // Reset image upload when closing product modal
    if (modalId === 'productModal') {
        removeImage();
    }
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target.id);
    }
});

// ===== DATOS SIMULADOS (REEMPLAZAR CON API REAL) =====
async function simulateUsersAPI() {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
        success: true,
        data: [
            {
                _id: '675b1a2c3d4e5f6789012345',
                name: 'Juan Pérez',
                email: 'juan@example.com',
                phone: '5551234567',
                role: 'admin',
                isActive: true,
                createdAt: '2024-01-15T10:30:00Z'
            },
            {
                _id: '675b1a2c3d4e5f6789012346',
                name: 'María García',
                email: 'maria@example.com',
                phone: '5559876543',
                role: 'customer',
                isActive: true,
                createdAt: '2024-02-20T14:15:00Z'
            },
            {
                _id: '675b1a2c3d4e5f6789012347',
                name: 'Carlos López',
                email: 'carlos@example.com',
                phone: '5555555555',
                role: 'customer',
                isActive: false,
                createdAt: '2024-03-10T09:45:00Z'
            },
            {
                _id: '675b1a2c3d4e5f6789012348',
                name: 'Ana Rodríguez',
                email: 'ana@example.com',
                phone: '5551111111',
                role: 'customer',
                isActive: true,
                createdAt: '2024-07-28T16:20:00Z'
            },
            {
                _id: '675b1a2c3d4e5f6789012349',
                name: 'Luis Martínez',
                email: 'luis@example.com',
                phone: '5552222222',
                role: 'admin',
                isActive: true,
                createdAt: '2024-07-30T08:45:00Z'
            }
        ]
    };
}

async function simulateProductsAPI() {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
        success: true,
        data: [
            {
                _id: '675b1a2c3d4e5f6789012350',
                name: 'Alimento Premium para Perros',
                description: 'Alimento balanceado de alta calidad para perros adultos',
                category: 'perros',
                brand: 'Royal Canin',
                sku: 'RC-DOG-001',
                price: 850.00,
                stock: 25,
                minStock: 5,
                featured: true,
                isActive: true,
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmOGZmIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NzVlYTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+SW1hZ2VuIGRlIFByb2R1Y3RvPC90ZXh0Pgo8L3N2Zz4K',
                createdAt: '2024-01-10T08:00:00Z'
            },
            {
                _id: '675b1a2c3d4e5f6789012351',
                name: 'Arena para Gatos Aglutinante',
                description: 'Arena aglutinante sin polvo, con control de olores',
                category: 'gatos',
                brand: 'Cat Litter Pro',
                sku: 'CL-CAT-002',
                price: 120.00,
                stock: 3,
                minStock: 10,
                featured: false,
                isActive: true,
                image: null,
                createdAt: '2024-02-05T11:30:00Z'
            },
            {
                _id: '675b1a2c3d4e5f6789012352',
                name: 'Semillas Nutritivas para Aves',
                description: 'Mezcla completa de semillas para canarios y periquitos',
                category: 'aves',
                brand: 'Bird Food Plus',
                sku: 'BF-BIRD-003',
                price: 75.00,
                stock: 0,
                minStock: 5,
                featured: false,
                isActive: true,
                image: null,
                createdAt: '2024-01-25T16:20:00Z'
            },
            {
                _id: '675b1a2c3d4e5f6789012353',
                name: 'Comida para Peces Tropicales',
                description: 'Alimento completo en hojuelas para peces tropicales',
                category: 'peces',
                brand: 'AquaLife',
                sku: 'AL-FISH-004',
                price: 45.00,
                stock: 15,
                minStock: 8,
                featured: true,
                isActive: true,
                image: null,
                createdAt: '2024-03-12T14:10:00Z'
            },
            {
                _id: '675b1a2c3d4e5f6789012354',
                name: 'Collar Antipulgas para Perros',
                description: 'Collar de protección contra pulgas y garrapatas',
                category: 'perros',
                brand: 'FleaGuard',
                sku: 'FG-DOG-005',
                price: 180.00,
                stock: 8,
                minStock: 5,
                featured: false,
                isActive: true,
                image: null,
                createdAt: '2024-04-08T09:25:00Z'
            }
        ]
    };
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos iniciales
    loadUsers();
    
    // Configurar eventos de formularios
    document.getElementById('userForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveUser();
    });
    
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });

    // Configurar drag and drop para imágenes
    setupDragAndDrop();
});