const winston = require('winston');
const config = require('../config/config');

// Error codes enum
const ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    INVALID_REQUEST: 'INVALID_REQUEST'
};

// Performance monitoring
const startTime = Symbol('requestStartTime');

// Configure winston logger with enhanced format and monitoring
const logger = winston.createLogger({
    level: config.logging?.level || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.metadata(),
        winston.format.printf(({ timestamp, level, message, metadata, stack }) => {
            const requestId = metadata.requestId || 'no-request-id';
            const userId = metadata.userId || 'no-user';
            const duration = metadata.duration || '';
            const performanceInfo = duration ? ` [duration: ${duration}ms]` : '';
            
            return `${timestamp} [${requestId}] [${userId}] ${level}: ${message}${performanceInfo}${stack ? '\n' + stack : ''}`;
        })
    ),
    defaultMeta: { service: 'solid-car-api' },
    transports: [
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: 'logs/performance.log',
            level: 'info',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Request tracking middleware
const requestTracker = (req, res, next) => {
    // Generate unique request ID
    req.id = req.id || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Start performance tracking
    req[startTime] = process.hrtime();

    // Log request start
    logger.info(`Incoming ${req.method} request to ${req.path}`, {
        requestId: req.id,
        userId: req.user?.id,
        method: req.method,
        path: req.path,
        query: req.query,
        userAgent: req.get('user-agent')
    });

    // Track response
    res.on('finish', () => {
        const duration = calculateDuration(req[startTime]);
        logger.info(`Completed ${req.method} ${req.path} with status ${res.statusCode}`, {
            requestId: req.id,
            userId: req.user?.id,
            duration,
            statusCode: res.statusCode
        });

        // Log performance metrics for slower requests
        if (duration > 1000) { // Log requests taking more than 1 second
            logger.warn(`Slow request detected`, {
                requestId: req.id,
                userId: req.user?.id,
                duration,
                path: req.path,
                method: req.method
            });
        }
    });

    next();
};

// Helper function to calculate request duration
const calculateDuration = (start) => {
    const diff = process.hrtime(start);
    return Math.round((diff[0] * 1e9 + diff[1]) / 1e6); // Convert to milliseconds
};

// Central error handling middleware
const errorHandler = (err, req, res, next) => {
    const duration = calculateDuration(req[startTime]);
    
    // Log the error with enhanced context
    logger.error({
        message: err.message,
        errorCode: err.code,
        stack: err.stack,
        request: {
            id: req.id,
            path: req.path,
            method: req.method,
            query: req.query,
            params: req.params,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            duration
        },
        user: req.user?.id,
        timestamp: new Date().toISOString()
    });

    // Determine status code and error details
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;
    
    // Determine user-facing message
    let message = err.message;
    if (process.env.NODE_ENV === 'production') {
        message = statusCode === 500 ? 
            'An internal server error occurred' : 
            err.message;
    }

    // Send error response
    res.status(statusCode).json({
        status: 'error',
        message,
        code: errorCode,
        timestamp: new Date().toISOString(),
        requestId: req.id, // Assuming request ID middleware is used
        ...(process.env.NODE_ENV !== 'production' && { 
            stack: err.stack,
            details: err.details // Additional error details if available
        })
    });

    // Notify monitoring service for critical errors
    if (statusCode === 500) {
        // TODO: Integrate with monitoring service (e.g., Sentry)
        // notifyMonitoringService(err);
    }
};

// Custom error classes
class AppError extends Error {
    constructor(message, statusCode, code, details = {}) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.status = 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, details = {}) {
        super(message, 400, ERROR_CODES.VALIDATION_ERROR, details);
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401, ERROR_CODES.AUTHENTICATION_ERROR);
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Not authorized to access this resource') {
        super(message, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
}

class ResourceNotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }
}

class DuplicateResourceError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} already exists`, 409, ERROR_CODES.DUPLICATE_RESOURCE);
    }
}

// Monitor system resources
const monitorSystem = () => {
    const used = process.memoryUsage();
    logger.info('System resources', {
        memory: {
            heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
            heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
            rss: Math.round(used.rss / 1024 / 1024 * 100) / 100
        },
        cpu: process.cpuUsage()
    });
};

// Start system monitoring (every 5 minutes)
setInterval(monitorSystem, 300000);

module.exports = {
    errorHandler,
    requestTracker,
    AppError,
    logger,
    ERROR_CODES,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    ResourceNotFoundError,
    DuplicateResourceError
};
