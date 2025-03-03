class CarDetailsPage {
    constructor() {
        this.carId = null;
        this.carData = null;
        this.isLoading = true;
        this.isFavorite = false;
        this.reviews = [];
        this.rating = 0;
        
        // Initialize page
        this.init();
    }

    async init() {
        utils.debug('Cars.js loaded');
        
        // Check if we're on the car details page
        if (window.location.pathname.includes('carDetails.html')) {
            utils.debug('On car details page, initializing...');
            this.initializeCarDetails();
        }
    }

    async initializeCarDetails() {
        // Get car ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.carId = urlParams.get('id');
        utils.debug('Car ID from URL:', this.carId);

        if (!this.carId) {
            window.app.showError('No car ID provided');
            return;
        }

        // Initialize components
        this.initializeComponents();
        
        // Load car data
        await this.loadCarDetails();
        
        // Initialize event handlers
        this.initializeEventHandlers();
        
        utils.debug('Car details initialized');
    }

    initializeFormComponents() {
        try {
            // Initialize MDB form outlines if MDB is available
            if (typeof mdb !== 'undefined' && mdb.Input) {
                document.querySelectorAll('.form-outline').forEach((formOutline) => {
                    new mdb.Input(formOutline).init();
                });
            }
        } catch (error) {
            utils.debug('Error initializing MDB components:', error);
        }
    }

    initializeComponents() {
        // Initialize form components
        this.initializeFormComponents();

        // Initialize datepickers with validation
        this.initializeDatePickers();
        
        // Initialize dropdowns
        this.initializeDropdowns();
        
        // Initialize rating stars
        this.initializeRatingStars();
    }

    initializeDatePickers() {
        // Get today's date at midnight UTC
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const maxDate = new Date(today);
        maxDate.setMonth(maxDate.getMonth() + 3);

        // Format dates in YYYY-MM-DD format
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Set min/max dates for pickup
        const pickupDate = document.getElementById('pickupDate');
        pickupDate.min = formatDate(today);
        pickupDate.max = formatDate(maxDate);
        pickupDate.value = formatDate(today); // Set default to today

        // Set min/max dates for return
        const returnDate = document.getElementById('returnDate');
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        returnDate.min = formatDate(tomorrow);
        returnDate.max = formatDate(maxDate);
        returnDate.value = formatDate(tomorrow); // Set default to tomorrow

        utils.debug('Setting booking dates');
        
        // Add event listeners for date validation
        pickupDate.addEventListener('change', () => this.validateDates());
        returnDate.addEventListener('change', () => this.validateDates());
        
        utils.debug('Booking dates set successfully');
    }

    validateDates() {
        const pickupInput = document.getElementById('pickupDate');
        const returnInput = document.getElementById('returnDate');
        const pickupDate = new Date(pickupInput.value);
        const returnDate = new Date(returnInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Validate pickup date
        if (pickupDate < today) {
            pickupInput.setCustomValidity('Pickup date cannot be in the past');
        } else {
            pickupInput.setCustomValidity('');
        }
        
        // Validate return date
        if (returnDate <= pickupDate) {
            returnInput.setCustomValidity('Return date must be after pickup date');
        } else {
            returnInput.setCustomValidity('');
        }

        // Report validity to show validation messages
        pickupInput.reportValidity();
        returnInput.reportValidity();
    }

    initializeDropdowns() {
        const locationSelect = document.getElementById('pickupLocation');
        if (locationSelect) {
            locationSelect.addEventListener('change', (e) => {
                const selectedValue = e.target.value;
                utils.debug('Location selected:', selectedValue);
                
                // Clear any previous validation messages
                locationSelect.setCustomValidity('');
                
                if (!selectedValue) {
                    locationSelect.setCustomValidity('Please select a pickup location');
                }
                
                locationSelect.reportValidity();
            });
        }
    }

    initializeRatingStars() {
        const stars = document.querySelectorAll('.rating-stars i');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.setRating(rating);
            });

            star.addEventListener('mouseover', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.highlightStars(rating);
            });
        });

        document.querySelector('.rating-stars').addEventListener('mouseleave', () => {
            this.highlightStars(this.rating);
        });
    }

    setRating(rating) {
        this.rating = rating;
        document.getElementById('ratingInput').value = rating;
        this.highlightStars(rating);
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.rating-stars i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }

    async loadCarDetails() {
        utils.debug('Loading car details');
        try {
            // Simulated API call - replace with actual API call
            this.carData = {
                id: this.carId,
                title: 'Tesla Model 3',
                description: 'Experience the future of driving with this all-electric sedan. The Tesla Model 3 combines cutting-edge technology with exceptional performance and range.',
                price: 89,
                specifications: {
                    type: 'Electric Sedan',
                    fuel: 'Electric',
                    transmission: 'Automatic',
                    seats: '5 seats',
                    range: '358 miles range',
                    cargo: '23 cu ft'
                }
            };

            this.updatePageContent();
            utils.debug('Car details loaded successfully');
        } catch (error) {
            utils.debug('Error loading car details:', error);
            window.app.showError('Failed to load car details');
        }
    }

    updatePageContent() {
        if (!this.carData) return;

        // Update basic information
        document.getElementById('carTitle').textContent = this.carData.title;
        document.getElementById('carDescription').textContent = this.carData.description;
        document.getElementById('priceAmount').textContent = `$${this.carData.price}`;

        // Update specifications
        document.getElementById('carType').textContent = this.carData.specifications.type;
        document.getElementById('fuelType').textContent = this.carData.specifications.fuel;
        document.getElementById('transmission').textContent = this.carData.specifications.transmission;
        document.getElementById('seats').textContent = this.carData.specifications.seats;

        utils.debug('Updating page content');
    }

    initializeEventHandlers() {
        // Booking form submission
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBooking();
        });

        // Favorite button
        document.getElementById('favoriteBtn').addEventListener('click', () => {
            utils.debug('Handling favorite button click');
            this.toggleFavorite();
        });

        // Share button
        document.getElementById('shareBtn').addEventListener('click', () => {
            utils.debug('Handling share button click');
            this.handleShare();
        });

        // Review form
        document.getElementById('reviewForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleReviewSubmission();
        });

        utils.debug('Initializing button handlers');
        utils.debug('Found booking form, adding submit handler');
        utils.debug('Found favorite button, adding click handler');
        utils.debug('Found share button, adding click handler');
    }

    async handleBooking() {
        const pickupDate = document.getElementById('pickupDate').value;
        const returnDate = document.getElementById('returnDate').value;
        const location = document.getElementById('pickupLocation').value;

        if (!pickupDate || !returnDate || !location) {
            window.app.showError('Please fill in all booking details');
            return;
        }

        try {
            // Simulated booking API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.app.showSuccess('Booking successful! Check your email for confirmation.');
        } catch (error) {
            window.app.showError('Failed to process booking');
        }
    }

    async toggleFavorite() {
        try {
            this.isFavorite = !this.isFavorite;
            const btn = document.getElementById('favoriteBtn');
            
            if (this.isFavorite) {
                btn.innerHTML = '<i class="fas fa-heart me-2"></i>Remove from Favorites';
                window.app.showSuccess('Added to favorites');
                utils.debug('Added to favorites');
            } else {
                btn.innerHTML = '<i class="far fa-heart me-2"></i>Add to Favorites';
                window.app.showSuccess('Removed from favorites');
                utils.debug('Removed from favorites');
            }
        } catch (error) {
            window.app.showError('Failed to update favorites');
        }
    }

    async handleShare() {
        const shareUrl = window.location.href;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: this.carData.title,
                    text: this.carData.description,
                    url: shareUrl
                });
                utils.debug('Shared successfully');
            } catch (error) {
                utils.debug('Web Share API not available, copying to clipboard');
                this.copyToClipboard(shareUrl);
            }
        } else {
            utils.debug('Web Share API not available, copying to clipboard');
            this.copyToClipboard(shareUrl);
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            window.app.showSuccess('Link copied to clipboard');
            utils.debug('Copied to clipboard');
        } catch (error) {
            window.app.showError('Failed to copy link');
        }
    }

    async handleReviewSubmission() {
        const rating = document.getElementById('ratingInput').value;
        const text = document.getElementById('reviewText').value;

        if (!rating || !text) {
            window.app.showError('Please provide both rating and review text');
            return;
        }

        try {
            // Simulated API call to submit review
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Close modal
            const modal = mdb.Modal.getInstance(document.getElementById('addReviewModal'));
            modal.hide();
            
            window.app.showSuccess('Review submitted successfully');
            
            // Reset form
            document.getElementById('reviewForm').reset();
            this.setRating(0);
        } catch (error) {
            window.app.showError('Failed to submit review');
        }
    }
}

// Initialize car details page
document.addEventListener('DOMContentLoaded', () => {
    utils.debug('DOM loaded');
    new CarDetailsPage();
});
