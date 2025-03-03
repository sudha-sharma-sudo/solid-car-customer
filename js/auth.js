// Handle login form submission and demo login
document.addEventListener('DOMContentLoaded', () => {
    // Debug logging
    console.log('[DEBUG] Auth.js loaded');
    
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('[DEBUG] Login form found');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('[DEBUG] Login form submitted');
            
            try {
                const formData = {
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                };
                
                // For demo purposes, check if credentials match demo account
                if (formData.email === 'demo@example.com' && formData.password === 'demo123') {
                    console.log('[DEBUG] Demo credentials matched');
                    await window.app.mockLogin(formData.email, formData.password);
                } else {
                    throw new Error('Invalid credentials. Use demo@example.com / demo123');
                }
                
            } catch (error) {
                console.error('[DEBUG] Login error:', error);
                window.app.notyf.error(error.message || 'Login failed');
            }
        });
    }

    // Handle demo login button
    const demoLoginBtn = document.getElementById('demoLoginBtn');
    if (demoLoginBtn) {
        console.log('[DEBUG] Demo login button found');
        demoLoginBtn.addEventListener('click', async () => {
            console.log('[DEBUG] Demo login button clicked');
            try {
                // Get the intended URL before login
                const intendedUrl = sessionStorage.getItem('intendedUrl');
                console.log('[DEBUG] Intended URL:', intendedUrl);
                
                await window.app.mockLogin('demo@example.com', 'demo123');
                
                // After successful login, redirect to intended URL or cars page
                if (intendedUrl) {
                    console.log('[DEBUG] Redirecting to intended URL:', intendedUrl);
                    window.location.href = intendedUrl;
                } else {
                    console.log('[DEBUG] No intended URL, redirecting to cars.html');
                    window.location.href = 'cars.html';
                }
            } catch (error) {
                console.error('[DEBUG] Demo login error:', error);
                window.app.notyf.error('Demo login failed');
            }
        });
    } else {
        console.log('[DEBUG] Demo login button not found');
    }
});

// Store intended URL when redirecting to login
if (!window.app?.isAuthenticated() && !window.location.pathname.includes('login.html')) {
    console.log('[DEBUG] Storing intended URL:', window.location.href);
    sessionStorage.setItem('intendedUrl', window.location.href);
}
