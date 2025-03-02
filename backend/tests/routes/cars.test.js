const request = require('supertest');
const app = require('../../server');
const jwt = require('jsonwebtoken');

describe('Cars Routes', () => {
  let authToken;

  beforeEach(() => {
    // Create a test token
    authToken = jwt.sign(
      { id: 'test-user', email: 'test@example.com' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('GET /api/cars/options', () => {
    it('should return available car options', async () => {
      const response = await request(app)
        .get('/api/cars/options')
        .set('Cookie', [`token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('types');
      expect(response.body.data).toHaveProperty('priceRanges');
      expect(response.body.data).toHaveProperty('features');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/cars/options');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/cars', () => {
    it('should return paginated list of cars', async () => {
      const response = await request(app)
        .get('/api/cars')
        .set('Cookie', [`token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.cars).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter cars by type', async () => {
      const response = await request(app)
        .get('/api/cars?type=electric')
        .set('Cookie', [`token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.cars.every(car => car.type === 'electric')).toBe(true);
    });

    it('should filter cars by price range', async () => {
      const response = await request(app)
        .get('/api/cars?price=luxury')
        .set('Cookie', [`token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.cars.every(car => car.price >= 121)).toBe(true);
    });

    it('should sort cars by price', async () => {
      const response = await request(app)
        .get('/api/cars?sort=price_asc')
        .set('Cookie', [`token=${authToken}`]);

      expect(response.status).toBe(200);
      const prices = response.body.data.cars.map(car => car.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/cars?page=1&limit=2')
        .set('Cookie', [`token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.data.cars.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination.page).toBe(1);
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/cars?type=invalid')
        .set('Cookie', [`token=${authToken}`]);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/cars/:id', () => {
    it('should return car details for valid ID', async () => {
      const response = await request(app)
        .get('/api/cars/tesla-model-3')
        .set('Cookie', [`token=${authToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.car.id).toBe('tesla-model-3');
    });

    it('should return 404 for invalid car ID', async () => {
      const response = await request(app)
        .get('/api/cars/invalid-id')
        .set('Cookie', [`token=${authToken}`]);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('CAR_NOT_FOUND');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/cars/tesla-model-3');

      expect(response.status).toBe(401);
    });
  });
});
