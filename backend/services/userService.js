const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AppError } = require('../middleware/error');

class UserService {
    /**
     * Register a new user
     */
    async register(userData) {
        const { email } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('User already exists', 400, 'USER_EXISTS');
        }

        // Create verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Create new user
        const user = new User({
            ...userData,
            verificationToken,
            verificationTokenExpires
        });

        // Save user
        await user.save();

        // Generate JWT
        const token = this.generateToken(user);

        // Return user data without sensitive information
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.verificationToken;
        delete userResponse.verificationTokenExpires;

        return {
            user: userResponse,
            token
        };
    }

    /**
     * Login user
     */
    async login(email, password) {
        // Find user with password
        const user = await User.findByEmail(email);
        
        if (!user) {
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Check if account is locked
        if (user.isLocked()) {
            throw new AppError('Account is locked. Try again later', 423, 'ACCOUNT_LOCKED');
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Increment login attempts
            await User.incrementLoginAttempts(email);
            throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Reset login attempts on successful login
        await User.resetLoginAttempts(email);

        // Generate token
        const token = this.generateToken(user);

        // Return user data without password
        const userResponse = user.toObject();
        delete userResponse.password;

        return {
            user: userResponse,
            token
        };
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }
        return user;
    }

    /**
     * Update user profile
     */
    async updateProfile(userId, updateData) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404, 'USER_NOT_FOUND');
        }

        // If updating password, verify current password
        if (updateData.newPassword) {
            const isMatch = await user.comparePassword(updateData.currentPassword);
            if (!isMatch) {
                throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
            }
            user.password = updateData.newPassword;
        }

        // Update allowed fields
        const allowedUpdates = ['fullName', 'phone', 'preferences'];
        allowedUpdates.forEach(field => {
            if (updateData[field] !== undefined) {
                user[field] = updateData[field];
            }
        });

        await user.save();

        // Return updated user without sensitive information
        const userResponse = user.toObject();
        delete userResponse.password;
        return userResponse;
    }

    /**
     * Verify email
     */
    async verifyEmail(token) {
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new AppError('Invalid or expired verification token', 400, 'INVALID_TOKEN');
        }

        user.verified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        return true;
    }

    /**
     * Request password reset
     */
    async requestPasswordReset(email) {
        const user = await User.findOne({ email });
        
        // Don't reveal if user exists
        if (!user) return true;

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

        await user.save();

        return resetToken;
    }

    /**
     * Reset password
     */
    async resetPassword(token, newPassword) {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return true;
    }

    /**
     * Generate JWT token
     */
    generateToken(user) {
        return jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
    }
}

module.exports = new UserService();
