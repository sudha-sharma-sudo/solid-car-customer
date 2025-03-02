const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/error');
const validateJoi = require('../middleware/validateJoi');
const { registerSchema, loginSchema } = require('../middleware/validationSchemas');
const auth = require('../middleware/auth');

// Simulated user storage (in production, use a database)
const users = new Map();

// Register endpoint
router.post('/register', validateJoi(registerSchema), async (req, res, next) => {
    try {
        const { fullName, email, password, phone } = req.body;

        if (users.has(email)) {
            throw new AppError('User already exists', 400, 'USER_EXISTS');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = {
            id: Date.now().toString(),
            fullName,
            email,
            password: hashedPassword,
            phone: phone || '',
            memberSince: new Date().toISOString(),
            membershipLevel: 'Bronze',
            verified: false
        };

        // Save user
        users.set(email, user);

        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Set token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Return user data (without password) and token
        const { password: _, ...userData } = user;
        res.status(201).json({
            status: 'success',
            data: {
                user: userData,
                token
            }
        });
    } catch (error) {
        next(error);
    }
});

// Login endpoint
router.post('/login', validateJoi(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = users.get(email);
        if (!user) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Set token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Return user data (without password) and token
        const { password: _, ...userData } = user;
        res.json({
            status: 'success',
            data: {
                user: userData,
                token
            }
        });
    } catch (error) {
        next(error);
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    res.json({
        status: 'success',
        message: 'Logged out successfully'
    });
});

// Get current user endpoint
router.get('/me', auth, async (req, res, next) => {
    try {
        const user = users.get(req.user.email);
        if (!user) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        const { password, ...userData } = user;
        res.json({
            status: 'success',
            data: {
                user: userData
            }
        });
    } catch (error) {
        next(error);
    }
});

// Password reset request endpoint
router.post('/forgot-password', validateJoi(Joi.object({
    email: Joi.string().email().required()
})), async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = users.get(email);

        // Always return success even if email doesn't exist (security best practice)
        res.json({
            status: 'success',
            message: 'If an account exists with this email, you will receive password reset instructions'
        });

        // In a real application, you would:
        // 1. Generate a password reset token
        // 2. Save it to the database with an expiration
        // 3. Send an email with the reset link
    } catch (error) {
        next(error);
    }
});

// Email verification endpoint
router.post('/verify-email', auth, async (req, res, next) => {
    try {
        const user = users.get(req.user.email);
        if (!user) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        // In a real application, you would:
        // 1. Verify the email verification token
        // 2. Update the user's verified status
        user.verified = true;
        users.set(req.user.email, user);

        res.json({
            status: 'success',
            message: 'Email verified successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
