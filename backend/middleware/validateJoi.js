const { ValidationError } = require('./error');

/**
 * Creates middleware that validates request data against a Joi schema
 * @param {Object} schema - Joi schema to validate against
 * @param {string} source - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const validateJoi = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source]);

        if (error) {
            // Transform Joi validation errors into our custom format
            const validationErrors = error.details.reduce((acc, detail) => {
                const key = detail.path.join('.');
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(detail.message);
                return acc;
            }, {});

            throw new ValidationError('Validation failed', {
                errors: validationErrors,
                fields: Object.keys(validationErrors),
                count: error.details.length
            });
        }

        // Replace request data with validated and sanitized data
        req[source] = value;
        next();
    };
};

module.exports = validateJoi;
