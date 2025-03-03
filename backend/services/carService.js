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
        status: 'available',
        isFeatured: true,
        specifications: {
            engine: 'Dual Motor All-Wheel Drive',
            power: '346 hp',
            acceleration: '3.1s 0-60 mph',
            topSpeed: '162 mph',
            range: '350 miles',
            charging: '15 minutes for 200 miles',
            dimensions: {
                length: '184.8 inches',
                width: '72.8 inches',
                height: '56.8 inches',
                weight: '4,048 lbs'
            }
        },
        videoTour: '/videos/tesla-model-3-tour.mp4',
        gallery: [
            '/images/tesla-model-3/exterior-1.jpg',
            '/images/tesla-model-3/interior-1.jpg',
            '/images/tesla-model-3/features-1.jpg'
        ],
        additionalFeatures: [
            {
                name: 'Autopilot',
                description: 'Advanced driver assistance with automatic steering, acceleration, and braking'
            },
            {
                name: 'Premium Interior',
                description: 'Premium seat material and trim with custom driver profiles'
            }
        ]
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
        status: 'available',
        isFeatured: true,
        specifications: {
            engine: '3.0L BMW TwinPower Turbo + Electric Motor',
            power: '389 hp combined',
            acceleration: '5.3s 0-60 mph',
            topSpeed: '130 mph',
            electricRange: '30 miles',
            fuelEconomy: '50 MPGe',
            dimensions: {
                length: '194.3 inches',
                width: '78.9 inches',
                height: '69.1 inches',
                weight: '5,672 lbs'
            }
        },
        videoTour: '/videos/bmw-x5-tour.mp4',
        gallery: [
            '/images/bmw-x5/exterior-1.jpg',
            '/images/bmw-x5/interior-1.jpg',
            '/images/bmw-x5/features-1.jpg'
        ],
        additionalFeatures: [
            {
                name: 'Live Cockpit Professional',
                description: '12.3-inch digital instrument cluster and control display'
            },
            {
                name: 'Driving Assistant Professional',
                description: 'Comprehensive safety and convenience features'
            }
        ]
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
        status: 'premium',
        isFeatured: true,
        specifications: {
            engine: '3.0L Twin-Turbo Boxer 6',
            power: '450 hp',
            acceleration: '3.0s 0-60 mph',
            topSpeed: '182 mph',
            transmission: '8-speed PDK',
            chassis: 'Rear-Engine RWD',
            dimensions: {
                length: '177.9 inches',
                width: '72.9 inches',
                height: '51.1 inches',
                weight: '3,382 lbs'
            }
        },
        videoTour: '/videos/porsche-911-tour.mp4',
        gallery: [
            '/images/porsche-911/exterior-1.jpg',
            '/images/porsche-911/interior-1.jpg',
            '/images/porsche-911/features-1.jpg'
        ],
        additionalFeatures: [
            {
                name: 'Sport Chrono Package',
                description: 'Launch control and dynamic engine mounts'
            },
            {
                name: 'PASM Sport Suspension',
                description: 'Lowered ride height and adaptive dampers'
            }
        ]
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
            const { 
                type, 
                price, 
                transmission, 
                features, 
                search, 
                sort, 
                page = 1, 
                limit = 10,
                featured,
                status 
            } = filters;

            // Apply enhanced filters
            if (type) {
                filteredCars = filteredCars.filter(car => car.type === type);
            }

            if (featured) {
                filteredCars = filteredCars.filter(car => car.isFeatured);
            }

            if (status) {
                filteredCars = filteredCars.filter(car => car.status === status);
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
                    ) ||
                    car.specifications?.engine.toLowerCase().includes(searchLower) ||
                    car.additionalFeatures?.some(feature => 
                        feature.name.toLowerCase().includes(searchLower) ||
                        feature.description.toLowerCase().includes(searchLower)
                    )
                );
            }

            // Enhanced sorting options
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
                    case 'power':
                        filteredCars.sort((a, b) => {
                            const powerA = parseInt(a.specifications?.power) || 0;
                            const powerB = parseInt(b.specifications?.power) || 0;
                            return powerB - powerA;
                        });
                        break;
                    case 'featured':
                        filteredCars.sort((a, b) => {
                            if (a.isFeatured === b.isFeatured) return 0;
                            return a.isFeatured ? -1 : 1;
                        });
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

    async getCarById(id, includeDetails = false) {
        try {
            const car = carsData.find(c => c.id === id);
            if (!car) {
                return null;
            }

            if (!includeDetails) {
                // Return basic car info without detailed specifications
                const { specifications, videoTour, gallery, additionalFeatures, ...basicInfo } = car;
                return basicInfo;
            }

            // Return full car details including specifications, video tour, etc.
            return {
                ...car,
                hasVideoTour: !!car.videoTour,
                galleryCount: car.gallery?.length || 0
            };
        } catch (error) {
            logger.error('Error in getCarById service:', error);
            throw error;
        }
    }

    // Enhanced helper methods
    getCarTypes() {
        return Array.from(new Set(carsData.map(car => car.type)));
    }

    // Helper method to get available price ranges
    getPriceRanges() {
        return Object.keys(priceRanges);
    }

    // Enhanced feature retrieval
    getAvailableFeatures() {
        const features = new Set();
        carsData.forEach(car => {
            car.features.forEach(feature => features.add(feature));
            car.additionalFeatures?.forEach(feature => features.add(feature.name));
        });
        return Array.from(features);
    }

    // New method to get featured cars
    async getFeaturedCars(limit = 3) {
        try {
            return carsData
                .filter(car => car.isFeatured)
                .slice(0, limit)
                .map(({ specifications, videoTour, gallery, additionalFeatures, ...basicInfo }) => basicInfo);
        } catch (error) {
            logger.error('Error in getFeaturedCars service:', error);
            throw error;
        }
    }

    // New method to get car specifications
    async getCarSpecifications(id) {
        try {
            const car = carsData.find(c => c.id === id);
            if (!car) {
                return null;
            }
            return car.specifications;
        } catch (error) {
            logger.error('Error in getCarSpecifications service:', error);
            throw error;
        }
    }

    // New method to get car video tour
    async getCarVideoTour(id) {
        try {
            const car = carsData.find(c => c.id === id);
            if (!car || !car.videoTour) {
                return null;
            }
            return {
                videoUrl: car.videoTour,
                carName: car.name,
                thumbnailUrl: car.gallery?.[0] // Use first gallery image as thumbnail
            };
        } catch (error) {
            logger.error('Error in getCarVideoTour service:', error);
            throw error;
        }
    }
}

module.exports = new CarService();
