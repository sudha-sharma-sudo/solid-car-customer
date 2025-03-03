const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const validateJoi = require('../middleware/validateJoi');
const { registerSchema, loginSchema, updateProfileSchema } = require('../middleware/validationSchemas');
const auth = require('../middleware/auth');
const { AppError } = require('../middleware/error');

// 2FA Setup endpoint
router.post('/2fa/setup', auth, async (req, res, next) => {
    try {
        const { secret, qrCode } = await userService.setup2FA(req.user.id);
        res.json({
            status: 'success',
            data: { secret, qrCode }
        });
    } catch (error) {
        next(error);
    }
});

// 2FA Verify endpoint
router.post('/2fa/verify', auth, async (req, res, next) => {
    try {
        const { token } = req.body;
        const verified = await userService.verify2FA(req.user.id, token);
        
        if (!verified) {
            throw new AppError('Invalid 2FA token', 401, 'INVALID_2FA_TOKEN');
        }

        res.json({
            status: 'success',
            message: '2FA verified successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Register endpoint
router.post('/register', validateJoi(registerSchema), async (req, res, next) => {
    try {
        const { user, token } = await userService.register(req.body);

        // Set token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(201).json({
            status: 'success',
            data: { user, token }
        });
    } catch (error) {
        next(error);
    }
});

// Login endpoint
router.post('/login', validateJoi(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await userService.login(email, password);

        // Set token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            status: 'success',
            data: { user, token }
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
        const user = await userService.getUserById(req.user.id);
        res.json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
});

// Update profile endpoint
router.patch('/profile', auth, validateJoi(updateProfileSchema), async (req, res, next) => {
    try {
        const updatedUser = await userService.updateProfile(req.user.id, req.body);
        res.json({
            status: 'success',
            data: { user: updatedUser }
        });
    } catch (error) {
        next(error);
    }
});

// Request password reset endpoint
router.post('/forgot-password', validateJoi(loginSchema), async (req, res, next) => {
    try {
        await userService.requestPasswordReset(req.body.email);
        // Always return success even if email doesn't exist (security best practice)
        res.json({
            status: 'success',
            message: 'If an account exists with this email, you will receive password reset instructions'
        });
    } catch (error) {
        next(error);
    }
});

// Reset password endpoint
router.post('/reset-password/:token', validateJoi(updateProfileSchema), async (req, res, next) => {
    try {
        await userService.resetPassword(req.params.token, req.body.password);
        res.json({
            status: 'success',
            message: 'Password has been reset successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Verify email endpoint
router.get('/verify-email/:token', async (req, res, next) => {
    try {
        await userService.verifyEmail(req.params.token);
        res.json({
            status: 'success',
            message: 'Email verified successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Resend verification email endpoint
router.post('/resend-verification', auth, async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.user.id);
        if (user.verified) {
            throw new AppError('Email is already verified', 400, 'ALREADY_VERIFIED');
        }

        // Generate new verification token and send email
        await userService.sendVerificationEmail(user);
        
        res.json({
            status: 'success',
            message: 'Verification email has been sent'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
