const authMiddleware = require('../../middleware/auth');
const jwt = require('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      cookies: {},
      header: jest.fn()
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  it('should return 401 if no token is provided', () => {
    authMiddleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Authentication required'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next() if valid token is provided in cookie', () => {
    const token = jwt.sign(
      { id: '123', email: 'test@example.com' },
      process.env.JWT_SECRET || 'test-secret'
    );
    mockReq.cookies.token = token;

    authMiddleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user.id).toBe('123');
    expect(mockReq.user.email).toBe('test@example.com');
  });

  it('should call next() if valid token is provided in header', () => {
    const token = jwt.sign(
      { id: '123', email: 'test@example.com' },
      process.env.JWT_SECRET || 'test-secret'
    );
    mockReq.header.mockReturnValue(`Bearer ${token}`);

    authMiddleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user.id).toBe('123');
    expect(mockReq.user.email).toBe('test@example.com');
  });

  it('should return 401 if token is invalid', () => {
    mockReq.cookies.token = 'invalid-token';

    authMiddleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Invalid authentication token'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token is expired', async () => {
    const token = jwt.sign(
      { id: '123', email: 'test@example.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '0s' }
    );
    mockReq.cookies.token = token;

    // Wait for token to expire
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    authMiddleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Invalid authentication token'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
