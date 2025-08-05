// Global variables
let userToken = null;
let userData = {
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    avatar: '👤',
    pets: [],
    addresses: [],
    paymentMethods: [],
    orders: [],
    settings: {
        notifications: true,
        darkMode: false,
        language: 'es',
        currency: 'USD'
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadUserData();
    updateCartBadge();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuthStatus() {
    // Check for auth token from localStorage or from URL params (after login redirect)
    userToken = getUserToken();
    
    if (userToken) {
        showAuthenticatedView();
    } else {
        showGuestView();
    }
}

// Get user token from storage
function getUserToken() {
    // Try to get token from localStorage (real implementation)
    if (typeof(Storage) !== "undefined") {
        const token = localStorage.getItem('petStyle_authToken');
        if (token) {
            return token;
        }
    }
    
    // Check URL parameters for token (in case of redirect from login)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
        // Save token to localStorage and clean URL
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem('petStyle_authToken', urlToken);
        }
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return urlToken;
    }
    
    return null;
}

// Save user token
function saveUserToken(token) {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('petStyle_authToken', token);
    }
}

// Remove user token
function removeUserToken() {
    if (typeof(Storage) !== "undefined") {
        localStorage.removeItem('petStyle_authToken');
        localStorage.removeItem('petStyle_userData');
    }
}

// Load user data
function loadUserData() {
    if (typeof(Storage) !== "undefined") {
        const storedData = localStorage.getItem('petStyle_userData');
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                userData = { ...userData, ...parsedData };
                updateUserInterface();
            } catch (e) {
                console.error('Error parsing stored user data:', e);
            }
        }
    }
}

// Save user data
function saveUserData() {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('petStyle_userData', JSON.stringify(userData));
    }
}

// Show authenticated user view
function showAuthenticatedView() {
    // Hide guest elements
    document.getElementById('loginCTA').classList.add('hidden');
    
    // Show authenticated elements
    document.getElementById('userStats').classList.remove('hidden');
    document.getElementById('petProfile').classList.remove('hidden');
    document.getElementById('accountSection').classList.remove('hidden');
    document.getElementById('logoutSection').classList.remove('hidden');
    document.getElementById('cameraBtn').style.display = 'flex';
    
    // Load user profile from backend (simulated)
    loadUserProfile();
    
    updateUserStats();
    renderPets();
}

// Show guest view
function showGuestView() {
    // Show guest elements
    document.getElementById('loginCTA').classList.remove('hidden');
    
    // Hide authenticated elements
    document.getElementById('userStats').classList.add('hidden');
    document.getElementById('petProfile').classList.add('hidden');
    document.getElementById('accountSection').classList.add('hidden');
    document.getElementById('logoutSection').classList.add('hidden');
    document.getElementById('cameraBtn').style.display = 'none';
    
    // Reset profile info
    document.getElementById('profileName').textContent = 'Invitado';
    document.getElementById('profileEmail').textContent = 'Inicia sesión para personalizar tu experiencia';
    document.getElementById('profileAvatar').innerHTML = '👤<div class="camera-btn" onclick="changeAvatar()" style="display: none;" id="cameraBtn">📷</div>';
}

// Load user profile from backend (placeholder for real implementation)
async function loadUserProfile() {
    try {
        // This would be a real API call to your backend
        // const response = await fetch('/api/user/profile', {
        //     headers: {
        //         'Authorization': `Bearer ${userToken}`
        //     }
        // });
        // const profileData = await response.json();
        
        // For demo purposes, simulate loading user data
        if (!userData.name) {
            userData.name = 'María González';
            userData.email = 'maria@petstyle.com';
            userData.phone = '+52 123 456 7890';
            saveUserData();
        }
        
        // Update UI with loaded data
        document.getElementById('profileName').textContent = userData.name;
        document.getElementById('profileEmail').textContent = userData.email;
        updateUserInterface();
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        showToast('Error al cargar el perfil');
    }
}

// Update user interface
function updateUserInterface() {
    if (userData.avatar) {
        document.getElementById('profileAvatar').innerHTML = `${userData.avatar}<div class="camera-btn" onclick="changeAvatar()" id="cameraBtn">📷</div>`;
    }
}

// Update user stats
function updateUserStats() {
    document.getElementById('ordersCount').textContent = userData.orders.length || Math.floor(Math.random() * 20 + 5);
    
    // Get favorites from localStorage if available
    let favoritesCount = 0;
    if (typeof(Storage) !== "undefined") {
        const favorites = localStorage.getItem('petStyle_favorites');
        if (favorites) {
            try {
                favoritesCount = JSON.parse(favorites).length;
            } catch (e) {
                favoritesCount = Math.floor(Math.random() * 15 + 3);
            }
        } else {
            favoritesCount = Math.floor(Math.random() * 15 + 3);
        }
    }
    
    document.getElementById('favoritesCount').textContent = favoritesCount;
    document.getElementById('reviewsCount').textContent = Math.floor(Math.random() * 25 + 8);
}

// Setup event listeners
function setupEventListeners() {
    // Settings toggles
    document.getElementById('notificationsToggle').addEventListener('change', function() {
        userData.settings.notifications = this.checked;
        saveUserData();
        showToast(this.checked ? 'Notificaciones activadas' : 'Notificaciones desactivadas');
    });

    document.getElementById('darkModeToggle').addEventListener('change', function() {
        userData.settings.darkMode = this.checked;
        saveUserData();
        toggleDarkMode(this.checked);
        showToast(this.checked ? 'Modo oscuro activado' : 'Modo oscuro desactivado');
    });

    // Form submissions
    document.getElementById('editProfileForm').addEventListener('submit', handleEditProfile);
    document.getElementById('addPetForm').addEventListener('submit', handleAddPet);
    document.getElementById('addAddressForm').addEventListener('submit', handleAddAddress);
    document.getElementById('addPaymentForm').addEventListener('submit', handleAddPayment);

    // Modal click outside to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Load settings from stored data
    if (userData.settings) {
        document.getElementById('notificationsToggle').checked = userData.settings.notifications;
        document.getElementById('darkModeToggle').checked = userData.settings.darkMode;
        if (userData.settings.darkMode) {
            toggleDarkMode(true);
        }
    }
}

// Modal functions
function openEditProfileModal() {
    if (!userToken) {
        showToast('Debes iniciar sesión para acceder a esta función');
        return;
    }
    
    document.getElementById('editName').value = userData.name || '';
    document.getElementById('editEmail').value = userData.email || '';
    document.getElementById('editPhone').value = userData.phone || '';
    document.getElementById('editBirthdate').value = userData.birthdate || '';
    
    document.getElementById('editProfileModal').classList.add('active');
}

function openAddPetModal() {
    if (!userToken) {
        showToast('Debes iniciar sesión para acceder a esta función');
        return;
    }
    document.getElementById('addPetModal').classList.add('active');
}

function openAddressModal() {
    if (!userToken) {
        showToast('Debes iniciar sesión para acceder a esta función');
        return;
    }
    renderAddresses();
    document.getElementById('addressModal').classList.add('active');
}

function openAddAddressModal() {
    document.getElementById('addAddressModal').classList.add('active');
}

function openPaymentModal() {
    if (!userToken) {
        showToast('Debes iniciar sesión para acceder a esta función');
        return;
    }
    renderPaymentMethods();
    document.getElementById('paymentModal').classList.add('active');
}

function openAddPaymentModal() {
    document.getElementById('addPaymentModal').classList.add('active');
}

function openLanguageModal() {
    document.getElementById('languageModal').classList.add('active');
}

function openCurrencyModal() {
    document.getElementById('currencyModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Form handlers
function handleEditProfile(e) {
    e.preventDefault();
    
    userData.name = document.getElementById('editName').value;
    userData.email = document.getElementById('editEmail').value;
    userData.phone = document.getElementById('editPhone').value;
    userData.birthdate = document.getElementById('editBirthdate').value;
    
    saveUserData();
    updateUserInterface();
    
    document.getElementById('profileName').textContent = userData.name;
    document.getElementById('profileEmail').textContent = userData.email;
    
    closeModal('editProfileModal');
    showToast('Perfil actualizado correctamente');
    
    // Here you would send the data to your backend
    // updateProfileOnBackend(userData);
}

function handleAddPet(e) {
    e.preventDefault();
    
    const petData = {
        id: Date.now(),
        name: document.getElementById('petName').value,
        type: document.getElementById('petType').value,
        breed: document.getElementById('petBreed').value,
        age: document.getElementById('petAge').value,
        weight: document.getElementById('petWeight').value,
        notes: document.getElementById('petNotes').value
    };
    
    userData.pets.push(petData);
    saveUserData();
    renderPets();
    
    document.getElementById('addPetForm').reset();
    closeModal('addPetModal');
    showToast(`¡${petData.name} agregado a tu perfil!`);
    
    // Here you would send the pet data to your backend
    // addPetToBackend(petData);
}

function handleAddAddress(e) {
    e.preventDefault();
    
    const addressData = {
        id: Date.now(),
        label: document.getElementById('addressLabel').value,
        recipientName: document.getElementById('recipientName').value,
        street: document.getElementById('addressStreet').value,
        city: document.getElementById('addressCity').value,
        zip: document.getElementById('addressZip').value,
        phone: document.getElementById('addressPhone').value
    };
    
    userData.addresses.push(addressData);
    saveUserData();
    renderAddresses();
    
    document.getElementById('addAddressForm').reset();
    closeModal('addAddressModal');
    showToast('Dirección agregada correctamente');
    
    // Here you would send the address data to your backend
    // addAddressToBackend(addressData);
}

function handleAddPayment(e) {
    e.preventDefault();
    
    const cardNumber = document.getElementById('cardNumber').value;
    const paymentData = {
        id: Date.now(),
        number: '**** **** **** ' + cardNumber.slice(-4),
        name: document.getElementById('cardName').value,
        expiry: document.getElementById('cardExpiry').value,
        type: getCardType(cardNumber)
    };
    
    userData.paymentMethods.push(paymentData);
    saveUserData();
    renderPaymentMethods();
    
    document.getElementById('addPaymentForm').reset();
    closeModal('addPaymentModal');
    showToast('Tarjeta agregada correctamente');
    
    // Here you would send the payment data to your backend (securely)
    // addPaymentMethodToBackend(paymentData);
}

// Render functions
function renderPets() {
    const petGrid = document.getElementById('petGrid');
    const addPetButton = petGrid.querySelector('.add-pet');
    
    // Clear existing pets (except add button)
    petGrid.innerHTML = '';
    petGrid.appendChild(addPetButton);
    
    userData.pets.forEach(pet => {
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';
        petCard.onclick = () => editPet(pet.id);
        
        const emoji = getPetEmoji(pet.type);
        
        petCard.innerHTML = `
            <div class="pet-avatar">${emoji}</div>
            <div style="font-weight: 600;">${pet.name}</div>
            <div style="font-size: 12px; opacity: 0.8;">${pet.breed || pet.type}</div>
        `;
        
        petGrid.insertBefore(petCard, addPetButton);
    });
}

function renderAddresses() {
    const addressList = document.getElementById('addressList');
    const addButton = addressList.querySelector('.menu-item');
    
    // Clear existing addresses (except add button)
    addressList.innerHTML = '';
    addressList.appendChild(addButton);
    
    userData.addresses.forEach(address => {
        const addressItem = document.createElement('div');
        addressItem.className = 'menu-item';
        addressItem.onclick = () => editAddress(address.id);
        
        const labelEmoji = address.label === 'home' ? '🏠' : address.label === 'work' ? '🏢' : '📍';
        
        addressItem.innerHTML = `
            <div class="menu-icon">${labelEmoji}</div>
            <div class="menu-content">
                <div class="menu-title">${address.recipientName}</div>
                <div class="menu-subtitle">${address.street}, ${address.city}</div>
            </div>
            <div class="menu-arrow">›</div>
        `;
        
        addressList.appendChild(addressItem);
    });
}

function renderPaymentMethods() {
    const paymentList = document.getElementById('paymentList');
    const addButton = paymentList.querySelector('.menu-item');
    
    // Clear existing payments (except add button)
    paymentList.innerHTML = '';
    paymentList.appendChild(addButton);
    
    userData.paymentMethods.forEach(payment => {
        const paymentItem = document.createElement('div');
        paymentItem.className = 'menu-item';
        paymentItem.onclick = () => editPayment(payment.id);
        
        paymentItem.innerHTML = `
            <div class="menu-icon">💳</div>
            <div class="menu-content">
                <div class="menu-title">${payment.type} ${payment.number}</div>
                <div class="menu-subtitle">${payment.name} • Exp. ${payment.expiry}</div>
            </div>
            <div class="menu-arrow">›</div>
        `;
        
        paymentList.appendChild(paymentItem);
    });
}

// Utility functions
function getPetEmoji(type) {
    const emojis = {
        dog: '🐕',
        cat: '🐱',
        bird: '🐦',
        rabbit: '🐰',
        hamster: '🐹',
        fish: '🐠',
        other: '🐾'
    };
    return emojis[type] || '🐾';
}

function getCardType(number) {
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'Amex';
    return 'Tarjeta';
}

// Settings functions
function changeLanguage(lang) {
    userData.settings.language = lang;
    saveUserData();
    
    // Update UI to show selected language
    document.querySelectorAll('[id^="lang-"]').forEach(el => el.textContent = '');
    document.getElementById(`lang-${lang}`).textContent = '✓';
    
    // Update language display
    const languages = { es: 'Español', en: 'English', pt: 'Português' };
    document.querySelector('[onclick="openLanguageModal()"] .menu-subtitle').textContent = languages[lang];
    
    closeModal('languageModal');
    showToast(`Idioma cambiado a ${languages[lang]}`);
}

function changeCurrency(currency) {
    userData.settings.currency = currency;
    saveUserData();
    
    // Update UI to show selected currency
    document.querySelectorAll('[id^="curr-"]').forEach(el => el.textContent = '');
    document.getElementById(`curr-${currency}`).textContent = '✓';
    
    // Update currency display
    const currencies = { 
        USD: 'USD - Dólar Americano', 
        MXN: 'MXN - Peso Mexicano', 
        EUR: 'EUR - Euro' 
    };
    document.querySelector('[onclick="openCurrencyModal()"] .menu-subtitle').textContent = currencies[currency];
    
    closeModal('currencyModal');
    showToast(`Moneda cambiada a ${currency}`);
}

function toggleDarkMode(enabled) {
    if (enabled) {
        document.body.style.filter = 'invert(1) hue-rotate(180deg)';
        document.querySelectorAll('img').forEach(img => {
            img.style.filter = 'invert(1) hue-rotate(180deg)';
        });
    } else {
        document.body.style.filter = '';
        document.querySelectorAll('img').forEach(img => {
            img.style.filter = '';
        });
    }
}

// Avatar functions
function changeAvatar() {
    if (!userToken) {
        showToast('Debes iniciar sesión para cambiar tu avatar');
        return;
    }
    
    const avatars = ['👤', '👨', '👩', '🧑', '👦', '👧', '🐶', '🐱', '🐰', '🦊'];
    const currentIndex = avatars.indexOf(userData.avatar);
    const nextIndex = (currentIndex + 1) % avatars.length;
    
    userData.avatar = avatars[nextIndex];
    saveUserData();
    updateUserInterface();
    showToast('Avatar actualizado');
}

// Action functions
function editPet(petId) {
    // Implementation for editing pet
    showToast('Función de edición próximamente');
}

function editAddress(addressId) {
    // Implementation for editing address
    showToast('Función de edición próximamente');
}

function editPayment(paymentId) {
    // Implementation for editing payment
    showToast('Función de edición próximamente');
}

function showOrderHistory() {
    showToast('Historial de pedidos próximamente');
}

function openHelpCenter() {
    showToast('Centro de ayuda próximamente');
}

function contactSupport() {
    showToast('Contactando soporte...');
}

function showAbout() {
    showToast('PetStyle v2.1.0 - Hecho con ❤️ para las mascotas');
}

// Auth functions
function logout() {
    userToken = null;
    userData = {
        name: '',
        email: '',
        phone: '',
        birthdate: '',
        avatar: '👤',
        pets: [],
        addresses: [],
        paymentMethods: [],
        orders: [],
        settings: {
            notifications: true,
            darkMode: false,
            language: 'es',
            currency: 'USD'
        }
    };
    
    // Clear stored data
    removeUserToken();
    
    showGuestView();
    showToast('Sesión cerrada correctamente');
}

// Navigation functions
function navigateTo(page) {
    // Simple navigation - in a real app you might use a router
    window.location.href = page;
}

// Cart functions
function updateCartBadge() {
    let cartCount = 0;
    if (typeof(Storage) !== "undefined") {
        const cart = localStorage.getItem('petStyle_cart');
        if (cart) {
            try {
                cartCount = JSON.parse(cart).length;
            } catch (e) {
                cartCount = 0;
            }
        }
    }
    document.getElementById('cartBadge').textContent = cartCount;
}

// Toast notification
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
        max-width: 300px;
        text-align: center;
        box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 2500);
}

// API integration placeholders (for when you connect to backend)

// Login with backend
async function loginWithBackend(credentials) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        
        if (response.ok) {
            const data = await response.json();
            userToken = data.token;
            saveUserToken(userToken);
            showAuthenticatedView();
            return true;
        } else {
            throw new Error('Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Error al iniciar sesión');
        return false;
    }
}

// Update profile on backend
async function updateProfileOnBackend(profileData) {
    try {
        const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(profileData)
        });
        
        if (!response.ok) {
            throw new Error('Profile update failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Profile update error:', error);
        showToast('Error al actualizar perfil');
    }
}

// Add pet to backend
async function addPetToBackend(petData) {
    try {
        const response = await fetch('/api/user/pets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(petData)
        });
        
        if (!response.ok) {
            throw new Error('Add pet failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Add pet error:', error);
        showToast('Error al agregar mascota');
    }
}

// Add address to backend
async function addAddressToBackend(addressData) {
    try {
        const response = await fetch('/api/user/addresses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(addressData)
        });
        
        if (!response.ok) {
            throw new Error('Add address failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Add address error:', error);
        showToast('Error al agregar dirección');
    }
}

// Add payment method to backend
async function addPaymentMethodToBackend(paymentData) {
    try {
        // Note: In a real implementation, you should never send full card details to your backend
        // Use a secure payment processor like Stripe, PayPal, etc.
        const response = await fetch('/api/user/payment-methods', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                // Only send secure/tokenized payment info
                cardToken: paymentData.token, // Token from payment processor
                lastFour: paymentData.number.slice(-4),
                type: paymentData.type,
                expiry: paymentData.expiry
            })
        });
        
        if (!response.ok) {
            throw new Error('Add payment method failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Add payment method error:', error);
        showToast('Error al agregar método de pago');
    }
}

// Validate token with backend
async function validateTokenWithBackend(token) {
    try {
        const response = await fetch('/api/auth/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        return response.ok;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

// Auto-refresh token functionality
function setupTokenRefresh() {
    if (userToken) {
        // Refresh token every 50 minutes (if your tokens expire in 1 hour)
        setInterval(async () => {
            try {
                const response = await fetch('/api/auth/refresh', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    userToken = data.token;
                    saveUserToken(userToken);
                } else {
                    // Token refresh failed, logout user
                    logout();
                }
            } catch (error) {
                console.error('Token refresh error:', error);
            }
        }, 50 * 60 * 1000); // 50 minutes
    }
}

// Initialize token refresh when user is authenticated
if (userToken) {
    setupTokenRefresh();
}