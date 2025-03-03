const { logger } = require('../middleware/error');

// In a real application, this would be replaced with a database
const carsData = [
    {
        id: 'tesla-model-3',
        name: 'Tesla Model 3',
        type: 'electric',
        category: 'Sedan',
        price: 80,
        transmission: 'automatic',
        seats: 5,
        range: '350mi',
        features: ['Electric', 'Autopilot', 'GPS', 'Bluetooth'],
        rating: 4.5,
        reviews: 128,
        image: '/images/car-hero.svg',
        status: 'available'
    },
    {
        id: 'bmw-x5',
        name: 'BMW X5',
        type: 'hybrid',
        category: 'SUV',
        price: 120,
        transmission: 'automatic',
        seats: 7,
        features: ['Hybrid', 'Panoramic Roof', 'GPS', 'Leather Seats'],
        rating: 5.0,
        reviews: 89,
        image: '/images/car-hero.svg',
        status: 'available'
    },
    {
        id: 'porsche-911',
        name: 'Porsche 911',
        type: 'sports',
        category: 'Sports Car',
        price: 200,
        transmission: 'automatic',
        seats: 2,
        features: ['450 HP', 'Sport Mode', 'Premium Sound', 'Leather Seats'],
        rating: 4.8,
        reviews: 64,
        image: '/images/car-hero.svg',
        status: 'premium'
    }
];

const priceRanges = {
    'budget': [30, 50],
    'mid': [51, 80],
    'premium': [81, 120],
    'luxury': [121, Infinity]
};

class CarService {
    async getCars(filters = {}) {
        try {
            let filteredCars = [...carsData];
            const { type, price, transmission, features, search, sort, page = 1, limit = 10 } = filters;

            // Apply filters
            if (type) {
                filteredCars = filteredCars.filter(car => car.type === type);
            }

            if (price) {
                const range = priceRanges[price];
                if (range) {
                    filteredCars = filteredCars.filter(car => 
                        car.price >= range[0] && car.price <= range[1]
                    );
                }
            }

            if (transmission) {
                filteredCars = filteredCars.filter(car => 
                    car.transmission === transmission
                );
            }

            if (features) {
                filteredCars = filteredCars.filter(car => 
                    car.features.includes(features)
                );
            }

            if (search) {
                const searchLower = search.toLowerCase();
                filteredCars = filteredCars.filter(car => 
                    car.name.toLowerCase().includes(searchLower) ||
                    car.category.toLowerCase().includes(searchLower) ||
                    car.features.some(feature => 
                        feature.toLowerCase().includes(searchLower)
                    )
                );
            }

            // Apply sorting
            if (sort) {
                switch (sort) {
                    case 'price_asc':
                        filteredCars.sort((a, b) => a.price - b.price);
                        break;
                    case 'price_desc':
                        filteredCars.sort((a, b) => b.price - a.price);
                        break;
                    case 'rating':
                        filteredCars.sort((a, b) => b.rating - a.rating);
                        break;
                    case 'reviews':
                        filteredCars.sort((a, b) => b.reviews - a.reviews);
                        break;
                }
            }

            // Apply pagination
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const total = filteredCars.length;
            const paginatedCars = filteredCars.slice(startIndex, endIndex);

            return {
                cars: paginatedCars,
                pagination: {
                    total,
                    page: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    hasMore: endIndex < total
                }
            };
        } catch (error) {
            logger.error('Error in getCars service:', error);
            throw error;
        }
    }

    async getCarById(id) {
        try {
            const car = carsData.find(c => c.id === id);
            if (!car) {
                return null;
            }
            return car;
        } catch (error) {
            logger.error('Error in getCarById service:', error);
            throw error;
        }
    }

    // Helper method to get available car types
    getCarTypes() {
        return ['electric', 'hybrid', 'sports'];
    }

    // Helper method to get available price ranges
    getPriceRanges() {
        return Object.keys(priceRanges);
    }

    // Helper method to get all unique features
    getAvailableFeatures() {
        const features = new Set();
        carsData.forEach(car => {
            car.features.forEach(feature => features.add(feature));
        });
        return Array.from(features);
    }
}

module.exports = new CarService();
