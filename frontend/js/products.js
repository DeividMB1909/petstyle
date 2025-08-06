class ProductManager {
    constructor() {
        this.apiClient = apiClient;
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.isLoading = false;
    }

    // Cargar y mostrar productos
    async loadProducts(page = 1) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage = page;
        
        try {
            showLoading('Cargando productos...');
            
            const response = await this.apiClient.getProducts(page, this.productsPerPage);
            
            if (response && response.success) {
                this.renderProducts(response.products);
                this.renderPagination(response.totalPages, page);
            } else {
                showError('Error al cargar los productos');
            }
        } catch (error) {
            showError('Error de conexión al cargar productos');
        } finally {
            this.isLoading = false;
            hideLoading();
        }
    }

    // Renderizar productos en el DOM
    renderProducts(products) {
        const container = document.getElementById('products-container');
        if (!container) return;

        container.innerHTML = '';

        products.forEach(product => {
            const productCard = this.createProductCard(product);
            container.appendChild(productCard);
        });
    }

    // Crear tarjeta de producto
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image || '/assets/images/placeholder.jpg'}" 
                     alt="${product.name}" 
                     loading="lazy">
                <div class="product-overlay">
                    <button class="btn-quick-view" onclick="productManager.quickView('${product._id}')">
                        Vista rápida
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category?.name || 'Sin categoría'}</p>
                <div class="product-price">
                    ${product.salePrice ? 
                        `<span class="sale-price">$${product.salePrice}</span>
                         <span class="original-price">$${product.price}</span>` :
                        `<span class="price">$${product.price}</span>`
                    }
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" 
                            onclick="productManager.addToCart('${product._id}')"
                            ${!product.inStock ? 'disabled' : ''}>
                        ${product.inStock ? 'Agregar al carrito' : 'Sin stock'}
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    // Añadir producto al carrito
    async addToCart(productId, quantity = 1) {
        if (!authManager.isAuthenticated()) {
            showError('Debes iniciar sesión para agregar productos al carrito');
            return;
        }

        try {
            showLoading('Agregando al carrito...');
            
            const response = await this.apiClient.addToCart(productId, quantity);
            
            if (response && response.success) {
                hideLoading();
                showSuccess('¡Producto agregado al carrito!');
                
                // Actualizar contador del carrito
                this.updateCartCounter();
            } else {
                hideLoading();
                showError(response.message || 'Error al agregar al carrito');
            }
        } catch (error) {
            hideLoading();
            showError('Error de conexión');
        }
    }

    // Actualizar contador del carrito
    async updateCartCounter() {
        try {
            const response = await this.apiClient.getCart();
            if (response && response.success) {
                const totalItems = response.cart.items.reduce((total, item) => total + item.quantity, 0);
                const counter = document.getElementById('cart-counter');
                if (counter) {
                    counter.textContent = totalItems;
                    counter.style.display = totalItems > 0 ? 'block' : 'none';
                }
            }
        } catch (error) {
            console.error('Error updating cart counter:', error);
        }
    }

    // Vista rápida del producto
    async quickView(productId) {
        try {
            showLoading('Cargando detalles...');
            
            const response = await this.apiClient.getProduct(productId);
            
            if (response && response.success) {
                hideLoading();
                this.showProductModal(response.product);
            } else {
                hideLoading();
                showError('Error al cargar los detalles del producto');
            }
        } catch (error) {
            hideLoading();
            showError('Error de conexión');
        }
    }

    // Mostrar modal del producto
    showProductModal(product) {
        // Implementar modal con detalles del producto
        console.log('Showing product modal for:', product);
    }

    // Renderizar paginación
    renderPagination(totalPages, currentPage) {
        const container = document.getElementById('pagination-container');
        if (!container || totalPages <= 1) return;

        let paginationHTML = '<div class="pagination">';
        
        // Botón anterior
        if (currentPage > 1) {
            paginationHTML += `
                <button class="page-btn" onclick="productManager.loadProducts(${currentPage - 1})">
                    ← Anterior
                </button>
            `;
        }

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentPage ? 'active' : '';
            paginationHTML += `
                <button class="page-btn ${isActive}" onclick="productManager.loadProducts(${i})">
                    ${i}
                </button>
            `;
        }

        // Botón siguiente
        if (currentPage < totalPages) {
            paginationHTML += `
                <button class="page-btn" onclick="productManager.loadProducts(${currentPage + 1})">
                    Siguiente →
                </button>
            `;
        }

        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }
}

// Instancia global del manager de productos
const productManager = new ProductManager();
