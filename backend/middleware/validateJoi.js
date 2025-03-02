const { AppError } = require('./error');

const validateJoi = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessages = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));

            throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errorMessages);
        }

        next();
    };
};

module.exports = validateJoi;
