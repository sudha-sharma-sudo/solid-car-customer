const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Simulated support tickets storage (in production, use a database)
const tickets = new Map();

// Create a new support ticket
router.post('/', auth, (req, res) => {
    try {
        const { subject, message } = req.body;

        // Validation
        if (!subject || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide both subject and message'
            });
        }

        // Create ticket
        const ticket = {
            id: 'TK' + Math.random().toString(36).substr(2, 9),
            userId: req.user.id,
            subject,
            message,
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            responses: []
        };

        // Save ticket
        tickets.set(ticket.id, ticket);

        res.status(201).json({
            status: 'success',
            data: {
                ticket
            }
        });
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating support ticket'
        });
    }
});

// Get user's tickets
router.get('/', auth, (req, res) => {
    try {
        const userTickets = Array.from(tickets.values())
            .filter(ticket => ticket.userId === req.user.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            status: 'success',
            data: {
                tickets: userTickets,
                total: userTickets.length
            }
        });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching support tickets'
        });
    }
});

// Get ticket by ID
router.get('/:id', auth, (req, res) => {
    try {
        const ticket = tickets.get(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                status: 'error',
                message: 'Ticket not found'
            });
        }

        // Check if ticket belongs to user
        if (ticket.userId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to view this ticket'
            });
        }

        res.json({
            status: 'success',
            data: {
                ticket
            }
        });
    } catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching ticket details'
        });
    }
});

// Add response to ticket
router.post('/:id/respond', auth, (req, res) => {
    try {
        const { message } = req.body;
        const ticket = tickets.get(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                status: 'error',
                message: 'Ticket not found'
            });
        }

        // Check if ticket belongs to user
        if (ticket.userId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to respond to this ticket'
            });
        }

        if (!message) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide a message'
            });
        }

        // Add response
        const response = {
            id: 'RS' + Math.random().toString(36).substr(2, 9),
            userId: req.user.id,
            message,
            createdAt: new Date().toISOString()
        };

        ticket.responses.push(response);
        ticket.updatedAt = new Date().toISOString();
        tickets.set(ticket.id, ticket);

        res.json({
            status: 'success',
            data: {
                ticket
            }
        });
    } catch (error) {
        console.error('Add response error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error adding response'
        });
    }
});

// Close ticket
router.post('/:id/close', auth, (req, res) => {
    try {
        const ticket = tickets.get(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                status: 'error',
                message: 'Ticket not found'
            });
        }

        // Check if ticket belongs to user
        if (ticket.userId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to close this ticket'
            });
        }

        // Update ticket status
        ticket.status = 'closed';
        ticket.closedAt = new Date().toISOString();
        ticket.updatedAt = new Date().toISOString();
        tickets.set(ticket.id, ticket);

        res.json({
            status: 'success',
            data: {
                ticket
            }
        });
    } catch (error) {
        console.error('Close ticket error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error closing ticket'
        });
    }
});

// Reopen ticket
router.post('/:id/reopen', auth, (req, res) => {
    try {
        const ticket = tickets.get(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                status: 'error',
                message: 'Ticket not found'
            });
        }

        // Check if ticket belongs to user
        if (ticket.userId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to reopen this ticket'
            });
        }

        // Update ticket status
        ticket.status = 'open';
        delete ticket.closedAt;
        ticket.updatedAt = new Date().toISOString();
        tickets.set(ticket.id, ticket);

        res.json({
            status: 'success',
            data: {
                ticket
            }
        });
    } catch (error) {
        console.error('Reopen ticket error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error reopening ticket'
        });
    }
});

module.exports = router;
