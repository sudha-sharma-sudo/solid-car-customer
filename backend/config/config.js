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
        refreshToken: {
            secret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
        },
        issuer: process.env.JWT_ISSUER || 'solid-car-api',
        audience: process.env.JWT_AUDIENCE || 'solid-car-client',
        cookieOptions: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            domain: process.env.COOKIE_DOMAIN || 'localhost'
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
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
        rateLimit: {
            login: {
                windowMs: parseInt(process.env.LOGIN_WINDOW_MS) || 900000, // 15 minutes
                maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
                message: 'Too many login attempts, please try again later'
            },
            api: {
                windowMs: parseInt(process.env.API_WINDOW_MS) || 60000, // 1 minute
                maxRequests: parseInt(process.env.MAX_API_REQUESTS) || 100,
                message: 'Too many requests, please try again later'
            }
        },
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:8000',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            exposedHeaders: ['X-Total-Count', 'X-Request-ID']
        },
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", 'data:', 'https:'],
                    scriptSrc: ["'self'"],
                    fontSrc: ["'self'", 'https:', 'data:'],
                    objectSrc: ["'none'"],
                    upgradeInsecureRequests: []
                }
            },
            crossOriginEmbedderPolicy: true,
            crossOriginOpenerPolicy: true,
            crossOriginResourcePolicy: { policy: "same-site" },
            frameguard: { action: 'deny' }
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
        format: process.env.LOG_FORMAT || 'json',
        files: {
            error: 'logs/error.log',
            combined: 'logs/combined.log',
            access: 'logs/access.log'
        },
        options: {
            maxSize: '5m',
            maxFiles: 5,
            tailable: true,
            zippedArchive: true
        },
        morgan: {
            format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
            options: {
                skip: (req, res) => process.env.NODE_ENV === 'test'
            }
        },
        excludePaths: ['/health', '/metrics']
    },

    // Cache configuration
    cache: {
        ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour in seconds
        checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 600 // 10 minutes in seconds
    },

    // Feature flags and toggles
    features: {
        emailVerification: process.env.FEATURE_EMAIL_VERIFICATION !== 'false',
        socialLogin: process.env.FEATURE_SOCIAL_LOGIN === 'true',
        maintenance: process.env.MAINTENANCE_MODE === 'true',
        reCaptcha: process.env.FEATURE_RECAPTCHA === 'true',
        twoFactorAuth: process.env.FEATURE_2FA === 'true',
        darkMode: process.env.FEATURE_DARK_MODE !== 'false',
        analytics: process.env.FEATURE_ANALYTICS === 'true',
        notifications: {
            email: process.env.FEATURE_EMAIL_NOTIFICATIONS !== 'false',
            push: process.env.FEATURE_PUSH_NOTIFICATIONS === 'true',
            sms: process.env.FEATURE_SMS_NOTIFICATIONS === 'true'
        }
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
