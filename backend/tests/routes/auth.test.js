const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    const validUser = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      terms: true
    };

    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toHaveProperty('email', validUser.email);
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data).toHaveProperty('token');

      // Verify user was saved to database
      const user = await User.findOne({ email: validUser.email });
      expect(user).toBeTruthy();
      expect(user.fullName).toBe(validUser.fullName);
    });

    it('should not register user with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validUser);

      // Second registration with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('USER_EXISTS');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should validate password requirements', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          password: 'weak',
          confirmPassword: 'weak'
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should validate terms acceptance', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          terms: false
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'TestPassword123!',
          confirmPassword: 'TestPassword123!',
          terms: true
        });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'TestPassword123!',
          confirmPassword: 'TestPassword123!',
          terms: true
        });

      token = res.body.data.token;
    });

    it('should get current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should not get profile without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('should not get profile with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('UNAUTHORIZED');
    });
  });
});
