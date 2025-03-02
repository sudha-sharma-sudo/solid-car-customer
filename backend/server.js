require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Initialize express app
const app = express();

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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
