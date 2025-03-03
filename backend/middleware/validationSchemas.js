const Joi = require('joi');

// Custom Joi extensions
const JoiPhone = Joi.extend((joi) => ({
    type: 'phone',
    base: joi.string(),
    messages: {
        'phone.invalid': 'Please provide a valid phone number'
    },
    validate(value, helpers) {
        if (!value.match(/^\+?[1-9]\d{1,14}$/)) {
            return { value, errors: helpers.error('phone.invalid') };
        }
        return { value };
    }
}));

// Common patterns and constants
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const CAR_ID_PATTERN = /^[a-zA-Z0-9-]+$/;
const LOCATION_PATTERN = /^[a-zA-Z0-9\s,.-]{5,100}$/;

// Common schema objects
const passwordSchema = {
    min: 8,
    max: 100,
    pattern: PASSWORD_PATTERN,
    messages: {
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 100 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
};

const registerSchema = Joi.object({
    fullName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name cannot exceed 50 characters',
            'any.required': 'Full name is required'
        }),
    
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email address is required'
        }),
    
    password: Joi.string()
        .min(8)
        .max(100)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password cannot exceed 100 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'any.required': 'Password is required'
        }),
    
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Password confirmation is required'
        }),
    
    phone: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .allow('')
        .optional()
        .messages({
            'string.pattern.base': 'Please provide a valid phone number'
        }),

    terms: Joi.boolean()
        .valid(true)
        .required()
        .messages({
            'any.only': 'You must accept the terms and conditions',
            'any.required': 'Terms acceptance is required'
        })
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email address is required'
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

const updateProfileSchema = Joi.object({
    fullName: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name cannot exceed 50 characters'
        }),
    
    phone: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .allow('')
        .optional()
        .messages({
            'string.pattern.base': 'Please provide a valid phone number'
        }),
    
    currentPassword: Joi.string()
        .when('newPassword', {
            is: Joi.exist(),
            then: Joi.required(),
            otherwise: Joi.optional()
        })
        .messages({
            'any.required': 'Current password is required when changing password'
        }),
    
    newPassword: Joi.string()
        .min(8)
        .max(100)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .optional()
        .messages({
            'string.min': 'New password must be at least 8 characters long',
            'string.max': 'New password cannot exceed 100 characters',
            'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        })
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema
};
