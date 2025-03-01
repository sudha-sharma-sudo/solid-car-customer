const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Simulated bookings storage (in production, use a database)
const bookings = new Map();

// Create a new booking
router.post('/', auth, (req, res) => {
    try {
        const { 
            carId,
            pickupLocation, 
            pickupDate, 
            returnDate, 
            insurance, 
            gps, 
            childSeat 
        } = req.body;

        // Validation
        if (!carId || !pickupLocation || !pickupDate || !returnDate) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide all required fields'
            });
        }

        // Create booking
        const booking = {
            id: 'BK' + Math.random().toString(36).substr(2, 9),
            userId: req.user.id,
            carId,
            pickupLocation,
            pickupDate,
            returnDate,
            insurance: Boolean(insurance),
            gps: Boolean(gps),
            childSeat: Boolean(childSeat),
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };

        // Save booking
        bookings.set(booking.id, booking);

        res.status(201).json({
            status: 'success',
            data: {
                booking
            }
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating booking'
        });
    }
});

// Get user's bookings
router.get('/', auth, (req, res) => {
    try {
        const userBookings = Array.from(bookings.values())
            .filter(booking => booking.userId === req.user.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            status: 'success',
            data: {
                bookings: userBookings
            }
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching bookings'
        });
    }
});

// Get booking by ID
router.get('/:id', auth, (req, res) => {
    try {
        const booking = bookings.get(req.params.id);

        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: 'Booking not found'
            });
        }

        // Check if booking belongs to user
        if (booking.userId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to view this booking'
            });
        }

        res.json({
            status: 'success',
            data: {
                booking
            }
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching booking details'
        });
    }
});

// Cancel booking
router.post('/:id/cancel', auth, (req, res) => {
    try {
        const booking = bookings.get(req.params.id);

        if (!booking) {
            return res.status(404).json({
                status: 'error',
                message: 'Booking not found'
            });
        }

        // Check if booking belongs to user
        if (booking.userId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to cancel this booking'
            });
        }

        // Update booking status
        booking.status = 'cancelled';
        booking.cancelledAt = new Date().toISOString();
        bookings.set(booking.id, booking);

        res.json({
            status: 'success',
            data: {
                booking
            }
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error cancelling booking'
        });
    }
});

module.exports = router;
