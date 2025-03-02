const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
    // Server configuration
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8000',
        apiUrl: process.env.API_URL || 'http://localhost:3000'
    },

    // Database configuration
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/solid-car',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        }
    },

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        cookieOptions: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    },

    // Email configuration
    email: {
        host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
        port: process.env.EMAIL_PORT || 2525,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        from: process.env.EMAIL_FROM || 'Solid Car <noreply@solidcar.com>',
        templates: {
            verificationEmail: {
                subject: 'Verify your email address',
                tokenExpiry: '24h'
            },
            passwordReset: {
                subject: 'Reset your password',
                tokenExpiry: '1h'
            }
        }
    },

    // Security configuration
    security: {
        bcryptRounds: 10,
        rateLimit: {
            windowMs: parseInt(process.env.LOGIN_WINDOW_MS) || 900000, // 15 minutes
            maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5
        },
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:8000',
            credentials: true
        }
    },

    // File upload configuration
    upload: {
        maxSize: process.env.MAX_FILE_SIZE || '5mb',
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        directory: path.join(__dirname, '../uploads')
    },

    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        files: {
            error: 'error.log',
            combined: 'combined.log'
        }
    },

    // Cache configuration
    cache: {
        ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour in seconds
        checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 600 // 10 minutes in seconds
    },

    // Feature flags
    features: {
        emailVerification: process.env.FEATURE_EMAIL_VERIFICATION !== 'false',
        socialLogin: process.env.FEATURE_SOCIAL_LOGIN === 'true',
        maintenance: process.env.MAINTENANCE_MODE === 'true'
    },

    // Business rules
    rules: {
        booking: {
            maxActiveBookings: parseInt(process.env.MAX_ACTIVE_BOOKINGS) || 3,
            minAdvanceHours: parseInt(process.env.MIN_ADVANCE_BOOKING_HOURS) || 24,
            maxAdvanceDays: parseInt(process.env.MAX_ADVANCE_BOOKING_DAYS) || 30
        },
        membership: {
            levels: ['Bronze', 'Silver', 'Gold', 'Platinum'],
            pointsPerBooking: parseInt(process.env.POINTS_PER_BOOKING) || 100
        }
    }
};

// Validate required environment variables
const requiredEnvVars = [
    'JWT_SECRET',
    'MONGODB_URI'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = config;
