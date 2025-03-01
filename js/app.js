// Authentication Functions
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked;

    // Basic validation
    if (!email || !password) {
        showAlert('Please fill in all fields', 'danger');
        return false;
    }

    // Store login info if remember me is checked
    if (rememberMe) {
        localStorage.setItem('userEmail', email);
    }

    // Simulate login - In a real app, this would make an API call
    const user = {
        fullName: 'John Smith',
        email: email,
        phone: '+1-555-123-4567',
        memberSince: new Date().toISOString(),
        membershipLevel: 'Gold'
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    
    window.location.href = 'dashboard.html';
    return false;
}

function handleRegister(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms')?.checked;

    // Basic validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'danger');
        return false;
    }

    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'danger');
        return false;
    }

    if (!terms) {
        showAlert('Please accept the terms and conditions', 'danger');
        return false;
    }

    // Store user info - In a real app, this would make an API call
    const user = {
        fullName,
        email,
        phone,
        registeredAt: new Date().toISOString(),
        membershipLevel: 'Bronze'
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    
    window.location.href = 'dashboard.html';
    return false;
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Car Booking Functions
function handleBooking(event) {
    event.preventDefault();

    const pickupLocation = document.getElementById('pickupLocation').value;
    const pickupDate = document.getElementById('pickupDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const insurance = document.getElementById('insurance')?.checked;
    const gps = document.getElementById('gps')?.checked;
    const childSeat = document.getElementById('childSeat')?.checked;

    if (!pickupLocation || !pickupDate || !returnDate) {
        showAlert('Please fill in all required fields', 'danger');
        return false;
    }

    // In a real app, this would submit to an API
    showAlert('Booking confirmed successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
    return false;
}

// Profile Management Functions
function updateProfile(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    // In a real app, this would submit to an API
    showAlert('Profile updated successfully!', 'success');
    return false;
}

// Review Functions
function submitReview(event) {
    event.preventDefault();

    const rating = document.querySelectorAll('.rating-stars .fas').length;
    const carSelect = document.getElementById('carSelect').value;
    const reviewTitle = document.getElementById('reviewTitle').value;
    const reviewText = document.getElementById('reviewText').value;

    if (!rating || !carSelect || !reviewTitle || !reviewText) {
        showAlert('Please fill in all required fields', 'danger');
        return false;
    }

    // In a real app, this would submit to an API
    showAlert('Review submitted successfully!', 'success');
    return false;
}

// Support Functions
function submitSupport(event) {
    event.preventDefault();

    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    if (!subject || !message) {
        showAlert('Please fill in all required fields', 'danger');
        return false;
    }

    // In a real app, this would submit to an API
    showAlert('Support ticket submitted successfully!', 'success');
    return false;
}

// Notification Functions
function updateNotificationSettings(event) {
    event.preventDefault();

    // In a real app, this would submit to an API
    showAlert('Notification preferences updated successfully!', 'success');
    return false;
}

// Utility Functions
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

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname;
    
    if (isLoggedIn === 'true' && (currentPage.includes('login.html') || currentPage.includes('register.html'))) {
        window.location.href = 'dashboard.html';
    } else if (isLoggedIn !== 'true' && 
              !currentPage.includes('login.html') && 
              !currentPage.includes('register.html') && 
              !currentPage.includes('index.html')) {
        window.location.href = 'login.html';
    }
    
    // Auto-fill email if remembered
    const rememberedEmail = localStorage.getItem('userEmail');
    const emailInput = document.getElementById('email');
    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
    }

    // Load user data
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const userNameElements = document.querySelectorAll('#userName, #profileName, #membershipName');
        userNameElements.forEach(element => {
            if (element) element.textContent = user.fullName;
        });
    }

    // Initialize date pickers if present
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#pickupDate", {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            minDate: "today"
        });
        
        flatpickr("#returnDate", {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            minDate: "today"
        });
    }
});
