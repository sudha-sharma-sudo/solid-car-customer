// Utility Functions
const showAlert = (message, type = 'info') => {
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
};

const setLoading = (element, isLoading) => {
    if (isLoading) {
        element.classList.add('loading');
        element.disabled = true;
    } else {
        element.classList.remove('loading');
        element.disabled = false;
    }
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Simulated API Calls
const api = {
    async login(credentials) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!credentials.email || !credentials.password) {
            throw new Error('Please fill in all fields');
        }
        
        // Simulate successful login
        return {
            fullName: 'John Smith',
            email: credentials.email,
            phone: '+1-555-123-4567',
            memberSince: new Date().toISOString(),
            membershipLevel: 'Gold'
        };
    },

    async register(userData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!userData.fullName || !userData.email || !userData.password) {
            throw new Error('Please fill in all required fields');
        }
        
        if (userData.password !== userData.confirmPassword) {
            throw new Error('Passwords do not match');
        }
        
        return {
            ...userData,
            memberSince: new Date().toISOString(),
            membershipLevel: 'Bronze'
        };
    },

    async bookCar(bookingData) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (!bookingData.pickupLocation || !bookingData.pickupDate || !bookingData.returnDate) {
            throw new Error('Please fill in all required fields');
        }
        
        return {
            bookingId: 'BK' + Math.random().toString(36).substr(2, 9),
            ...bookingData,
            status: 'confirmed',
            timestamp: new Date().toISOString()
        };
    },

    async updateProfile(profileData) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (!profileData.fullName || !profileData.email) {
            throw new Error('Please fill in all required fields');
        }
        
        return {
            ...profileData,
            updatedAt: new Date().toISOString()
        };
    },

    async submitReview(reviewData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!reviewData.rating || !reviewData.reviewText) {
            throw new Error('Please provide both rating and review text');
        }
        
        return {
            ...reviewData,
            reviewId: 'RV' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
        };
    },

    async submitSupport(ticketData) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (!ticketData.subject || !ticketData.message) {
            throw new Error('Please fill in all required fields');
        }
        
        return {
            ...ticketData,
            ticketId: 'TK' + Math.random().toString(36).substr(2, 9),
            status: 'open',
            timestamp: new Date().toISOString()
        };
    }
};

// Event Handlers
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
        setLoading(submitBtn, true);
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe')?.checked;

        const user = await api.login({ email, password });
        
        if (rememberMe) {
            localStorage.setItem('userEmail', email);
        }
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        
        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        setLoading(submitBtn, false);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
        setLoading(submitBtn, true);
        
        const userData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        const terms = document.getElementById('terms')?.checked;
        if (!terms) {
            throw new Error('Please accept the terms and conditions');
        }

        const user = await api.register(userData);
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        
        showAlert('Registration successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        setLoading(submitBtn, false);
    }
}

async function handleBooking(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
        setLoading(submitBtn, true);
        
        const bookingData = {
            pickupLocation: document.getElementById('pickupLocation').value,
            pickupDate: document.getElementById('pickupDate').value,
            returnDate: document.getElementById('returnDate').value,
            insurance: document.getElementById('insurance')?.checked,
            gps: document.getElementById('gps')?.checked,
            childSeat: document.getElementById('childSeat')?.checked
        };

        const booking = await api.bookCar(bookingData);
        
        showAlert('Booking confirmed successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        setLoading(submitBtn, false);
    }
}

async function updateProfile(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
        setLoading(submitBtn, true);
        
        const profileData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            currentPassword: document.getElementById('currentPassword').value,
            newPassword: document.getElementById('newPassword').value
        };

        const updatedProfile = await api.updateProfile(profileData);
        
        // Update stored user data
        const user = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({
            ...user,
            ...updatedProfile
        }));
        
        showAlert('Profile updated successfully!', 'success');
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        setLoading(submitBtn, false);
    }
}

async function submitReview(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
        setLoading(submitBtn, true);
        
        const reviewData = {
            rating: document.querySelectorAll('.rating-stars .fas').length,
            carId: document.getElementById('carSelect').value,
            reviewTitle: document.getElementById('reviewTitle').value,
            reviewText: document.getElementById('reviewText').value
        };

        const review = await api.submitReview(reviewData);
        
        showAlert('Review submitted successfully!', 'success');
        form.reset();
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        setLoading(submitBtn, false);
    }
}

async function submitSupport(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
        setLoading(submitBtn, true);
        
        const ticketData = {
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        const ticket = await api.submitSupport(ticketData);
        
        showAlert('Support ticket submitted successfully!', 'success');
        form.reset();
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        setLoading(submitBtn, false);
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
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

    // Initialize date pickers
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

    // Initialize rating stars
    const ratingStars = document.querySelectorAll('.rating-star');
    if (ratingStars.length) {
        ratingStars.forEach((star, index) => {
            star.addEventListener('click', () => {
                ratingStars.forEach((s, i) => {
                    if (i <= index) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
        });
    }
});
