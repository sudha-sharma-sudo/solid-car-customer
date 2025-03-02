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
const { errorHandler, logger } = require('./middleware/error');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cookieParser());

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

// Rate limiting
const loginLimiter = rateLimit({
    windowMs: config.security.rateLimit.windowMs,
    max: config.security.rateLimit.maxAttempts,
    message: {
        status: 'error',
        message: 'Too many login attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    }
});

// Apply rate limiting to auth routes
app.use('/api/auth/login', loginLimiter);

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

// Maintenance mode check
app.use((req, res, next) => {
    if (config.features.maintenance && req.path !== '/health') {
        return res.status(503).json({
            status: 'error',
            message: 'Service is temporarily unavailable due to maintenance',
            code: 'MAINTENANCE_MODE'
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

// Handle 404 routes
app.use((req, res) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
        code: 'ROUTE_NOT_FOUND'
    });
});

// Only start the server if we're not in test environment
if (config.server.env !== 'test') {
    const server = app.listen(config.server.port, () => {
        logger.info(`Server is running on port ${config.server.port}`);
        logger.info(`Environment: ${config.server.env}`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = async (signal) => {
        logger.info(`Received ${signal}. Starting graceful shutdown...`);
        
        // Close server
        server.close(() => {
            logger.info('HTTP server closed');
            
            // Close database connection
            mongoose.connection.close(false, () => {
                logger.info('MongoDB connection closed');
                process.exit(0);
            });

            // If database doesn't close in 5 seconds, force exit
            setTimeout(() => {
                logger.error('Could not close MongoDB connection, forcefully shutting down');
                process.exit(1);
            }, 5000);
        });

        // If server doesn't close in 10 seconds, force exit
        setTimeout(() => {
            logger.error('Could not close server in time, forcefully shutting down');
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
