// Global App Class
class App {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.updateNavigation();
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    getToken() {
        return localStorage.getItem('auth_token');
    }

    getUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }

    setAuthData(token, user) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.user = user;
        utils.debug('Setting auth data:', { token, user });
    }

    clearAuthData() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        this.user = null;
        utils.debug('Auth data cleared');
    }

    checkAuthentication() {
        const token = this.getToken();
        utils.debug('Getting token:', token ? 'Token exists' : 'No token');
        utils.debug('Checking authentication:', this.isAuthenticated());
        
        if (token) {
            this.user = this.getUser();
            return true;
        }
        return false;
    }

    updateNavigation() {
        utils.debug('Getting user:', this.user);
        utils.debug('Updating navigation for user:', this.user);
        
        const currentPage = window.location.pathname.split('/').pop();
        utils.debug('Current page:', currentPage);

        // Check if current page requires authentication
        if (this.requiresAuth(currentPage)) {
            utils.debug('Page requires authentication');
            if (!this.isAuthenticated()) {
                utils.debug('User not authenticated, redirecting to login');
                this.redirectToLogin();
            } else {
                utils.debug('User is authenticated, proceeding');
            }
        }
    }

    requiresAuth(page) {
        const publicPages = ['index.html', 'login.html', 'register.html'];
        return !publicPages.includes(page);
    }

    redirectToLogin() {
        const currentUrl = window.location.href;
        utils.debug('Storing intended URL:', currentUrl);
        localStorage.setItem('intended_url', currentUrl);
        window.location.href = '/login.html';
    }

    showSuccess(message) {
        utils.showToast(message, 'success');
    }

    showError(message) {
        utils.showToast(message, 'error');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    utils.debug('DOM loaded, checking authentication');
    window.app = new App();
});
