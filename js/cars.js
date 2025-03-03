// Mock car data
const MOCK_CARS = {
    'tesla-model-3': {
        id: 'tesla-model-3',
        title: 'Tesla Model 3',
        description: 'Experience the future of driving with the Tesla Model 3. This all-electric sedan combines luxury, performance, and cutting-edge technology. With its sleek design and impressive range, it\'s perfect for both daily commutes and long journeys.',
        type: 'Electric Sedan',
        fuelType: 'Electric',
        transmission: 'Automatic',
        mileage: '358 miles range',
        seats: '5 seats',
        luggage: '23 cu ft',
        price: 89,
        images: ['images/car-hero.svg'],
        videoTour: null // Example URL: 'https://example.com/videos/tesla-model-3-tour.mp4'
    },
    'bmw-330i': {
        id: 'bmw-330i',
        title: 'BMW 330i',
        description: 'The BMW 330i delivers the perfect blend of luxury, performance, and driving dynamics. With its powerful engine, premium interior, and advanced technology features, it offers an exceptional driving experience.',
        type: 'Luxury Sedan',
        fuelType: 'Gasoline',
        transmission: 'Automatic 8-speed',
        mileage: '26/36 mpg',
        seats: '5 seats',
        luggage: '17 cu ft',
        price: 79,
        images: ['images/car-hero.svg'],
        videoTour: null
    }
};

// Initialize car-related functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Cars.js loaded');
    
    // Handle car details page
    if (window.location.pathname.includes('carDetails.html')) {
        console.log('[DEBUG] On car details page, initializing...');
        loadCarDetails();
        initializeButtons();
    }
});

// Initialize button handlers
function initializeButtons() {
    console.log('[DEBUG] Initializing button handlers');
    
    // Handle booking form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        console.log('[DEBUG] Found booking form, adding submit handler');
        bookingForm.addEventListener('submit', handleBooking);
    } else {
        console.log('[DEBUG] Booking form not found');
    }
    
    // Handle favorite button
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (favoriteBtn) {
        console.log('[DEBUG] Found favorite button, adding click handler');
        favoriteBtn.addEventListener('click', handleFavorite);
    } else {
        console.log('[DEBUG] Favorite button not found');
    }
    
    // Handle share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        console.log('[DEBUG] Found share button, adding click handler');
        shareBtn.addEventListener('click', handleShare);
    } else {
        console.log('[DEBUG] Share button not found');
    }
}

// Load car details based on URL parameter
function loadCarDetails() {
    console.log('[DEBUG] Loading car details');
    
    // Get car ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');
    console.log('[DEBUG] Car ID from URL:', carId);
    
    if (!carId) {
        console.error('[DEBUG] Car ID not found in URL');
        window.app.notyf.error('Car ID not found');
        return;
    }
    
    // Get car data
    const car = MOCK_CARS[carId];
    if (!car) {
        console.error('[DEBUG] Car not found in mock data');
        window.app.notyf.error('Car not found');
        return;
    }
    
    console.log('[DEBUG] Found car data:', car);
    
    try {
        // Update page content
        updatePageContent(car);
        
        // Set minimum dates for booking
        setBookingDates();
        
        console.log('[DEBUG] Car details loaded successfully');
    } catch (error) {
        console.error('[DEBUG] Error loading car details:', error);
        window.app.notyf.error('Error loading car details');
    }
}

// Update page content with car data
function updatePageContent(car) {
    console.log('[DEBUG] Updating page content');
    
    const elements = {
        'carTitle': car.title,
        'carDescription': car.description,
        'carType': car.type,
        'fuelType': car.fuelType,
        'transmission': car.transmission,
        'mileage': car.mileage,
        'seats': car.seats,
        'luggage': car.luggage,
        'priceAmount': car.price
    };
    
    // Update each element
    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`[DEBUG] Element not found: ${id}`);
        }
    }
    
    // Update gallery
    const gallery = document.querySelector('.car-gallery img');
    if (gallery && car.images.length > 0) {
        gallery.src = car.images[0];
        gallery.alt = car.title;
    }
    
    // Handle video tour if available
    const videoTourSection = document.getElementById('videoTourSection');
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoTourSection && videoPlayer) {
        if (car.videoTour) {
            videoTourSection.classList.remove('d-none');
            videoPlayer.src = car.videoTour;
        } else {
            videoTourSection.classList.add('d-none');
        }
    }
}

// Set minimum dates for booking
function setBookingDates() {
    console.log('[DEBUG] Setting booking dates');
    
    const today = new Date().toISOString().split('T')[0];
    const pickupDate = document.getElementById('pickupDate');
    const returnDate = document.getElementById('returnDate');
    
    if (pickupDate && returnDate) {
        pickupDate.min = today;
        returnDate.min = today;
        console.log('[DEBUG] Booking dates set successfully');
    } else {
        console.warn('[DEBUG] Date inputs not found');
    }
}

// Handle booking form submission
async function handleBooking(e) {
    e.preventDefault();
    console.log('[DEBUG] Handling booking submission');
    
    try {
        const formData = {
            pickupDate: document.getElementById('pickupDate').value,
            returnDate: document.getElementById('returnDate').value,
            location: document.getElementById('location').value
        };
        
        console.log('[DEBUG] Form data:', formData);
        
        // Validate dates
        const pickup = new Date(formData.pickupDate);
        const returnDate = new Date(formData.returnDate);
        
        if (returnDate <= pickup) {
            throw new Error('Return date must be after pickup date');
        }
        
        // For demo purposes, just show success message
        window.app.notyf.success('Booking submitted successfully!');
        console.log('[DEBUG] Booking submitted successfully');
        
    } catch (error) {
        console.error('[DEBUG] Booking error:', error);
        window.app.notyf.error(error.message || 'Failed to submit booking');
    }
}

// Handle favorite button click
function handleFavorite(e) {
    console.log('[DEBUG] Handling favorite button click');
    
    try {
        const btn = e.currentTarget;
        const icon = btn.querySelector('i');
        
        if (!icon) {
            throw new Error('Favorite icon not found');
        }
        
        if (icon.classList.contains('far')) {
            icon.classList.replace('far', 'fas');
            btn.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites';
            window.app.notyf.success('Added to favorites');
            console.log('[DEBUG] Added to favorites');
        } else {
            icon.classList.replace('fas', 'far');
            btn.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
            window.app.notyf.success('Removed from favorites');
            console.log('[DEBUG] Removed from favorites');
        }
    } catch (error) {
        console.error('[DEBUG] Favorite error:', error);
        window.app.notyf.error('Failed to update favorites');
    }
}

// Handle share button click
function handleShare() {
    console.log('[DEBUG] Handling share button click');
    
    try {
        const title = document.getElementById('carTitle')?.textContent || 'Car Details';
        const description = document.getElementById('carDescription')?.textContent || '';
        const url = window.location.href;
        
        // Check if Web Share API is available
        if (navigator.share) {
            console.log('[DEBUG] Using Web Share API');
            navigator.share({
                title: title,
                text: description,
                url: url
            })
            .then(() => {
                console.log('[DEBUG] Shared successfully');
                window.app.notyf.success('Shared successfully');
            })
            .catch((error) => {
                console.error('[DEBUG] Share error:', error);
                throw error;
            });
        } else {
            // Fallback - copy URL to clipboard
            console.log('[DEBUG] Web Share API not available, copying to clipboard');
            navigator.clipboard.writeText(url)
                .then(() => {
                    console.log('[DEBUG] Copied to clipboard');
                    window.app.notyf.success('Link copied to clipboard');
                })
                .catch((error) => {
                    console.error('[DEBUG] Clipboard error:', error);
                    throw error;
                });
        }
    } catch (error) {
        console.error('[DEBUG] Share error:', error);
        window.app.notyf.error('Failed to share');
    }
}
