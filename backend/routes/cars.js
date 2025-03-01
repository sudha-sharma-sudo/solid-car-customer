const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Sample car data (in production, this would come from a database)
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

// Get all cars with filtering
router.get('/', auth, (req, res) => {
    try {
        let filteredCars = [...carsData];
        const { type, price, transmission, features, search } = req.query;

        // Apply type filter
        if (type) {
            filteredCars = filteredCars.filter(car => car.type === type);
        }

        // Apply price range filter
        if (price) {
            const priceRanges = {
                'budget': [30, 50],
                'mid': [51, 80],
                'premium': [81, 120],
                'luxury': [121, Infinity]
            };
            const range = priceRanges[price];
            if (range) {
                filteredCars = filteredCars.filter(car => 
                    car.price >= range[0] && car.price <= range[1]
                );
            }
        }

        // Apply transmission filter
        if (transmission) {
            filteredCars = filteredCars.filter(car => 
                car.transmission === transmission
            );
        }

        // Apply features filter
        if (features) {
            filteredCars = filteredCars.filter(car => 
                car.features.includes(features)
            );
        }

        // Apply search filter
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

        res.json({
            status: 'success',
            data: {
                cars: filteredCars,
                total: filteredCars.length
            }
        });
    } catch (error) {
        console.error('Get cars error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching cars'
        });
    }
});

// Get car by ID
router.get('/:id', auth, (req, res) => {
    try {
        const car = carsData.find(c => c.id === req.params.id);
        
        if (!car) {
            return res.status(404).json({
                status: 'error',
                message: 'Car not found'
            });
        }

        res.json({
            status: 'success',
            data: {
                car
            }
        });
    } catch (error) {
        console.error('Get car error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching car details'
        });
    }
});

module.exports = router;
