const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateGetCars, validateGetCarById } = require('../middleware/validate');
const carService = require('../services/carService');
const { AppError, logger } = require('../middleware/error');

// Get metadata about available car options
router.get('/options', auth, (req, res) => {
    try {
        const options = {
            types: carService.getCarTypes(),
            priceRanges: carService.getPriceRanges(),
            features: carService.getAvailableFeatures()
        };

        res.json({
            status: 'success',
            data: options
        });
    } catch (error) {
        next(error);
    }
});

// Get all cars with filtering, sorting, and pagination
router.get('/', auth, validateGetCars, async (req, res, next) => {
    try {
        const filters = {
            type: req.query.type,
            price: req.query.price,
            transmission: req.query.transmission,
            features: req.query.features,
            search: req.query.search,
            sort: req.query.sort,
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        };

        const result = await carService.getCars(filters);

        res.json({
            status: 'success',
            data: {
                cars: result.cars,
                pagination: result.pagination
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get car by ID
router.get('/:id', auth, validateGetCarById, async (req, res, next) => {
    try {
        const car = await carService.getCarById(req.params.id);
        
        if (!car) {
            throw new AppError('Car not found', 404, 'CAR_NOT_FOUND');
        }

        res.json({
            status: 'success',
            data: {
                car
            }
        });
    } catch (error) {
        next(error);
    }
});

// Error handling middleware specific to cars routes
router.use((err, req, res, next) => {
    // Log the error using the logger
    logger.error('Cars route error:', { 
        message: err.message,
        code: err.code || 'UNKNOWN_ERROR',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Handle validation errors
    if (err.array && typeof err.array === 'function') {
        return res.status(400).json({
            status: 'error',
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            errors: err.array()
        });
    }

    // If it's our custom error, use its status code
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            code: err.code,
            message: err.message,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        });
    }

    // For other errors, return 500
    res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error'
    });
});

module.exports = router;
