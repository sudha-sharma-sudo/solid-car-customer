// Car list state
let currentFilters = {
    type: '',
    price: '',
    transmission: '',
    features: [],
    search: '',
    sort: '',
    page: 1,
    limit: 9
};

// Initialize car details page
async function initializeCarDetails() {
    try {
        // Get car ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const carId = urlParams.get('id');
        
        if (!carId) {
            window.location.href = 'cars.html';
            return;
        }

        // For demo purposes, use mock data
        const mockCarData = {
            name: 'Tesla Model 3',
            type: 'electric',
            price: 80,
            specifications: {
                engine: 'Dual Motor All-Wheel Drive',
                power: '346 hp',
                acceleration: '3.1s 0-60 mph',
                range: '350 miles',
                charging: '15 minutes for 200 miles',
                dimensions: {
                    length: '184.8 inches',
                    width: '72.8 inches',
                    height: '56.8 inches'
                }
            },
            features: ['Electric', 'Autopilot', 'GPS', 'Bluetooth'],
            additionalFeatures: [
                {
                    name: 'Autopilot',
                    description: 'Advanced driver assistance with automatic steering, acceleration, and braking'
                },
                {
                    name: 'Premium Interior',
                    description: 'Premium seat material and trim with custom driver profiles'
                }
            ],
            gallery: [
                '/images/car-hero.svg',
                '/images/car-hero.svg',
                '/images/car-hero.svg'
            ],
            hasVideoTour: true
        };

        // Update page content with mock data
        updateCarDetails(mockCarData);
        
        // Initialize video tour if available
        if (mockCarData.hasVideoTour) {
            await initializeVideoTour(carId);
        }

        // Initialize gallery
        initializeGallery(mockCarData.gallery);

        // Initialize booking form
        initializeBookingForm(carId);

    } catch (error) {
        console.error('Error initializing car details:', error);
        notyf.error('Failed to load car details');
    }
}

// Update car details in the DOM
function updateCarDetails(car) {
    // Update basic information
    document.getElementById('carName').textContent = car.name;
    document.getElementById('carType').textContent = car.type.toUpperCase();
    document.getElementById('carPrice').textContent = `$${car.price}/day`;
    
    // Update specifications
    const specificationsContainer = document.getElementById('specifications');
    specificationsContainer.innerHTML = '';
    
    for (const [key, value] of Object.entries(car.specifications)) {
        if (typeof value === 'object') {
            // Handle nested specifications like dimensions
            for (const [subKey, subValue] of Object.entries(value)) {
                specificationsContainer.innerHTML += `
                    <div class="col-md-6 mb-2">
                        <div class="d-flex justify-content-between">
                            <span class="text-muted">${formatSpecName(subKey)}</span>
                            <span>${subValue}</span>
                        </div>
                    </div>
                `;
            }
        } else {
            specificationsContainer.innerHTML += `
                <div class="col-md-6 mb-2">
                    <div class="d-flex justify-content-between">
                        <span class="text-muted">${formatSpecName(key)}</span>
                        <span>${value}</span>
                    </div>
                </div>
            `;
        }
    }

    // Update features
    const featuresContainer = document.getElementById('features');
    featuresContainer.innerHTML = '';
    
    car.features.forEach(feature => {
        featuresContainer.innerHTML += `
            <div class="col-md-6 mb-2">
                <i class="fas fa-check text-success me-2"></i>${feature}
            </div>
        `;
    });

    // Update additional features
    if (car.additionalFeatures && car.additionalFeatures.length > 0) {
        car.additionalFeatures.forEach(feature => {
            featuresContainer.innerHTML += `
                <div class="col-12 mb-3">
                    <h6>${feature.name}</h6>
                    <p class="text-muted small">${feature.description}</p>
                </div>
            `;
        });
    }
}

// Initialize video tour
async function initializeVideoTour(carId) {
    try {
        // For demo purposes, use a mock video URL
        const mockVideoTour = {
            videoUrl: 'https://example.com/videos/tesla-model-3-tour.mp4'
        };
        
        // Show video section
        const videoSection = document.getElementById('videoTourSection');
        videoSection.classList.remove('d-none');
        
        // Update video player
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.src = mockVideoTour.videoUrl;
        
        // Add video event listeners
        videoPlayer.addEventListener('play', () => {
            console.log('Video playback started');
        });
        
        videoPlayer.addEventListener('pause', () => {
            console.log('Video playback paused');
        });
        
        videoPlayer.addEventListener('ended', () => {
            console.log('Video playback completed');
        });

    } catch (error) {
        console.error('Error initializing video tour:', error);
        notyf.error('Failed to load video tour');
    }
}

// Initialize gallery
function initializeGallery(gallery) {
    if (!gallery || gallery.length === 0) return;

    const carouselInner = document.querySelector('#carMediaGallery .carousel-inner');
    carouselInner.innerHTML = '';
    
    gallery.forEach((image, index) => {
        carouselInner.innerHTML += `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="${image}" class="d-block w-100" alt="Car Image ${index + 1}">
            </div>
        `;
    });
}

// Initialize booking form
function initializeBookingForm(carId) {
    const bookingForm = document.getElementById('bookingForm');
    
    // Set minimum dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    document.getElementById('startDate').min = tomorrow.toISOString().split('T')[0];
    document.getElementById('endDate').min = tomorrow.toISOString().split('T')[0];
    
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = {
                carId,
                startDate: document.getElementById('startDate').value,
                endDate: document.getElementById('endDate').value,
                pickupLocation: document.getElementById('pickupLocation').value,
                dropoffLocation: document.getElementById('dropoffLocation').value
            };
            
            // For demo purposes, simulate a successful booking
            notyf.success('Booking created successfully');
            window.location.href = 'booking.html';
            
        } catch (error) {
            console.error('Error creating booking:', error);
            notyf.error('Failed to create booking');
        }
    });
}

// Helper function to format specification names
function formatSpecName(name) {
    return name
        .split(/(?=[A-Z])/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Initialize page based on current URL
if (window.location.pathname.includes('carDetails.html')) {
    initializeCarDetails();
}
