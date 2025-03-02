// Set test environment
process.env.NODE_ENV = 'test';

// Load environment variables for testing
require('dotenv').config({
  path: '.env.test'
});

// Global test setup
beforeAll(async () => {
  // Add any global setup needed before running tests
  // For example: database connection, test data setup, etc.
});

// Global test teardown
afterAll(async () => {
  // Add any cleanup needed after running tests
  // For example: close database connections, cleanup test data, etc.
});

// Add global test utilities
global.createTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: userId, email: 'test@example.com' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};
