// Mock authentication system for testing
const AUTH_KEY = 'solid_car_auth';

// Mock user data
const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'customer'
};

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem(AUTH_KEY) !== null;
}

// Mock login function
function login(email, password, remember = false) {
    // For testing, accept any email/password combination
    localStorage.setItem(AUTH_KEY, JSON.stringify({
        user: mockUser,
        token: 'mock-jwt-token',
        remember: remember
    }));
    return true;
}

// Mock logout function
function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'login.html';
}

// Get current user
function getCurrentUser() {
    const auth = localStorage.getItem(AUTH_KEY);
    return auth ? JSON.parse(auth).user : null;
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
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            if (login(email, password, remember)) {
                window.location.href = 'cars.html';
            }
        });
    }

    // Check authentication for protected pages
    if (!document.location.pathname.includes('login.html') && 
        !document.location.pathname.includes('register.html')) {
        checkAuth();
    }
});
