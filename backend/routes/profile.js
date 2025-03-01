const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Reference to users Map from auth.js (in production, this would be a database)
const users = require('./auth').users;

// Update user profile
router.put('/', auth, async (req, res) => {
    try {
        const { fullName, email, phone, currentPassword, newPassword } = req.body;
        const user = users.get(req.user.email);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // If updating email, check if new email already exists
        if (email && email !== user.email && users.has(email)) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already in use'
            });
        }

        // If changing password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Current password is required to set new password'
                });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Update user data
        const updatedUser = {
            ...user,
            fullName: fullName || user.fullName,
            email: email || user.email,
            phone: phone || user.phone,
            updatedAt: new Date().toISOString()
        };

        // If email changed, update the Map key
        if (email && email !== user.email) {
            users.delete(user.email);
            users.set(email, updatedUser);
        } else {
            users.set(user.email, updatedUser);
        }

        // Return updated user data (without password)
        const { password: _, ...userData } = updatedUser;
        res.json({
            status: 'success',
            data: {
                user: userData
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating profile'
        });
    }
});

// Get user profile
router.get('/', auth, (req, res) => {
    try {
        const user = users.get(req.user.email);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Return user data without password
        const { password: _, ...userData } = user;
        res.json({
            status: 'success',
            data: {
                user: userData
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching profile'
        });
    }
});

// Delete user account
router.delete('/', auth, async (req, res) => {
    try {
        const { password } = req.body;
        const user = users.get(req.user.email);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Verify password
        if (!password) {
            return res.status(400).json({
                status: 'error',
                message: 'Password is required to delete account'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid password'
            });
        }

        // Delete user
        users.delete(user.email);

        res.json({
            status: 'success',
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting account'
        });
    }
});

module.exports = router;
