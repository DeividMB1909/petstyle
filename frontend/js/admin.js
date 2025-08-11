
// ===== ADMIN PANEL JAVASCRIPT - CORREGIDO PARA TUS CATEGORÍAS =====

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
    const totalProductsEl = document.getElementById('total-products');
    const totalUsersEl = document.getElementById('total-users');
    const totalOrdersEl = document.getElementById('total-orders');
    const totalRevenueEl = document.getElementById('total-revenue');
    
    if (totalProductsEl) totalProductsEl.textContent = allProducts.length;
    if (totalUsersEl) totalUsersEl.textContent = allUsers.length;
    if (totalOrdersEl) totalOrdersEl.textContent = Math.floor(Math.random() * 50) + 10;
    if (totalRevenueEl) totalRevenueEl.textContent = `$${(Math.random() * 10000 + 5000).toFixed(2)}`;
}

function generateCategoryChart() {
    const chartContainer = document.getElementById('category-chart');
    if (!chartContainer) return;
    
    const categories = {};
    allProducts.forEach(product => {
        // Manejar tanto ObjectId como nombres de categoría
        let categoryName = 'Sin categoría';
        
        if (product.category) {
            // Si es un ObjectId, convertir a nombre
            const categoryMap = {
                '6898049bdd53186ec08fd313': 'Perros',
                '6898049bdd53186ec08fd316': 'Gatos', 
                '6898049bdd53186ec08fd319': 'Aves',
                '6898049bdd53186ec08fd31c': 'Peces',
                '6898049bdd53186ec08fd31f': 'Accesorios'
            };
            
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
        
        categories[categoryName] = (categories[categoryName] || 0) + 1;
    });

    if (Object.keys(categories).length === 0) {
        chartContainer.innerHTML = '<p>No hay datos para mostrar</p>';
        return;
    }

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
    if (!activityContainer) return;
    
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
    if (!tbody) return;
    
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

    tbody.innerHTML = products.map(product => {
        // Manejar diferentes formatos de imagen
        let imageUrl = 'https://via.placeholder.com/40?text=No+Image';
        if (product.images && product.images.length > 0) {
            imageUrl = product.images[0].url || product.images[0];
        } else if (product.imagen) {
            imageUrl = product.imagen;
        } else if (product.image) {
            imageUrl = product.image;
        }

        // Manejar nombre de categoría
        let categoryName = 'Sin categoría';
        if (product.category) {
            const categoryMap = {
                '6898049bdd53186ec08fd313': 'Perros',
                '6898049bdd53186ec08fd316': 'Gatos', 
                '6898049bdd53186ec08fd319': 'Aves',
                '6898049bdd53186ec08fd31c': 'Peces',
                '6898049bdd53186ec08fd31f': 'Accesorios'
            };
            
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

        return `
            <tr>
                <td>
                    <img src="${imageUrl}" 
                         alt="${product.nombre || product.name}"
                         onerror="this.src='https://via.placeholder.com/40?text=No+Image'">
                </td>
                <td>${product.nombre || product.name}</td>
                <td>${categoryName}</td>
                <td>$${product.precio || product.price}</td>
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
        `;
    }).join('');
}

function showProductsLoading() {
    const tbody = document.getElementById('products-table-body');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-row">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Cargando productos...</p>
                </td>
            </tr>
        `;
    }
}

function showProductsError() {
    const tbody = document.getElementById('products-table-body');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar productos</p>
                </td>
            </tr>
        `;
    }
}

function populateCategoryFilter() {
    const categoryMap = {
        '6898049bdd53186ec08fd313': 'Perros',
        '6898049bdd53186ec08fd316': 'Gatos', 
        '6898049bdd53186ec08fd319': 'Aves',
        '6898049bdd53186ec08fd31c': 'Peces',
        '6898049bdd53186ec08fd31f': 'Accesorios'
    };
    
    const categories = [...new Set(allProducts.map(p => {
        if (p.category) {
            if (typeof p.category === 'object' && p.category.name) {
                return p.category.name;
            } else if (categoryMap[p.category]) {
                return categoryMap[p.category];
            } else if (typeof p.category === 'string') {
                return p.category;
            }
        }
        return p.categoria || 'Sin categoría';
    }))];
    
    const select = document.getElementById('category-filter');
    if (!select) return;
    
    // Clear existing options except "Todas las categorías"
    select.innerHTML = '<option value="">Todas las categorías</option>';
    
    categories.forEach(category => {
        if (category) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        }
    });
}

function filterProducts() {
    const searchInput = document.getElementById('product-search');
    const categorySelect = document.getElementById('category-filter');
    
    if (!searchInput || !categorySelect) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const categoryFilter = categorySelect.value;
    
    const categoryMap = {
        '6898049bdd53186ec08fd313': 'Perros',
        '6898049bdd53186ec08fd316': 'Gatos', 
        '6898049bdd53186ec08fd319': 'Aves',
        '6898049bdd53186ec08fd31c': 'Peces',
        '6898049bdd53186ec08fd31f': 'Accesorios'
    };
    
    const filteredProducts = allProducts.filter(product => {
        const name = product.nombre || product.name || '';
        
        let categoryName = 'Sin categoría';
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
        
        const matchesSearch = name.toLowerCase().includes(searchTerm) ||
                            categoryName.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || categoryName === categoryFilter;
        
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
    
    if (!modal) {
        console.error('Product modal not found');
        return;
    }
    
    if (productId) {
        // Edit mode
        if (title) title.textContent = 'Editar Producto';
        if (submitBtn) submitBtn.textContent = 'Actualizar Producto';
        
        const product = allProducts.find(p => p._id === productId);
        if (product) {
            const nameInput = document.getElementById('product-name');
            const categoryInput = document.getElementById('product-category');
            const priceInput = document.getElementById('product-price');
            const stockInput = document.getElementById('product-stock');
            const descInput = document.getElementById('product-description');
            const imageInput = document.getElementById('product-image');
            
            if (nameInput) nameInput.value = product.nombre || product.name || '';
            
            // Manejar categoría en edición
            if (categoryInput && product.category) {
                if (typeof product.category === 'object' && product.category._id) {
                    categoryInput.value = product.category._id;
                } else if (typeof product.category === 'string') {
                    categoryInput.value = product.category;
                }
            }
            
            if (priceInput) priceInput.value = product.precio || product.price || 0;
            if (stockInput) stockInput.value = product.stock || 0;
            if (descInput) descInput.value = product.descripcion || product.description || '';
            
            // Manejar imagen de edición
            let imageUrl = '';
            if (product.images && product.images.length > 0) {
                imageUrl = product.images[0].url || product.images[0];
            } else if (product.imagen) {
                imageUrl = product.imagen;
            } else if (product.image) {
                imageUrl = product.image;
            }
            if (imageInput) imageInput.value = imageUrl;
        }
    } else {
        // Create mode
        if (title) title.textContent = 'Nuevo Producto';
        if (submitBtn) submitBtn.textContent = 'Crear Producto';
        
        const form = document.getElementById('product-form');
        if (form) form.reset();
    }
    
    modal.style.display = 'flex';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentEditingProduct = null;
    
    // Reset form
    const form = document.getElementById('product-form');
    if (form) {
        form.reset();
    }
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
    if (!tbody) return;
    
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
    const searchInput = document.getElementById('user-search');
    const roleSelect = document.getElementById('role-filter');
    
    if (!searchInput || !roleSelect) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const roleFilter = roleSelect.value;
    
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
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Close modals when clicking outside
    const productModal = document.getElementById('product-modal');
    if (productModal) {
        productModal.addEventListener('click', function(e) {
            if (e.target === this) closeProductModal();
        });
    }
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });
    
    // Search and filter events
    const productSearch = document.getElementById('product-search');
    const categoryFilter = document.getElementById('category-filter');
    const userSearch = document.getElementById('user-search');
    const roleFilter = document.getElementById('role-filter');
    
    if (productSearch) productSearch.addEventListener('input', filterProducts);
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
    if (userSearch) userSearch.addEventListener('input', filterUsers);
    if (roleFilter) roleFilter.addEventListener('change', filterUsers);
}

// ✅ CORREGIDO: Product submission function para tus categorías reales
async function handleProductSubmit(e) {
    e.preventDefault();
    
    console.log('🛍️ Iniciando creación/edición de producto...');
    
    try {
        // Obtener datos del formulario
        const nameInput = document.getElementById('product-name');
        const categoryInput = document.getElementById('product-category');
        const priceInput = document.getElementById('product-price');
        const stockInput = document.getElementById('product-stock');
        const descInput = document.getElementById('product-description');
        const imageInput = document.getElementById('product-image');
        
        if (!nameInput || !categoryInput || !priceInput) {
            throw new Error('No se encontraron los campos obligatorios del formulario');
        }
        
        const nombre = nameInput.value?.trim();
        const categoryId = categoryInput.value; // ✅ Ya es un ObjectId válido del HTML
        const precioText = priceInput.value?.trim();
        const stockText = stockInput?.value?.trim() || '0';
        const descripcion = descInput?.value?.trim() || '';
        const imagenUrl = imageInput?.value?.trim() || '';

        console.log('📋 Datos extraídos del formulario:', {
            nombre, categoryId, precioText, stockText, descripcion, imagenUrl
        });

        // Validaciones
        if (!nombre || nombre.length < 2) {
            throw new Error('El nombre del producto debe tener al menos 2 caracteres');
        }
        
        if (!categoryId) {
            throw new Error('Debes seleccionar una categoría');
        }
        
        const precio = parseFloat(precioText);
        if (!precioText || isNaN(precio) || precio <= 0) {
            throw new Error('El precio debe ser un número mayor a 0');
        }
        
        const stock = parseInt(stockText);
        if (isNaN(stock) || stock < 0) {
            throw new Error('El stock debe ser un número válido (0 o mayor)');
        }
        
        if (!descripcion || descripcion.length < 10) {
            throw new Error('La descripción debe tener al menos 10 caracteres');
        }

        // Mapear ObjectId a nombre de categoría para SKU y tags
        const categoryNames = {
            '6898049bdd53186ec08fd313': 'PERROS',
            '6898049bdd53186ec08fd316': 'GATOS', 
            '6898049bdd53186ec08fd319': 'AVES',
            '6898049bdd53186ec08fd31c': 'PECES',
            '6898049bdd53186ec08fd31f': 'ACCESORIOS'
        };

        const categoryName = categoryNames[categoryId] || 'PRODUCTO';

        // Formatear datos según tu modelo de Product
        const formData = {
            name: nombre,
            description: descripcion,
            price: precio,
            stock: stock,
            category: categoryId, // ✅ ObjectId válido de MongoDB
            
            // Formatear images según tu modelo (array de objetos)
            images: imagenUrl ? [{
                url: imagenUrl,
                publicId: `product_${Date.now()}`,
                alt: `Imagen de ${nombre}`,
                isPrimary: true,
                optimizedUrl: imagenUrl
            }] : [{
                url: 'https://via.placeholder.com/300x300?text=Producto',
                publicId: `placeholder_${Date.now()}`,
                alt: `Imagen de ${nombre}`,
                isPrimary: true,
                optimizedUrl: 'https://via.placeholder.com/150x150?text=Producto'
            }],
            
            // SKU único requerido
            sku: `${categoryName}-${Date.now()}`,
            
            // Campos opcionales pero útiles
            brand: 'PetStyle',
            tags: [categoryName.toLowerCase(), 'petstyle'],
            featured: false,
            isActive: true,
            minStock: 5
        };

        console.log('📦 Datos preparados para tu modelo Product:', formData);

        // Enviar al backend
        let response;
        if (currentEditingProduct) {
            console.log('✏️ Actualizando producto existente:', currentEditingProduct);
            response = await api.updateProduct(currentEditingProduct, formData);
            showToast('✅ Producto actualizado correctamente', 'success');
        } else {
            console.log('🆕 Creando nuevo producto');
            response = await api.createProduct(formData);
            showToast('✅ Producto creado correctamente', 'success');
        }
        
        console.log('✅ Respuesta del servidor:', response);
        
        // Cerrar modal y actualizar vista
        closeProductModal();
        await loadProducts();
        await loadDashboardData();
        
    } catch (error) {
        console.error('❌ Error al procesar producto:', error);
        
        let errorMessage = 'Error desconocido al procesar el producto';
        
        if (error.message) {
            errorMessage = error.message;
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            if (Array.isArray(errors)) {
                errorMessage = errors.map(e => e.message || e.msg || e).join(', ');
            } else if (typeof errors === 'object') {
                errorMessage = Object.values(errors).flat().map(e => {
                    if (typeof e === 'object' && e.message) return e.message;
                    if (typeof e === 'object' && e.msg) return e.msg;
                    return e.toString();
                }).join(', ');
            }
        } else if (error.response?.status === 400) {
            errorMessage = 'Datos inválidos. Verifica todos los campos.';
        } else if (error.response?.status === 401) {
            errorMessage = 'No tienes permisos para realizar esta acción.';
        } else if (error.response?.status === 404) {
            errorMessage = 'Ruta no encontrada. Verifica la configuración del servidor.';
        }
        
        showToast(`❌ ${errorMessage}`, 'error');
    }
}

// Product Actions
function editProduct(productId) {
    openProductModal(productId);
}

async function deleteProduct(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;
    
    const productName = product.nombre || product.name || 'este producto';
    
    if (confirm(`¿Estás seguro de que quieres eliminar "${productName}"?`)) {
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
    const navBtn = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (navBtn) navBtn.classList.add('active');
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
    const section = document.getElementById(`${sectionName}-section`);
    if (section) section.classList.add('active');
}

async function refreshData() {
    showToast('Actualizando datos...', 'info');
    try {
        await loadDashboardData();
        await loadProducts();
        loadUsers();
        showToast('✅ Datos actualizados correctamente', 'success');
    } catch (error) {
        console.error('Error refreshing data:', error);
        showToast('❌ Error al actualizar algunos datos', 'error');
    }
}
