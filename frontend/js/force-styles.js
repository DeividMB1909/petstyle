// ===== FORZAR ESTILOS DIRECTAMENTE ===== 

// Función para aplicar estilos forzados
function forceStyles() {
    console.log('🎨 Forzando estilos...');
    
    // Agregar CSS inline forzado
    const forceStylesCSS = `
        <style id="force-main-styles">
        /* FORZAR GRID */
        .products-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        
        /* FORZAR CARDS */
        .product-card {
            background: white !important;
            border-radius: 8px !important;
            padding: 6px !important;
            height: 220px !important;
            margin: 0 !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1) !important;
        }
        
        /* FORZAR IMAGEN */
        .product-image {
            height: 110px !important;
            border-radius: 5px !important;
            overflow: hidden !important;
            margin-bottom: 5px !important;
        }
        
        .product-image img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
        }
        
        /* FORZAR BOTÓN FAVORITOS */
        .favorite-btn {
            position: absolute !important;
            top: 3px !important;
            right: 3px !important;
            width: 22px !important;
            height: 22px !important;
            border-radius: 50% !important;
            background: rgba(255,255,255,0.95) !important;
            border: none !important;
            font-size: 9px !important;
        }
        
        /* FORZAR INFO */
        .product-name {
            font-size: 10px !important;
            line-height: 1.2 !important;
            margin-bottom: 2px !important;
        }
        
        .product-description {
            font-size: 8px !important;
            color: #666 !important;
            margin-bottom: 3px !important;
        }
        
        .product-price {
            font-size: 11px !important;
            font-weight: bold !important;
        }
        
        .add-to-cart-btn {
            font-size: 8px !important;
            padding: 2px 5px !important;
            border-radius: 3px !important;
        }
        
        /* FORZAR BOTTOM NAV - IGUAL AL PERFIL */
        .bottom-nav {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background: rgba(255,255,255,0.95) !important;
            height: 55px !important;
            display: flex !important;
            justify-content: space-around !important;
            align-items: center !important;
            padding: 6px 0 !important;
            z-index: 200 !important;
            box-shadow: 0 -2px 8px rgba(0,0,0,0.1) !important;
        }
        
        .nav-item {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-decoration: none !important;
            color: #666 !important;
            font-size: 9px !important;
            padding: 3px 6px !important;
            flex: 1 !important;
            max-width: 70px !important;
        }
        
        .nav-item i {
            font-size: 15px !important;
            margin-bottom: 1px !important;
        }
        
        .nav-item.active {
            color: #667eea !important;
        }
        
        .notification-badge {
            position: absolute !important;
            top: -2px !important;
            right: 2px !important;
            background: #e74c3c !important;
            color: white !important;
            border-radius: 50% !important;
            width: 12px !important;
            height: 12px !important;
            font-size: 7px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        
        .notification-badge.show {
            transform: scale(1) !important;
        }
        
        /* FORZAR HEADER */
        .header {
            padding: 8px 16px !important;
            background: rgba(255,255,255,0.95) !important;
        }
        
        .search-bar input {
            padding: 10px 36px 10px 14px !important;
            border-radius: 14px !important;
            font-size: 14px !important;
        }
        
        /* FORZAR CATEGORÍAS */
        .categories-scroll {
            gap: 8px !important;
        }
        
        .category-item {
            padding: 8px 10px !important;
            min-width: 60px !important;
            border-radius: 8px !important;
        }
        
        .category-icon {
            font-size: 16px !important;
        }
        
        .category-item span {
            font-size: 9px !important;
        }
        
        /* FORZAR ESPACIADO */
        .main-container {
            padding-bottom: 70px !important;
        }
        
        .bottom-spacer {
            height: 55px !important;
        }
        
        /* RESPONSIVE FORZADO */
        @media (min-width: 480px) {
            .products-grid {
                grid-template-columns: repeat(3, 1fr) !important;
            }
        }
        
        @media (min-width: 768px) {
            .products-grid {
                grid-template-columns: repeat(4, 1fr) !important;
            }
        }
        </style>
    `;
    
    // Remover estilos anteriores si existen
    const existingForceStyles = document.getElementById('force-main-styles');
    if (existingForceStyles) {
        existingForceStyles.remove();
    }
    
    // Agregar los nuevos estilos al head
    document.head.insertAdjacentHTML('beforeend', forceStylesCSS);
    
    console.log('✅ Estilos forzados aplicados');
}

// Función para redimensionar cards manualmente
function forceCardLayout() {
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        // Forzar el grid
        productsGrid.style.cssText = `
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        `;
        
        // Forzar cada card
        const cards = productsGrid.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.style.cssText = `
                background: white !important;
                border-radius: 8px !important;
                padding: 6px !important;
                height: 220px !important;
                margin: 0 !important;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1) !important;
                display: flex !important;
                flex-direction: column !important;
                position: relative !important;
                width: 100% !important;
            `;
            
            // Forzar imagen
            const img = card.querySelector('.product-image');
            if (img) {
                img.style.cssText = `
                    height: 110px !important;
                    border-radius: 5px !important;
                    overflow: hidden !important;
                    margin-bottom: 5px !important;
                    position: relative !important;
                    width: 100% !important;
                `;
                
                const imgTag = img.querySelector('img');
                if (imgTag) {
                    imgTag.style.cssText = `
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: cover !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    `;
                }
            }
            
            // Forzar botón favoritos
            const favBtn = card.querySelector('.favorite-btn');
            if (favBtn) {
                favBtn.style.cssText = `
                    position: absolute !important;
                    top: 3px !important;
                    right: 3px !important;
                    width: 22px !important;
                    height: 22px !important;
                    border-radius: 50% !important;
                    background: rgba(255,255,255,0.95) !important;
                    border: none !important;
                    font-size: 9px !important;
                    z-index: 5 !important;
                `;
            }
            
            // Forzar info del producto
            const productName = card.querySelector('.product-name');
            if (productName) {
                productName.style.cssText = `
                    font-size: 10px !important;
                    line-height: 1.2 !important;
                    margin-bottom: 2px !important;
                    font-weight: 600 !important;
                    color: #333 !important;
                `;
            }
            
            const productDesc = card.querySelector('.product-description');
            if (productDesc) {
                productDesc.style.cssText = `
                    font-size: 8px !important;
                    color: #666 !important;
                    margin-bottom: 3px !important;
                    line-height: 1.2 !important;
                `;
            }
            
            const productPrice = card.querySelector('.product-price');
            if (productPrice) {
                productPrice.style.cssText = `
                    font-size: 11px !important;
                    font-weight: bold !important;
                    color: #333 !important;
                `;
            }
            
            const addBtn = card.querySelector('.add-to-cart-btn');
            if (addBtn) {
                addBtn.style.cssText = `
                    font-size: 8px !important;
                    padding: 2px 5px !important;
                    border-radius: 3px !important;
                    background: #667eea !important;
                    color: white !important;
                    border: none !important;
                `;
            }
        });
        
        console.log('✅ Layout de cards forzado');
    }
}

// Función para forzar bottom nav
function forceBottomNav() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.cssText = `
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background: rgba(255,255,255,0.95) !important;
            height: 55px !important;
            display: flex !important;
            justify-content: space-around !important;
            align-items: center !important;
            padding: 6px 0 !important;
            z-index: 200 !important;
            box-shadow: 0 -2px 8px rgba(0,0,0,0.1) !important;
            margin: 0 !important;
        `;
        
        const navItems = bottomNav.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.style.cssText = `
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                text-decoration: none !important;
                color: #666 !important;
                font-size: 9px !important;
                padding: 3px 6px !important;
                flex: 1 !important;
                max-width: 70px !important;
                margin: 0 !important;
                position: relative !important;
            `;
            
            const icon = item.querySelector('i');
            if (icon) {
                icon.style.cssText = `
                    font-size: 15px !important;
                    margin-bottom: 1px !important;
                    display: block !important;
                `;
            }
            
            if (item.classList.contains('active')) {
                item.style.color = '#667eea !important';
            }
        });
        
        // Forzar badges
        const badges = bottomNav.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            badge.style.cssText = `
                position: absolute !important;
                top: -2px !important;
                right: 2px !important;
                background: #e74c3c !important;
                color: white !important;
                border-radius: 50% !important;
                width: 12px !important;
                height: 12px !important;
                font-size: 7px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 !important;
                padding: 0 !important;
            `;
        });
        
        console.log('✅ Bottom nav forzado');
    }
}

// Función para forzar header y búsqueda
function forceHeaderAndSearch() {
    const header = document.querySelector('.header');
    if (header) {
        header.style.cssText = `
            padding: 8px 16px !important;
            background: rgba(255,255,255,0.95) !important;
            backdrop-filter: blur(10px) !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 100 !important;
        `;
    }
    
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.style.cssText = `
            padding: 10px 36px 10px 14px !important;
            border-radius: 14px !important;
            font-size: 14px !important;
            width: 100% !important;
            border: none !important;
            background: rgba(255,255,255,0.9) !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1) !important;
        `;
    }
    
    console.log('✅ Header y búsqueda forzados');
}

// Función principal que ejecuta todo
function forceAllStyles() {
    console.log('🚀 Iniciando forzado completo de estilos...');
    
    // Aplicar CSS inline
    forceStyles();
    
    // Esperar un poco y forzar layout
    setTimeout(() => {
        forceCardLayout();
        forceBottomNav(); 
        forceHeaderAndSearch();
    }, 100);
    
    // Repetir después de que se carguen los productos
    setTimeout(() => {
        forceCardLayout();
        console.log('🔄 Re-forzando estilos después de carga');
    }, 1000);
    
    // Observar cambios en el DOM y re-aplicar
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Si se agregan nuevos productos, forzar estilos
                setTimeout(() => {
                    forceCardLayout();
                }, 50);
            }
        });
    });
    
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        observer.observe(productsGrid, { childList: true, subtree: true });
    }
    
    console.log('✅ Forzado completo aplicado');
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceAllStyles);
} else {
    forceAllStyles();
}

// Ejecutar también cuando la página esté completamente cargada
window.addEventListener('load', () => {
    setTimeout(forceAllStyles, 500);
});

// Función global para ejecutar desde consola
window.forceStyles = forceAllStyles;

console.log('📱 Force styles script cargado - usa forceStyles() para aplicar manualmente');