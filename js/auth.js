// Handle login form submission and demo login
document.addEventListener('DOMContentLoaded', () => {
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const formData = {
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                };
                
                // For demo purposes, check if credentials match demo account
                if (formData.email === 'demo@example.com' && formData.password === 'demo123') {
                    await window.app.mockLogin(formData.email, formData.password);
                } else {
                    throw new Error('Invalid credentials. Use demo@example.com / demo123');
                }
                
            } catch (error) {
                console.error('Login error:', error);
                window.app.notyf.error(error.message || 'Login failed');
            }
        });
    }

    // Handle demo login button
    const demoLoginBtn = document.getElementById('demoLoginBtn');
    if (demoLoginBtn) {
        demoLoginBtn.addEventListener('click', async () => {
            try {
                await window.app.mockLogin('demo@example.com', 'demo123');
            } catch (error) {
                console.error('Demo login error:', error);
                window.app.notyf.error('Demo login failed');
            }
        });
    }
});

// Store intended URL when redirecting to login
if (!window.app.isAuthenticated() && !window.location.pathname.includes('login.html')) {
    localStorage.setItem('intendedUrl', window.location.href);
}
