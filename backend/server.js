require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const { errorHandler, logger } = require('./middleware/error');

// Initialize express app
const app = express();

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true
}));

// Logging middleware
app.use(morgan('dev'));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const loginLimiter = rateLimit({
    windowMs: parseInt(process.env.LOGIN_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    message: {
        status: 'error',
        message: 'Too many login attempts. Please try again later.'
    }
});

// Apply rate limiting to auth routes
app.use('/api/auth/login', loginLimiter);

// CSRF protection
app.use(csrf({ cookie: true }));

// CSRF token middleware
app.use((req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/support', require('./routes/support'));

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

const PORT = process.env.PORT || 3000;

// Only start the server if we're not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error);
        // Gracefully shutdown
        process.exit(1);
    });

    process.on('unhandledRejection', (error) => {
        logger.error('Unhandled Rejection:', error);
        // Gracefully shutdown
        process.exit(1);
    });
}

module.exports = app;
