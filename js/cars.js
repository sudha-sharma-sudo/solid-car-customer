const API_URL = 'http://localhost:3000/api';

// State management
let currentView = 'grid';
let currentFilters = {
    type: '',
    price: '',
    transmission: '',
    features: ''
};
let currentSearch = '';

// Initialize Notyf
const notyf = new Notyf({
    duration: 3000,
    position: { x: 'right', y: 'top' },
    types: [
        {
            type: 'info',
            background: '#0dcaf0',
            icon: false
        }
    ]
});

// Fetch cars from API
async function fetchCars(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/cars${queryParams ? '?' + queryParams : ''}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error fetching cars');
        }

        return data.data.cars;
    } catch (error) {
        console.error('Fetch cars error:', error);
        showAlert(error.message, 'danger');
        return [];
    }
}

// Render car cards
async function renderCars(filters = {}) {
    const cars = await fetchCars(filters);
    const carListings = document.getElementById('carListings');
    carListings.innerHTML = '';

    if (cars.length === 0) {
        carListings.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-car fa-3x text-muted mb-3"></i>
                <h3>No cars found</h3>
                <p class="text-muted">Try adjusting your filters or search criteria</p>
            </div>
        `;
        return;
    }

    cars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'col-md-4 fade-in';
        carCard.innerHTML = `
            <div class="card car-card h-100">
                <div class="position-relative car-image-wrapper">
                    <img src="${car.image}" class="card-img-top" alt="${car.name}">
                    <span class="badge ${car.status === 'available' ? 'bg-success' : 'bg-danger'} position-absolute top-0 end-0 m-3">
                        ${car.status === 'available' ? 'Available' : 'Premium'}
                    </span>
                    <div class="car-overlay">
                        <button class="btn btn-light btn-sm" onclick="showCarDetails('${car.id}')">
                            <i class="fas fa-info-circle"></i> View Details
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="card-title mb-0">${car.name}</h5>
                            <p class="text-muted mb-0">${car.category}</p>
                        </div>
                        <span class="badge bg-primary">$${car.price}/day</span>
                    </div>
                    <div class="car-features mb-3">
                        ${car.features.slice(0, 3).map(feature => 
                            `<span class="car-feature" data-tooltip="${feature}">
                                <i class="fas fa-${getFeatureIcon(feature)} me-1"></i> ${feature}
                            </span>`
                        ).join('')}
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="ratings">
                            ${generateRatingStars(car.rating)}
                            <span class="ms-1 text-muted">(${car.rating})</span>
                            <small class="ms-1 text-muted">${car.reviews} reviews</small>
                        </div>
                        <a href="booking.html?car=${car.id}" class="btn btn-primary btn-book">
                            <i class="fas fa-calendar-check me-1"></i> Book Now
                        </a>
                    </div>
                </div>
            </div>
        `;
        carListings.appendChild(carCard);
    });

    // Initialize tooltips
    initializeTooltips();
}

// Helper function to generate rating stars
function generateRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="fas fa-star text-warning"></i>';
        } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        } else {
            stars += '<i class="far fa-star text-warning"></i>';
        }
    }
    return stars;
}

// Helper function to get feature icon
function getFeatureIcon(feature) {
    const iconMap = {
        'Electric': 'bolt',
        'Hybrid': 'leaf',
        'GPS': 'map-marker-alt',
        'Bluetooth': 'bluetooth',
        'Leather Seats': 'chair',
        'Autopilot': 'robot',
        'Sport Mode': 'flag-checkered',
        'Premium Sound': 'music',
        'Panoramic Roof': 'sun',
        '450 HP': 'tachometer-alt'
    };
    return iconMap[feature] || 'check';
}

// Filter cars
async function filterCars() {
    const filters = {
        search: currentSearch,
        ...currentFilters
    };

    await renderCars(filters);
    
    // Show filter feedback
    const activeFilters = Object.values(currentFilters).filter(Boolean).length;
    if (activeFilters > 0 || currentSearch) {
        notyf.success(`Applied ${activeFilters + (currentSearch ? 1 : 0)} filters`);
    }
}

// Search functionality
document.getElementById('searchCar').addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    filterCars();
});

// View toggles with animation
document.getElementById('gridView').addEventListener('click', () => {
    if (currentView !== 'grid') {
        currentView = 'grid';
        const listings = document.getElementById('carListings');
        listings.style.opacity = '0';
        setTimeout(() => {
            listings.className = 'row g-4';
            listings.style.opacity = '1';
        }, 300);
        notyf.success('Grid view activated');
    }
});

document.getElementById('listView').addEventListener('click', () => {
    if (currentView !== 'list') {
        currentView = 'list';
        const listings = document.getElementById('carListings');
        listings.style.opacity = '0';
        setTimeout(() => {
            listings.className = 'row g-4 list-view';
            listings.style.opacity = '1';
        }, 300);
        notyf.success('List view activated');
    }
});

// Add event listeners to filters
['carType', 'priceRange', 'transmission', 'features'].forEach(id => {
    document.getElementById(id).addEventListener('change', (e) => {
        currentFilters[id.replace('car', '').toLowerCase()] = e.target.value;
        filterCars();
    });
});

// Show car details modal
async function showCarDetails(carId) {
    try {
        const response = await fetch(`${API_URL}/cars/${carId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error fetching car details');
        }

        const car = data.data.car;

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'carDetailsModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${car.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <img src="${car.image}" class="img-fluid rounded" alt="${car.name}">
                            </div>
                            <div class="col-md-6">
                                <h6 class="mb-3">Specifications</h6>
                                <ul class="list-unstyled">
                                    <li class="mb-2"><i class="fas fa-car me-2"></i> ${car.category}</li>
                                    <li class="mb-2"><i class="fas fa-cog me-2"></i> ${car.transmission}</li>
                                    <li class="mb-2"><i class="fas fa-user me-2"></i> ${car.seats} Seats</li>
                                    ${car.range ? `<li class="mb-2"><i class="fas fa-road me-2"></i> ${car.range} Range</li>` : ''}
                                </ul>
                                <h6 class="mb-3">Features</h6>
                                <div class="car-features">
                                    ${car.features.map(feature => 
                                        `<span class="car-feature">
                                            <i class="fas fa-${getFeatureIcon(feature)} me-1"></i> ${feature}
                                        </span>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <a href="booking.html?car=${car.id}" class="btn btn-primary">
                            <i class="fas fa-calendar-check me-1"></i> Book Now
                        </a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    } catch (error) {
        console.error('Show car details error:', error);
        showAlert(error.message, 'danger');
    }
}

// Initialize tooltips
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        new bootstrap.Tooltip(element, {
            title: element.dataset.tooltip,
            placement: 'top'
        });
    });
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication before rendering
    if (checkAuth()) {
        renderCars();
    }
});
