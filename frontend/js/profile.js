// ===== PROFILE PAGE - INTEGRATED & OPTIMIZED =====
console.log('👤 Profile Page Script Loading...');

class ProfilePage {
    constructor() {
        this.currentUser = null;
        this.isEditing = false;
        this.initialized = false;
        this.logoutInProgress = false;
    }

    // ================================
    // INITIALIZATION
    // ================================

    async initialize() {
        try {
            console.log('🚀 Initializing Profile Page...');
            
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Check if user is logged in
            this.currentUser = auth.getCurrentUser();
            
            if (!this.currentUser) {
                console.log('❌ No user found, redirecting to login...');
                this.redirectToLogin();
                return;
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load profile data
            this.loadProfileData();
            
            // Update counters
            utils.storage.updateCounters();
            
            this.initialized = true;
            console.log('✅ Profile Page initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Profile Page:', error);
            this.showError('Error cargando el perfil');
        }
    }

    async waitForDependencies() {
        let retries = 0;
        const maxRetries = 10;
        
        while ((!window.auth || !window.utils) && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (!window.auth || !window.utils) {
            throw new Error('Required dependencies not available');
        }
    }

    redirectToLogin() {
        utils.notifications.warning('Debes iniciar sesión para ver tu perfil');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }

    // ================================
    // PROFILE DATA MANAGEMENT
    // ================================

    loadProfileData() {
        try {
            console.log('📊 Loading profile data for:', this.currentUser.email);
            
            // Update user info
            this.updateUserInfo();
            
            // Update user stats
            this.updateUserStats();
            
            // Load preferences
            this.loadPreferences();
            
        } catch (error) {
            console.error('❌ Error loading profile data:', error);
        }
    }

    updateUserInfo() {
        // Basic user info
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const displayName = document.getElementById('display-name');
        const displayEmail = document.getElementById('display-email');
        const displayPhone = document.getElementById('display-phone');
        
        if (userName) userName.textContent = this.currentUser.name || this.currentUser.nombre || 'Usuario';
        if (userEmail) userEmail.textContent = this.currentUser.email || 'No registrado';
        if (displayName) displayName.textContent = this.currentUser.name || this.currentUser.nombre || 'No registrado';
        if (displayEmail) displayEmail.textContent = this.currentUser.email || 'No registrado';
        if (displayPhone) displayPhone.textContent = this.currentUser.phone || 'No registrado';
    }

    updateUserStats() {
        try {
            // Get user stats
            const favorites = utils.storage.getFavorites();
            const cart = utils.storage.getCart();
            const orders = this.getUserOrders();
            
            // Update stats display
            const favoritesCount = document.getElementById('user-favorites');
            const cartCount = document.getElementById('user-cart-items');
            const ordersCount = document.getElementById('user-orders');
            
            if (favoritesCount) favoritesCount.textContent = favorites.length;
            if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
            if (ordersCount) ordersCount.textContent = orders.length;
            
        } catch (error) {
            console.error('❌ Error updating user stats:', error);
        }
    }

    getUserOrders() {
        try {
            const historyKey = `order_history_${this.currentUser.email}`;
            const orders = JSON.parse(localStorage.getItem(historyKey) || '[]');
            return orders;
        } catch (error) {
            console.error('Error getting user orders:', error);
            return [];
        }
    }

    loadPreferences() {
        try {
            const prefsKey = `preferences_${this.currentUser.email}`;
            const preferences = JSON.parse(localStorage.getItem(prefsKey) || '{}');
            
            // Set checkbox states
            const emailNotifications = document.getElementById('email-notifications');
            const marketingNotifications = document.getElementById('marketing-notifications');
            
            if (emailNotifications) {
                emailNotifications.checked = preferences.emailNotifications !== false;
            }
            
            if (marketingNotifications) {
                marketingNotifications.checked = preferences.marketingNotifications === true;
            }
            
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }

    // ================================
    // EVENT LISTENERS SETUP
    // ================================

    setupEventListeners() {
        // Edit profile
        this.setupEditProfileListeners();
        
        // Password change
        this.setupPasswordListeners();
        
        // Preferences
        this.setupPreferencesListeners();
        
        // Logout
        this.setupLogoutListeners();
        
        // Modal events
        this.setupModalEvents();
        
        // Storage sync
        this.setupStorageSync();
        
        console.log('✅ Event listeners configured');
    }

    setupEditProfileListeners() {
        const editBtn = document.getElementById('edit-profile-btn');
        const saveBtn = document.getElementById('save-profile-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => this.toggleEditMode(true));
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfileChanges());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.toggleEditMode(false));
        }
    }

    setupPasswordListeners() {
        const changePasswordBtn = document.getElementById('change-password-btn');
        const savePasswordBtn = document.getElementById('save-password');
        const cancelPasswordBtn = document.getElementById('cancel-password');
        
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                utils.showModal('password-modal');
            });
        }
        
        if (savePasswordBtn) {
            savePasswordBtn.addEventListener('click', () => this.changePassword());
        }
        
        if (cancelPasswordBtn) {
            cancelPasswordBtn.addEventListener('click', () => {
                utils.hideModal('password-modal');
                this.clearPasswordForm();
            });
        }
        
        // Password strength indicator
        const newPasswordInput = document.getElementById('new-password');
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }
        
        // Toggle password visibility
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const input = e.target.closest('.password-input').querySelector('input');
                const icon = e.target.querySelector('i') || e.target;
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        });
    }

    setupPreferencesListeners() {
        const emailNotifications = document.getElementById('email-notifications');
        const marketingNotifications = document.getElementById('marketing-notifications');
        
        [emailNotifications, marketingNotifications].forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.savePreferences();
                });
            }
        });
    }

    setupLogoutListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        const confirmLogoutBtn = document.getElementById('confirm-logout');
        const cancelLogoutBtn = document.getElementById('cancel-logout');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                utils.showModal('logout-modal');
            });
        }
        
        if (confirmLogoutBtn) {
            confirmLogoutBtn.addEventListener('click', () => {
                this.performLogout();
            });
        }
        
        if (cancelLogoutBtn) {
            cancelLogoutBtn.addEventListener('click', () => {
                utils.hideModal('logout-modal');
            });
        }
    }

    setupModalEvents() {
        // Close modals on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                utils.modals.hideAll();
            }
        });
    }

    setupStorageSync() {
        // Listen for storage changes (cross-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key && (e.key.includes('cart_') || e.key.includes('favorites_'))) {
                this.updateUserStats();
                utils.storage.updateCounters();
            }
            
            // If user was logged out in another tab
            if (e.key === 'petstyle_user' && !e.newValue) {
                console.log('🔄 User logged out in another tab');
                this.handleRemoteLogout();
            }
        });
    }

    // ================================
    // PROFILE EDITING
    // ================================

    toggleEditMode(editing) {
        this.isEditing = editing;
        
        // Toggle visibility of elements
        const editBtn = document.getElementById('edit-profile-btn');
        const editActions = document.getElementById('edit-actions');
        const displayElements = document.querySelectorAll('#display-name, #display-email, #display-phone');
        const editInputs = document.querySelectorAll('#edit-name, #edit-email, #edit-phone');
        
        if (editing) {
            // Show edit mode
            editBtn.style.display = 'none';
            editActions.classList.remove('hidden');
            
            displayElements.forEach(el => el.style.display = 'none');
            editInputs.forEach(el => {
                el.classList.remove('hidden');
                el.style.display = 'block';
            });
            
            // Populate edit inputs with current values
            const editName = document.getElementById('edit-name');
            const editEmail = document.getElementById('edit-email');
            const editPhone = document.getElementById('edit-phone');
            
            if (editName) editName.value = this.currentUser.name || this.currentUser.nombre || '';
            if (editEmail) editEmail.value = this.currentUser.email || '';
            if (editPhone) editPhone.value = this.currentUser.phone || '';
            
        } else {
            // Show display mode
            editBtn.style.display = 'block';
            editActions.classList.add('hidden');
            
            displayElements.forEach(el => el.style.display = 'block');
            editInputs.forEach(el => {
                el.classList.add('hidden');
                el.style.display = 'none';
            });
        }
    }

    async saveProfileChanges() {
        try {
            utils.showLoading('body', 'Guardando cambios...');
            
            // Get edited values
            const editName = document.getElementById('edit-name');
            const editEmail = document.getElementById('edit-email');
            const editPhone = document.getElementById('edit-phone');
            
            const updatedData = {
                name: editName?.value.trim() || '',
                email: editEmail?.value.trim() || this.currentUser.email,
                phone: editPhone?.value.trim() || ''
            };
            
            // Validate
            if (!updatedData.name) {
                utils.notifications.warning('El nombre es obligatorio');
                return;
            }
            
            if (!this.isValidEmail(updatedData.email)) {
                utils.notifications.warning('Email no válido');
                return;
            }
            
            // Update user object
            this.currentUser.name = updatedData.name;
            this.currentUser.nombre = updatedData.name; // Keep both formats
            this.currentUser.phone = updatedData.phone;
            
            // Save to localStorage
            localStorage.setItem('petstyle_user', JSON.stringify(this.currentUser));
            
            // Update display
            this.updateUserInfo();
            this.toggleEditMode(false);
            
            utils.notifications.success('Perfil actualizado correctamente');
            
            console.log('✅ Profile updated successfully');
            
        } catch (error) {
            console.error('❌ Error saving profile:', error);
            utils.notifications.error('Error al guardar los cambios');
        } finally {
            utils.hideLoading('body');
        }
    }

    // ================================
    // PASSWORD MANAGEMENT
    // ================================

    updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;
        
        let strength = 0;
        let text = 'Muy débil';
        let color = '#ff4444';
        
        if (password.length >= 6) strength += 25;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        
        if (strength >= 75) {
            text = 'Fuerte';
            color = '#4CAF50';
        } else if (strength >= 50) {
            text = 'Media';
            color = '#ff9800';
        } else if (strength >= 25) {
            text = 'Débil';
            color = '#ffeb3b';
        }
        
        strengthBar.style.width = `${strength}%`;
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }

    async changePassword() {
        try {
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate
            if (!currentPassword || !newPassword || !confirmPassword) {
                utils.notifications.warning('Todos los campos son obligatorios');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                utils.notifications.error('Las contraseñas no coinciden');
                return;
            }
            
            if (newPassword.length < 6) {
                utils.notifications.error('La nueva contraseña debe tener al menos 6 caracteres');
                return;
            }
            
            utils.showLoading('body', 'Cambiando contraseña...');
            
            // Here you would normally call your API to change password
            // For now, we'll simulate it
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            utils.notifications.success('Contraseña cambiada correctamente');
            utils.hideModal('password-modal');
            this.clearPasswordForm();
            
        } catch (error) {
            console.error('❌ Error changing password:', error);
            utils.notifications.error('Error al cambiar la contraseña');
        } finally {
            utils.hideLoading('body');
        }
    }

    clearPasswordForm() {
        const inputs = ['current-password', 'new-password', 'confirm-password'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        // Reset strength indicator
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        if (strengthBar) strengthBar.style.width = '0%';
        if (strengthText) strengthText.textContent = 'Ingresa una contraseña';
    }

    // ================================
    // PREFERENCES
    // ================================

    savePreferences() {
        try {
            const emailNotifications = document.getElementById('email-notifications');
            const marketingNotifications = document.getElementById('marketing-notifications');
            
            const preferences = {
                emailNotifications: emailNotifications?.checked || false,
                marketingNotifications: marketingNotifications?.checked || false,
                lastUpdated: new Date().toISOString()
            };
            
            const prefsKey = `preferences_${this.currentUser.email}`;
            localStorage.setItem(prefsKey, JSON.stringify(preferences));
            
            utils.notifications.success('Preferencias guardadas');
            console.log('✅ Preferences saved:', preferences);
            
        } catch (error) {
            console.error('❌ Error saving preferences:', error);
            utils.notifications.error('Error al guardar preferencias');
        }
    }

    // ================================
    // QUICK ACTIONS
    // ================================

    async clearFavorites() {
        try {
            const favorites = utils.storage.getFavorites();
            
            if (favorites.length === 0) {
                utils.notifications.info('No tienes favoritos para limpiar');
                return;
            }
            
            if (confirm(`¿Estás seguro de que deseas eliminar ${favorites.length} favorito(s)?`)) {
                utils.storage.saveFavorites([]);
                this.updateUserStats();
                utils.notifications.success('Favoritos eliminados');
            }
            
        } catch (error) {
            console.error('❌ Error clearing favorites:', error);
            utils.notifications.error('Error al limpiar favoritos');
        }
    }

    async clearCart() {
        try {
            const cart = utils.storage.getCart();
            
            if (cart.length === 0) {
                utils.notifications.info('Tu carrito ya está vacío');
                return;
            }
            
            if (confirm(`¿Estás seguro de que deseas vaciar el carrito con ${cart.length} producto(s)?`)) {
                utils.storage.clearCart();
                this.updateUserStats();
                utils.notifications.success('Carrito vaciado');
            }
            
        } catch (error) {
            console.error('❌ Error clearing cart:', error);
            utils.notifications.error('Error al vaciar carrito');
        }
    }

    // ================================
    // LOGOUT FUNCTIONALITY
    // ================================

    async performLogout() {
        if (this.logoutInProgress) {
            console.log('⚠️ Logout already in progress');
            return;
        }

        try {
            this.logoutInProgress = true;
            
            console.log('🚪 Starting logout process...');
            
            // Close modal immediately
            utils.hideModal('logout-modal');
            
            // Show loading
            utils.showLoading('body', 'Cerrando sesión...');
            
            // Get current user for cleanup
            const userEmail = this.currentUser?.email;
            
            // Step 1: Clear authentication data
            console.log('🧹 Clearing authentication data...');
            localStorage.removeItem('petstyle_user');
            localStorage.removeItem('petstyle_token');
            
            // Step 2: Clear user-specific data
            if (userEmail) {
                console.log('🗑️ Clearing user-specific data for:', userEmail);
                
                const keysToRemove = [
                    `favorites_${userEmail}`,
                    `cart_${userEmail}`,
                    `preferences_${userEmail}`,
                    `order_history_${userEmail}`
                ];
                
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                    console.log(`✅ Removed: ${key}`);
                });
            }
            
            // Step 3: Clear any remaining PetStyle data
            console.log('🧽 Deep cleaning localStorage...');
            const allKeys = Object.keys(localStorage);
            const petStyleKeys = allKeys.filter(key => 
                key.startsWith('petstyle_') || 
                key.startsWith('cart_') || 
                key.startsWith('favorites_') ||
                key.startsWith('preferences_') ||
                key.startsWith('order_history_')
            );
            
            petStyleKeys.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ Deep cleaned: ${key}`);
            });
            
            // Step 4: Clear session storage (if any)
            sessionStorage.clear();
            
            // Step 5: Reset auth system
            if (window.auth) {
                auth.currentUser = null;
                auth.currentToken = null;
            }
            
            // Step 6: Show success message
            utils.notifications.success('Sesión cerrada correctamente');
            
            // Step 7: Simulate logout processing
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('✅ Logout completed successfully');
            console.log('🎯 Redirecting to login page...');
            
            // Step 8: Redirect to login
            window.location.href = 'login.html';
            
        } catch (error) {
            console.error('❌ Error during logout:', error);
            utils.notifications.error('Error al cerrar sesión');
            
            // Force redirect anyway for security
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } finally {
            utils.hideLoading('body');
            this.logoutInProgress = false;
        }
    }

    handleRemoteLogout() {
        // Handle logout from another tab
        console.log('🔄 Handling remote logout...');
        utils.notifications.info('Sesión cerrada en otra pestaña');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }

    // ================================
    // UTILITY METHODS
    // ================================

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(message) {
        const container = document.querySelector('.main-content .container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Error al cargar el perfil</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Recargar página
                    </button>
                </div>
            `;
        }
    }
}

// ================================
// INITIALIZATION & GLOBAL EXPORT
// ================================

let profilePage;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('👤 DOM loaded, initializing Profile Page...');
    
    profilePage = new ProfilePage();
    await profilePage.initialize();
    
    // Export for debugging
    if (window.location.hostname === 'localhost') {
        window.profilePage = profilePage;
    }
});

// Export for global access
window.profilePage = profilePage;

console.log('✅ Profile Page Script loaded successfully');