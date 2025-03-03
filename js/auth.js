class Auth {
    constructor() {
        this.init();
    }

    init() {
        utils.debug('Auth.js loaded');
        this.initializeLoginForm();
        this.initializeDemoLogin();
    }

    initializeLoginForm() {
        const form = document.getElementById('loginForm');
        if (form) {
            utils.debug('Login form found');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(form);
            });
        }
    }

    initializeDemoLogin() {
        const demoButton = document.querySelector('.demo-login-btn');
        if (demoButton) {
            utils.debug('Demo login button found');
            demoButton.addEventListener('click', () => {
                utils.debug('Demo button clicked');
                this.handleDemoLogin();
            });
        } else {
            utils.debug('Demo login button not found');
        }
    }

    async handleLogin(form) {
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;

        try {
            // Simulated API call - replace with actual API call
            const response = await this.loginApi(email, password);
            if (response.success) {
                window.app.setAuthData(response.token, response.user);
                this.redirectAfterLogin();
            } else {
                window.app.showError(response.message || 'Login failed');
            }
        } catch (error) {
            window.app.showError('An error occurred during login');
            utils.debug('Login error:', error);
        }
    }

    async handleDemoLogin() {
        utils.debug('Attempting mock login');
        try {
            const mockResponse = {
                success: true,
                token: 'demo-token-123',
                user: {
                    id: 1,
                    name: 'Demo User',
                    email: 'demo@example.com'
                }
            };

            utils.debug('Starting mock login');
            window.app.setAuthData(mockResponse.token, mockResponse.user);
            this.redirectAfterLogin();
            utils.debug('Mock login successful, setting auth data');
        } catch (error) {
            window.app.showError('Demo login failed');
            utils.debug('Demo login error:', error);
        }
    }

    async loginApi(email, password) {
        // Simulated API call - replace with actual API endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    token: 'test-token-123',
                    user: {
                        id: 1,
                        name: 'Test User',
                        email: email
                    }
                });
            }, 500);
        });
    }

    redirectAfterLogin() {
        const intendedUrl = localStorage.getItem('intended_url');
        utils.debug('Intended URL:', intendedUrl);
        
        if (intendedUrl) {
            localStorage.removeItem('intended_url');
            window.location.href = intendedUrl;
        } else {
            window.location.href = '/';
        }
    }

    logout() {
        window.app.clearAuthData();
        window.location.href = '/login.html';
    }
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    utils.debug('DOM loaded');
    new Auth();
});
