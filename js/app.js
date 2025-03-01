// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Basic validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return false;
    }

    // Store login info if remember me is checked
    if (rememberMe) {
        localStorage.setItem('userEmail', email);
    }

    // Simulate login - In a real app, this would make an API call
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = 'dashboard.html';
    return false;
}

// Handle registration form submission
function handleRegister(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;

    // Basic validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return false;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return false;
    }

    if (!terms) {
        alert('Please accept the terms and conditions');
        return false;
    }

    // Store user info - In a real app, this would make an API call
    const user = {
        fullName,
        email,
        phone,
        registeredAt: new Date().toISOString()
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    
    window.location.href = 'dashboard.html';
    return false;
}

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname;
    
    if (isLoggedIn === 'true' && (currentPage.includes('login.html') || currentPage.includes('register.html'))) {
        window.location.href = 'dashboard.html';
    } else if (isLoggedIn !== 'true' && currentPage.includes('dashboard.html')) {
        window.location.href = 'login.html';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Auto-fill email if remembered
    const rememberedEmail = localStorage.getItem('userEmail');
    const emailInput = document.getElementById('email');
    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
    }
});
