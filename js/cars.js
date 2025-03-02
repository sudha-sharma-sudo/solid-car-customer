const API_URL = 'http://localhost:3000/api';

// State management
let currentView = 'grid';
let currentPage = 1;
let itemsPerPage = 9;
let currentSort = 'recommended';
let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
let currentFilters = {
    type: [],
    price: { min: '', max: '' },
    transmission: '',
    features: [],
    search: ''
};

// Initialize Notyf
const notyf = new Notyf({
    duration: 3000,
    position: { x: 'right', y: 'top' }
});

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show/hide loading state
function showLoading(show) {
    document.getElementById('loadingState').classList.toggle('d-none', !show);
    document.getElementById('carListings').classList.toggle('d-none', show);
}

// Update favorites count
function updateFavoritesCount() {
    document.getElementById('favoritesCount').textContent = favorites.size;
}

// Toggle favorite status
function toggleFavorite(carId) {
    if (favorites.has(carId)) {
        favorites.delete(carId);
        notyf.success('Removed from favorites');
    } else {
        favorites.add(carId);
        notyf.success('Added to favorites');
    }
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
    updateFavoritesCount();
    document.querySelectorAll(`.favorite-btn[data-car-id="${carId}"]`).forEach(btn => {
        btn.innerHTML = favorites.has(carId) ? 
            '<i class="fas fa-heart"></i>' : 
            '<i class="far fa-heart"></i>';
    });
}

// Create car card HTML
function createCarCard(car, isFavorite) {
    return `
        <div class="card car-card h-100">
            <div class="position-relative car-image-wrapper">
                <img src="${car.image}" class="card-img-top" alt="${car.name}">
                <button class="favorite-btn" onclick="toggleFavorite('${car.id}')" data-car-id="${car.id}">
                    <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <span class="badge ${car.status === 'available' ? 'bg-success' : 'bg-danger'} position-absolute top-0 start-0 m-3">
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
                    </div>
                    <a href="booking.html?car=${car.id}" class="btn btn-primary btn-sm">
                        <i class="fas fa-calendar-check me-1"></i> Book Now
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Generate rating stars
function generateRatingStars(rating) {
    return Array.from({ length: 5 }, (_, i) => {
        if (i < Math.floor(rating)) {
            return '<i class="fas fa-star text-warning"></i>';
        } else if (i === Math.floor(rating) && !Number.isInteger(rating)) {
            return '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        return '<i class="far fa-star text-warning"></i>';
    }).join('');
}

// Get feature icon
function getFeatureIcon(feature) {
    const iconMap = {
        'Electric': 'bolt',
        'Hybrid': 'leaf',
        'GPS': 'map-marker-alt',
        'Bluetooth': 'bluetooth',
        'Leather': 'chair',
        'Autopilot': 'robot',
        'Sport': 'flag-checkered',
        'Sound': 'music',
        'Panoramic': 'sun'
    };
    return iconMap[feature.split(' ')[0]] || 'check';
}

// Update active filters display
function updateActiveFilters() {
    const container = document.getElementById('activeFilters');
    container.innerHTML = '';
    
    const filters = [];
    
    if (currentFilters.type.length > 0) {
        filters.push(...currentFilters.type.map(type => ({
            label: `Type: ${type}`,
            value: type,
            type: 'type'
        })));
    }
    
    if (currentFilters.price.min || currentFilters.price.max) {
        filters.push({
            label: `Price: $${currentFilters.price.min || '0'} - $${currentFilters.price.max || '∞'}`,
            type: 'price'
        });
    }
    
    if (currentFilters.transmission) {
        filters.push({
            label: `Transmission: ${currentFilters.transmission}`,
            value: currentFilters.transmission,
            type: 'transmission'
        });
    }
    
    if (currentFilters.features.length > 0) {
        filters.push(...currentFilters.features.map(feature => ({
            label: `Feature: ${feature}`,
            value: feature,
            type: 'features'
        })));
    }
    
    filters.forEach(filter => {
        const tag = document.createElement('span');
        tag.className = 'filter-tag';
        tag.innerHTML = `
            ${filter.label}
            <i class="fas fa-times remove-filter" onclick="removeFilter('${filter.type}', '${filter.value || ''}')"></i>
        `;
        container.appendChild(tag);
    });
}

// Remove individual filter
function removeFilter(type, value) {
    if (type === 'price') {
        currentFilters.price = { min: '', max: '' };
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
    } else if (Array.isArray(currentFilters[type])) {
        currentFilters[type] = currentFilters[type].filter(v => v !== value);
        const select = document.getElementById(type === 'type' ? 'carType' : 'features');
        Array.from(select.options).forEach(option => {
            if (option.value === value) option.selected = false;
        });
    } else {
        currentFilters[type] = '';
        document.getElementById(type).value = '';
    }
    
    filterCars();
}

// Reset all filters
function resetFilters() {
    currentFilters = {
        type: [],
        price: { min: '', max: '' },
        transmission: '',
        features: [],
        search: ''
    };
    
    document.getElementById('searchCar').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('transmission').value = '';
    document.getElementById('carType').selectedIndex = -1;
    document.getElementById('features').selectedIndex = -1;
    
    filterCars();
    notyf.success('Filters reset');
}

// Toggle view mode
function toggleView(view) {
    if (currentView === view) return;
    
    currentView = view;
    const listings = document.getElementById('carListings');
    const gridBtn = document.getElementById('gridView');
    const listBtn = document.getElementById('listView');
    
    listings.style.opacity = '0';
    setTimeout(() => {
        listings.className = `row g-4 ${view === 'list' ? 'list-view' : ''}`;
        listings.style.opacity = '1';
    }, 300);
    
    gridBtn.classList.toggle('active', view === 'grid');
    listBtn.classList.toggle('active', view === 'list');
    
    notyf.success(`${view.charAt(0).toUpperCase() + view.slice(1)} view activated`);
}

// Initialize components and event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        renderCars();
        updateFavoritesCount();
    }
});

// Filter cars
async function filterCars() {
    currentPage = 1;
    await renderCars();
    updateActiveFilters();
}

// Show favorites modal
function showFavorites() {
    const modal = new bootstrap.Modal(document.getElementById('favoritesModal'));
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = '<div class="text-center py-5"><div class="spinner-border"></div></div>';
    
    modal.show();
    
    // Fetch favorite cars
    Promise.all([...favorites].map(id => 
        fetch(`${API_URL}/cars/${id}`, {
            headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        }).then(res => res.json())
    )).then(cars => {

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
