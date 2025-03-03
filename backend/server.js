const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const config = require('./config/config');
const connectDB = require('./config/database');
const { errorHandler, logger, requestTracker } = require('./middleware/error');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Add request tracking early in middleware chain
app.use(requestTracker);

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.set('trust proxy', 1);

// Enhanced security middleware
app.use(helmet(config.security.helmet));
app.use(cookieParser(config.jwt.secret, {
    httpOnly: true,
    secure: config.server.env === 'production',
    sameSite: config.server.env === 'production' ? 'strict' : 'lax'
}));

// CORS configuration
app.use(cors(config.security.cors));

// Logging middleware
if (config.server.env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Body parser middleware
app.use(express.json({ limit: config.upload.maxSize }));
app.use(express.urlencoded({ extended: true }));

// Enhanced rate limiting
const loginLimiter = rateLimit({
    windowMs: config.security.rateLimit.login.windowMs,
    max: config.security.rateLimit.login.maxAttempts,
    message: {
        status: 'error',
        message: config.security.rateLimit.login.message,
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            requestId: req.id
        });
        res.status(429).json({
            status: 'error',
            message: config.security.rateLimit.login.message,
            code: 'RATE_LIMIT_EXCEEDED'
        });
    }
});

// Global API rate limiting
const apiLimiter = rateLimit({
    windowMs: config.security.rateLimit.api.windowMs,
    max: config.security.rateLimit.api.maxRequests,
    message: {
        status: 'error',
        message: config.security.rateLimit.api.message,
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('API rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            requestId: req.id
        });
        res.status(429).json({
            status: 'error',
            message: config.security.rateLimit.api.message,
            code: 'RATE_LIMIT_EXCEEDED'
        });
    }
});

// Apply rate limiting
app.use('/api/auth/login', loginLimiter);
app.use('/api', apiLimiter);

// CSRF protection
if (config.server.env === 'production') {
    app.use(csrf({ cookie: true }));
    
    // CSRF token middleware
    app.use((req, res, next) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: config.server.env
    });
});

// Enhanced maintenance mode check
app.use((req, res, next) => {
    if (config.features.maintenance && req.path !== '/health') {
        logger.info('Maintenance mode request blocked', {
            path: req.path,
            method: req.method,
            ip: req.ip,
            requestId: req.id
        });
        
        return res.status(503).json({
            status: 'error',
            message: 'Service is temporarily unavailable due to maintenance',
            code: 'MAINTENANCE_MODE',
            estimatedDowntime: config.features.maintenanceEstimatedDuration || 'unknown',
            retryAfter: 300 // 5 minutes
        });
    }
    next();
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/support', require('./routes/support'));

// Serve static files from uploads directory
app.use('/uploads', express.static(config.upload.directory));

// Global error handling middleware
app.use(errorHandler);

// Enhanced 404 handler
app.use((req, res) => {
    logger.warn('Route not found', {
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.id
    });
    
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
        code: 'ROUTE_NOT_FOUND',
        requestId: req.id
    });
});

// Only start the server if we're not in test environment
if (config.server.env !== 'test') {
    const server = app.listen(config.server.port, () => {
        logger.info(`Server is running on port ${config.server.port}`);
        logger.info(`Environment: ${config.server.env}`);
    });

    // Enhanced graceful shutdown
    const gracefulShutdown = async (signal) => {
        logger.info(`Received ${signal}. Starting graceful shutdown...`, {
            activeConnections: server.getConnections ? 
                await new Promise(resolve => server.getConnections((err, count) => resolve(err ? 0 : count))) : 
                'unknown'
        });
        
        try {
            // Close server first
            await new Promise((resolve, reject) => {
                server.close((err) => {
                    if (err) reject(err);
                    logger.info('HTTP server closed');
                    resolve();
                });
            });

            // Then close database connection
            await mongoose.connection.close();
            logger.info('MongoDB connection closed');
            
            // Exit gracefully
            process.exit(0);
        } catch (error) {
            logger.error('Error during shutdown:', error);
            process.exit(1);
        }

        // If everything doesn't close in 10 seconds, force exit
        setTimeout(() => {
            logger.error('Could not close all connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
    };

    // Handle various shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error);
        gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (error) => {
        logger.error('Unhandled Rejection:', error);
        gracefulShutdown('unhandledRejection');
    });
}

module.exports = app;
