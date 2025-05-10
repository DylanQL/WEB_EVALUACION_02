// Authentication related functions
document.addEventListener('DOMContentLoaded', () => {
    // Setup login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup registration form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    
    // Basic form validation
    if (!username || !password) {
        showError(errorElement, 'Por favor, complete todos los campos requeridos');
        return;
    }
    
    try {
        // Send login request to API
        const response = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión');
        }
        
        // Store token and user info in localStorage
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify({
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role
        }));
        
        // Redirect to home page
        window.location.href = '/';
        
    } catch (error) {
        showError(errorElement, error.message);
    }
}

// Handle registration form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const role = document.getElementById('role').value;
    const errorElement = document.getElementById('register-error');
    
    // Basic form validation
    if (!username || !email || !password || !confirmPassword) {
        showError(errorElement, 'Por favor, complete todos los campos requeridos');
        return;
    }
    
    if (password !== confirmPassword) {
        showError(errorElement, 'Las contraseñas no coinciden');
        return;
    }
    
    if (!validateEmail(email)) {
        showError(errorElement, 'Por favor, ingrese un correo electrónico válido');
        return;
    }
    
    try {
        // Send registration request to API
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, role })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al registrar usuario');
        }
        
        // Show success and redirect to login page
        alert('Usuario registrado exitosamente. Por favor inicie sesión');
        window.location.href = '/views/login.html';
        
    } catch (error) {
        showError(errorElement, error.message);
    }
}

// Helper function to show error messages
function showError(element, message) {
    element.textContent = message;
    element.classList.remove('d-none');
    setTimeout(() => {
        element.classList.add('d-none');
    }, 5000);
}

// Helper function to validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
