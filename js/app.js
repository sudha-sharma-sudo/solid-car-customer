// Initialize global app namespace
window.app = {};

// Initialize Notyf for notifications
window.app.notyf = new Notyf({
    duration: 3000,
    position: { x: 'right', y: 'top' },
    types: [
        {
            type: 'success',
            background: '#28a745'
        },
        {
            type: 'error',
            background: '#dc3545'
        }
    ]
});

// Debug logging function
window.app.debug = function(message, data = null) {
    console.log(`[DEBUG] ${message}`, data || '');
};

// Authentication functions
window.app.getToken = function() {
    const token = sessionStorage.getItem('token');
    window.app.debug('Getting token:', token ? 'Token exists' : 'No token');
    return token;
};

window.app.getUser = function() {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    window.app.debug('Getting user:', user);
    return user;
};

window.app.isAuthenticated = function() {
    const token = window.app.getToken();
    const isAuth = !!token;
    window.app.debug('Checking authentication:', isAuth);
    return isAuth;
};

window.app.setAuthData = function(token, user) {
    window.app.debug('Setting auth data:', { token: 'exists', user });
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    // Also store in localStorage for persistent login
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

window.app.clearAuthData = function() {
    window.app.debug('Clearing auth data');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Try to restore session from localStorage
window.app.restoreSession = function() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
        window.app.debug('Restoring session from localStorage');
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', userStr);
        return true;
    }
    return false;
};

// Update navigation based on authentication status
window.app.updateNavigation = function() {
    const userNav = document.getElementById('userNav');
    if (!userNav) {
        window.app.debug('userNav element not found');
        return;
    }

    const user = window.app.getUser();
    window.app.debug('Updating navigation for user:', user);

    if (user) {
        userNav.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="me-3">Welcome, ${user.name}</span>
                <a href="profile.html" class="btn btn-outline-primary me-2">Profile</a>
                <button onclick="app.logout()" class="btn btn-outline-danger">Logout</button>
            </div>
        `;
    } else {
        userNav.innerHTML = `
            <a href="login.html" class="btn btn-outline-primary me-2">Login</a>
            <a href="register.html" class="btn btn-primary">Register</a>
        `;
    }
};

// Logout function
window.app.logout = function() {
    window.app.debug('Logging out');
    window.app.clearAuthData();
    window.app.notyf.success('Logged out successfully');
    window.location.href = 'login.html';
};

// Mock login function for demo
window.app.mockLogin = async function(email, password) {
    try {
        window.app.debug('Starting mock login');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create a mock JWT token
        const mockToken = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJkZW1vQGV4YW1wbGUuY29tIiwibmFtZSI6IkRlbW8gVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.KxCLHXuTiU4Kqxf7o4GIxKoqbY9V8YyV8vrGN8jXJ8k',
            user: {
                id: '123',
                email: email,
                name: 'Demo User'
            }
        };

        window.app.debug('Mock login successful, setting auth data');
        window.app.setAuthData(mockToken.token, mockToken.user);
        
        window.app.notyf.success('Logged in successfully');
        window.app.updateNavigation();
        
        // Get intended URL or default to cars page
        const intendedUrl = sessionStorage.getItem('intendedUrl');
        window.app.debug('Redirecting to:', intendedUrl || 'cars.html');
        
        if (intendedUrl) {
            sessionStorage.removeItem('intendedUrl');
            window.location.href = intendedUrl;
        } else {
            window.location.href = 'cars.html';
        }
    } catch (error) {
        console.error('Mock login error:', error);
        window.app.notyf.error('Login failed');
        throw error;
    }
};

// Handle API errors
window.app.handleApiError = function(error) {
    window.app.debug('API Error:', error);
    
    if (error.status === 401) {
        window.app.clearAuthData();
        sessionStorage.setItem('intendedUrl', window.location.href);
        window.location.href = 'login.html';
    }
    
    window.app.notyf.error(error.message || 'An error occurred');
};

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    window.app.debug('DOM loaded, checking authentication');
    
    // Try to restore session
    window.app.restoreSession();
    
    // Update navigation
    window.app.updateNavigation();
    
    // Get current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.app.debug('Current page:', currentPage);
    
    // List of public pages that don't require authentication
    const publicPages = ['login.html', 'register.html', 'index.html'];
    
    // Check if authentication is required
    if (!publicPages.includes(currentPage)) {
        window.app.debug('Page requires authentication');
        if (!window.app.isAuthenticated()) {
            window.app.debug('User not authenticated, redirecting to login');
            sessionStorage.setItem('intendedUrl', window.location.href);
            window.location.href = 'login.html';
            return;
        }
        window.app.debug('User is authenticated, proceeding');
    } else if (currentPage === 'login.html' && window.app.isAuthenticated()) {
        window.app.debug('Already authenticated, redirecting from login page');
        window.location.href = 'cars.html';
        return;
    }
});

// Export debug function to global scope for console access
window.debug = window.app.debug;
