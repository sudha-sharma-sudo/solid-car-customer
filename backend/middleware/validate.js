const { validationResult, query, param } = require('express-validator');
const { AppError } = require('./error');

// Middleware to check validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors.array());
  }
  next();
};

// Validation rules for getting cars list
const validateGetCars = [
  query('type').optional().isIn(['electric', 'hybrid', 'sports']).withMessage('Invalid car type'),
  query('price').optional().isIn(['budget', 'mid', 'premium', 'luxury']).withMessage('Invalid price range'),
  query('transmission').optional().isIn(['automatic', 'manual']).withMessage('Invalid transmission type'),
  query('features').optional().isString().withMessage('Invalid feature'),
  query('search').optional().isString().trim().withMessage('Invalid search query'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort').optional().isIn(['price_asc', 'price_desc', 'rating', 'reviews']).withMessage('Invalid sort parameter'),
  validateRequest
];

// Validation rules for getting car by ID
const validateGetCarById = [
  param('id').isString().trim().notEmpty().withMessage('Car ID is required'),
  validateRequest
];

module.exports = {
  validateGetCars,
  validateGetCarById
};
