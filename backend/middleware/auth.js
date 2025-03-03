const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { AuthenticationError, logger } = require('./error');

/**
 * Authentication middleware that verifies JWT tokens
 * @param {Object} options - Configuration options
 * @param {boolean} options.optional - If true, allows requests without tokens
 * @param {string[]} options.roles - Required roles for access
 */
function authMiddleware(options = {}) {
    return async (req, res, next) => {
        try {
            // Get token from cookie or header
            const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

            // Handle optional authentication
            if (!token && options.optional) {
                return next();
            }

            if (!token) {
                throw new AuthenticationError('Authentication token is required');
            }

            try {
                // Verify token
                const decoded = jwt.verify(token, config.jwt.secret, {
                    algorithms: ['HS256'], // Explicitly specify allowed algorithms
                    issuer: config.jwt.issuer,
                    audience: config.jwt.audience
                });

                // Check token expiration
                const now = Math.floor(Date.now() / 1000);
                if (decoded.exp && decoded.exp < now) {
                    throw new AuthenticationError('Token has expired');
                }

                // Check if token is not valid before its "not before" time
                if (decoded.nbf && decoded.nbf > now) {
                    throw new AuthenticationError('Token not yet valid');
                }

                // Verify required roles if specified
                if (options.roles && options.roles.length > 0) {
                    const userRoles = decoded.roles || [];
                    const hasRequiredRole = options.roles.some(role => 
                        userRoles.includes(role)
                    );
                    
                    if (!hasRequiredRole) {
                        throw new AuthenticationError('Insufficient permissions');
                    }
                }

                // Add user info to request
                req.user = {
                    id: decoded.sub, // Use 'sub' claim for user ID
                    email: decoded.email,
                    roles: decoded.roles || [],
                    // Add any other relevant user info from token
                };

                // Add token info to request for potential refresh logic
                req.token = {
                    exp: decoded.exp,
                    iat: decoded.iat
                };

                next();
            } catch (jwtError) {
                // Handle specific JWT errors
                if (jwtError.name === 'JsonWebTokenError') {
                    throw new AuthenticationError('Invalid token format');
                } else if (jwtError.name === 'TokenExpiredError') {
                    throw new AuthenticationError('Token has expired');
                } else if (jwtError.name === 'NotBeforeError') {
                    throw new AuthenticationError('Token not yet valid');
                }
                throw jwtError;
            }
        } catch (error) {
            // Log the error with context
            logger.error({
                message: 'Authentication failed',
                error: error.message,
                stack: error.stack,
                path: req.path,
                method: req.method,
                ip: req.ip
            });

            next(error);
        }
    };
}

// Helper function to create middleware for specific roles
authMiddleware.requireRoles = (...roles) => {
    return authMiddleware({ roles });
};

// Helper function for optional authentication
authMiddleware.optional = () => {
    return authMiddleware({ optional: true });
};

module.exports = authMiddleware;
