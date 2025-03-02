const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    // Get token from cookie or header
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Verify token using environment variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    
    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return res.status(401).json({
        status: 'error',
        message: 'Token has expired'
      });
    }

    next();
  } catch (err) {
    console.error(`Auth middleware error: ${err}`);
    res.status(401).json({
      status: 'error',
      message: 'Invalid authentication token'
    });
  }
}

module.exports = authMiddleware;
