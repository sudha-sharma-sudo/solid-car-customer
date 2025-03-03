const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    validateGetCars, 
    validateGetCarById, 
    validateGetFeaturedCars,
    validateGetCarSpecifications,
    validateGetCarVideoTour
} = require('../middleware/validate');
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

// Get all cars with enhanced filtering, sorting, and pagination
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
            limit: parseInt(req.query.limit) || 10,
            featured: req.query.featured === 'true',
            status: req.query.status
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

// Get featured cars
router.get('/featured', auth, validateGetFeaturedCars, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const featuredCars = await carService.getFeaturedCars(limit);

        res.json({
            status: 'success',
            data: {
                cars: featuredCars
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get car by ID with optional detailed view
router.get('/:id', auth, validateGetCarById, async (req, res, next) => {
    try {
        const includeDetails = req.query.details === 'true';
        const car = await carService.getCarById(req.params.id, includeDetails);
        
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

// Get car specifications
router.get('/:id/specifications', auth, validateGetCarSpecifications, async (req, res, next) => {
    try {
        const specifications = await carService.getCarSpecifications(req.params.id);
        
        if (!specifications) {
            throw new AppError('Car specifications not found', 404, 'SPECIFICATIONS_NOT_FOUND');
        }

        res.json({
            status: 'success',
            data: {
                specifications
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get car video tour
router.get('/:id/video-tour', auth, validateGetCarVideoTour, async (req, res, next) => {
    try {
        const videoTour = await carService.getCarVideoTour(req.params.id);
        
        if (!videoTour) {
            throw new AppError('Video tour not available', 404, 'VIDEO_TOUR_NOT_FOUND');
        }

        res.json({
            status: 'success',
            data: {
                videoTour
            }
        });
    } catch (error) {
        next(error);
    }
});

// Enhanced error handling middleware specific to cars routes
router.use((err, req, res, next) => {
    // Log the error with additional context
    logger.error('Cars route error:', { 
        message: err.message,
        code: err.code || 'UNKNOWN_ERROR',
        path: req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        userId: req.user?.id,
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
