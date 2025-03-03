const API_URL = 'http://localhost:3000/api';
const AUTH_KEY = 'solid_car_auth';

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem(AUTH_KEY) !== null;
}

// Login function
async function login(email, password, remember = false) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        localStorage.setItem(AUTH_KEY, JSON.stringify({
            user: data.data.user,
            token: data.data.token,
            remember
        }));

        if (remember) {
            localStorage.setItem('userEmail', email);
        }

        return true;
    } catch (error) {
        console.error('Login error:', error);
        showAlert(error.message, 'danger');
        return false;
    }
}

// Register function
async function register(userData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        localStorage.setItem(AUTH_KEY, JSON.stringify({
            user: data.data.user,
            token: data.data.token,
            remember: false
        }));

        return true;
    } catch (error) {
        console.error('Registration error:', error);
        showAlert(error.message, 'danger');
        return false;
    }
}

// Logout function
function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
}

// Get current user
function getCurrentUser() {
    const auth = localStorage.getItem(AUTH_KEY);
    return auth ? JSON.parse(auth).user : null;
}

// Get auth token
function getAuthToken() {
    const auth = localStorage.getItem(AUTH_KEY);
    return auth ? JSON.parse(auth).token : null;
}

// Authentication check for protected pages
function checkAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', () => {
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const spinner = submitBtn.querySelector('.spinner-border');
            
            try {
                spinner.classList.remove('d-none');
                submitBtn.disabled = true;

                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const remember = document.getElementById('remember').checked;
                
                if (await login(email, password, remember)) {
                    showAlert('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'cars.html';
                    }, 1500);
                }
            } catch (error) {
                console.error('Login error:', error);
                showAlert(error.message, 'danger');
            } finally {
                spinner.classList.add('d-none');
                submitBtn.disabled = false;
            }
        });
    }

    // Handle registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const spinner = submitBtn.querySelector('.spinner-border');
            
            try {
                spinner.classList.remove('d-none');
                submitBtn.disabled = true;

                const terms = document.getElementById('terms').checked;
                if (!terms) {
                    throw new Error('Please accept the terms and conditions');
                }

                const userData = {
                    fullName: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                    confirmPassword: document.getElementById('confirmPassword').value,
                    phone: document.getElementById('phone')?.value,
                    terms
                };

                if (await register(userData)) {
                    showAlert('Registration successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'cars.html';
                    }, 1500);
                }
            } catch (error) {
                console.error('Registration error:', error);
                showAlert(error.message, 'danger');
            } finally {
                spinner.classList.add('d-none');
                submitBtn.disabled = false;
            }
        });
    }

    // Check authentication for protected pages
    if (!document.location.pathname.includes('login.html') && 
        !document.location.pathname.includes('register.html')) {
        checkAuth();
    }

    // Auto-fill remembered email
    const rememberedEmail = localStorage.getItem('userEmail');
    const emailInput = document.getElementById('email');
    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
    }
});

// Helper function to show alerts
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '1050';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}
