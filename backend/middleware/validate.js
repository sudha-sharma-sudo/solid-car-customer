const { validationResult, query, param, body } = require('express-validator');
const { ValidationError } = require('./error');

// Enhanced validation result checker
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const validationErrors = errors.array().reduce((acc, error) => {
            if (!acc[error.param]) {
                acc[error.param] = [];
            }
            acc[error.param].push(error.msg);
            return acc;
        }, {});

        throw new ValidationError('Validation failed', {
            errors: validationErrors,
            fields: Object.keys(validationErrors),
            count: errors.array().length
        });
    }
    next();
};

// Common validation chains
const commonValidators = {
    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer')
            .toInt(),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 50 })
            .withMessage('Limit must be between 1 and 50')
            .toInt()
    ],
    sorting: [
        query('sort')
            .optional()
            .isIn(['price_asc', 'price_desc', 'rating', 'reviews', 'power', 'featured'])
            .withMessage('Invalid sort parameter')
    ],
    carId: [
        param('id')
            .isString()
            .trim()
            .notEmpty()
            .withMessage('Car ID is required')
            .matches(/^[a-zA-Z0-9-]+$/)
            .withMessage('Invalid car ID format')
    ]
};

// Enhanced validation rules for getting cars list
const validateGetCars = [
    query('type')
        .optional()
        .isIn(['electric', 'hybrid', 'sports'])
        .withMessage('Invalid car type'),
    query('price')
        .optional()
        .isIn(['budget', 'mid', 'premium', 'luxury'])
        .withMessage('Invalid price range'),
    query('transmission')
        .optional()
        .isIn(['automatic', 'manual'])
        .withMessage('Invalid transmission type'),
    query('features')
        .optional()
        .isString()
        .trim()
        .customSanitizer(value => value.split(','))
        .custom(features => {
            const validFeatures = [
                'Electric', 'Hybrid', 'GPS', 'Bluetooth', 'Leather',
                'Autopilot', 'Sport Mode', 'Premium Sound', 'Panoramic Roof'
            ];
            return features.every(feature => validFeatures.includes(feature));
        })
        .withMessage('One or more invalid features specified'),
    query('search')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Search query must be at least 2 characters long'),
    query('featured')
        .optional()
        .isBoolean()
        .withMessage('Featured must be a boolean value'),
    query('status')
        .optional()
        .isIn(['available', 'premium', 'reserved', 'maintenance'])
        .withMessage('Invalid status value'),
    ...commonValidators.pagination,
    ...commonValidators.sorting,
    validateRequest
];

// Enhanced validation rules for getting car by ID
const validateGetCarById = [
    ...commonValidators.carId,
    query('details')
        .optional()
        .isBoolean()
        .withMessage('Details parameter must be a boolean value'),
    validateRequest
];

// Validation rules for getting featured cars
const validateGetFeaturedCars = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Limit must be between 1 and 10')
        .toInt(),
    validateRequest
];

// Validation rules for getting car specifications
const validateGetCarSpecifications = [
    ...commonValidators.carId,
    validateRequest
];

// Validation rules for getting car video tour
const validateGetCarVideoTour = [
    ...commonValidators.carId,
    validateRequest
];

// Validation rules for booking a car
const validateBookCar = [
    body('carId')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Car ID is required')
        .matches(/^[a-zA-Z0-9-]+$/)
        .withMessage('Invalid car ID format'),
    body('startDate')
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date')
        .custom(value => new Date(value) >= new Date())
        .withMessage('Start date must be in the future'),
    body('endDate')
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date')
        .custom((value, { req }) => new Date(value) > new Date(req.body.startDate))
        .withMessage('End date must be after start date'),
    body('pickupLocation')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Pickup location is required'),
    body('dropoffLocation')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Dropoff location is required'),
    validateRequest
];

// Validation rules for creating a review
const validateCreateReview = [
    body('carId')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Car ID is required')
        .matches(/^[a-zA-Z0-9-]+$/)
        .withMessage('Invalid car ID format'),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('comment')
        .isString()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Comment must be between 10 and 500 characters'),
    validateRequest
];

module.exports = {
    validateGetCars,
    validateGetCarById,
    validateGetFeaturedCars,
    validateGetCarSpecifications,
    validateGetCarVideoTour,
    validateBookCar,
    validateCreateReview,
    validateRequest,
    commonValidators
};
