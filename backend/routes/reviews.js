const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Simulated reviews storage (in production, use a database)
const reviews = new Map();

// Create a new review
router.post('/', auth, (req, res) => {
    try {
        const { carId, rating, reviewTitle, reviewText } = req.body;

        // Validation
        if (!carId || !rating || !reviewText) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide all required fields'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                status: 'error',
                message: 'Rating must be between 1 and 5'
            });
        }

        // Create review
        const review = {
            id: 'RV' + Math.random().toString(36).substr(2, 9),
            userId: req.user.id,
            carId,
            rating,
            reviewTitle: reviewTitle || '',
            reviewText,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save review
        reviews.set(review.id, review);

        res.status(201).json({
            status: 'success',
            data: {
                review
            }
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating review'
        });
    }
});

// Get reviews for a car
router.get('/car/:carId', auth, (req, res) => {
    try {
        const carReviews = Array.from(reviews.values())
            .filter(review => review.carId === req.params.carId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Calculate average rating
        const totalRating = carReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = carReviews.length > 0 ? totalRating / carReviews.length : 0;

        res.json({
            status: 'success',
            data: {
                reviews: carReviews,
                total: carReviews.length,
                averageRating: Math.round(averageRating * 10) / 10
            }
        });
    } catch (error) {
        console.error('Get car reviews error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching reviews'
        });
    }
});

// Get user's reviews
router.get('/user', auth, (req, res) => {
    try {
        const userReviews = Array.from(reviews.values())
            .filter(review => review.userId === req.user.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            status: 'success',
            data: {
                reviews: userReviews,
                total: userReviews.length
            }
        });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching reviews'
        });
    }
});

// Update a review
router.put('/:id', auth, (req, res) => {
    try {
        const review = reviews.get(req.params.id);

        if (!review) {
            return res.status(404).json({
                status: 'error',
                message: 'Review not found'
            });
        }

        // Check if review belongs to user
        if (review.userId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to update this review'
            });
        }

        const { rating, reviewTitle, reviewText } = req.body;

        // Validation
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                status: 'error',
                message: 'Rating must be between 1 and 5'
            });
        }

        // Update review
        const updatedReview = {
            ...review,
            rating: rating || review.rating,
            reviewTitle: reviewTitle || review.reviewTitle,
            reviewText: reviewText || review.reviewText,
            updatedAt: new Date().toISOString()
        };

        // Save updated review
        reviews.set(review.id, updatedReview);

        res.json({
            status: 'success',
            data: {
                review: updatedReview
            }
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating review'
        });
    }
});

// Delete a review
router.delete('/:id', auth, (req, res) => {
    try {
        const review = reviews.get(req.params.id);

        if (!review) {
            return res.status(404).json({
                status: 'error',
                message: 'Review not found'
            });
        }

        // Check if review belongs to user
        if (review.userId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to delete this review'
            });
        }

        // Delete review
        reviews.delete(req.params.id);

        res.json({
            status: 'success',
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting review'
        });
    }
});

module.exports = router;
