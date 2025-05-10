// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    setupNavigation(token, user);
    checkRedirects(token);
});

// Setup navigation based on authentication status and user role
function setupNavigation(token, user) {
    const navMenu = document.getElementById('nav-menu');
    const loginSignupContainer = document.getElementById('login-signup-container');
    
    if (!navMenu || !loginSignupContainer) return;
    
    // Clear existing items
    navMenu.innerHTML = '';
    loginSignupContainer.innerHTML = '';
    
    if (token && user) {
        // User is logged in - show appropriate menu items based on role
        
        // Common menu items for all roles
        navMenu.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="/views/tipo-medic.html">Tipos de Medicamentos</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/views/medicamentos.html">Medicamentos</a>
            </li>
        `;
        
        // Add logout button
        loginSignupContainer.innerHTML = `
            <span class="nav-link text-light">Bienvenido, ${user.username} (${user.role})</span>
            <button class="btn btn-outline-light ms-2" id="logout-btn">Cerrar Sesión</button>
        `;
        
        // Add logout event listener
        document.getElementById('logout-btn').addEventListener('click', logout);
    } else {
        // User is not logged in
        loginSignupContainer.innerHTML = `
            <a class="nav-link" href="/views/login.html">Iniciar Sesión</a>
            <a class="nav-link" href="/views/register.html">Registrarse</a>
        `;
    }
}

// Check if user should be redirected based on authentication status
function checkRedirects(token) {
    const currentPath = window.location.pathname;
    
    // Protected routes that require authentication
    const protectedRoutes = [
        '/views/tipo-medic.html',
        '/views/medicamentos.html'
    ];
    
    // Routes accessible only when not logged in
    const authRoutes = [
        '/views/login.html',
        '/views/register.html'
    ];
    
    // Redirect logic
    if (protectedRoutes.includes(currentPath) && !token) {
        // User is not authenticated but trying to access protected route
        window.location.href = '/views/login.html';
    } else if (authRoutes.includes(currentPath) && token) {
        // User is already authenticated but trying to access login/register
        window.location.href = '/views/tipo-medic.html';
    }
    
    // Update welcome message on home page
    updateWelcomeMessage(token);
}

// Update welcome message on home page
function updateWelcomeMessage(token) {
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        if (token) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            welcomeMessage.innerHTML = `
                <h1>Bienvenido al Sistema de Gestión de Farmacia</h1>
                <p class="lead">Hola, ${user.username}! Has iniciado sesión como ${user.role}</p>
                <div class="mt-4">
                    <p>Selecciona una opción del menú para comenzar.</p>
                </div>
            `;
        }
    }
}

// Logout function
function logout() {
    const token = localStorage.getItem('token');
    
    // Call the backend to logout (optional since JWT is stateless)
    fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    })
    .finally(() => {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/views/login.html';
    });
}

// Helper function to format dates for display
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}
