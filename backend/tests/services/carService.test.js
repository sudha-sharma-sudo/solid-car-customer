const carService = require('../../services/carService');

describe('Car Service', () => {
  describe('getCars', () => {
    it('should return all cars when no filters are applied', async () => {
      const result = await carService.getCars();
      expect(result.cars).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.cars.length).toBeGreaterThan(0);
    });

    it('should filter cars by type', async () => {
      const result = await carService.getCars({ type: 'electric' });
      expect(result.cars.every(car => car.type === 'electric')).toBe(true);
    });

    it('should filter cars by price range', async () => {
      const result = await carService.getCars({ price: 'luxury' });
      expect(result.cars.every(car => car.price >= 121)).toBe(true);
    });

    it('should filter cars by transmission', async () => {
      const result = await carService.getCars({ transmission: 'automatic' });
      expect(result.cars.every(car => car.transmission === 'automatic')).toBe(true);
    });

    it('should filter cars by features', async () => {
      const result = await carService.getCars({ features: 'GPS' });
      expect(result.cars.every(car => car.features.includes('GPS'))).toBe(true);
    });

    it('should search cars by name, category, or features', async () => {
      const result = await carService.getCars({ search: 'tesla' });
      expect(result.cars.some(car => 
        car.name.toLowerCase().includes('tesla') ||
        car.category.toLowerCase().includes('tesla') ||
        car.features.some(f => f.toLowerCase().includes('tesla'))
      )).toBe(true);
    });

    it('should sort cars by price ascending', async () => {
      const result = await carService.getCars({ sort: 'price_asc' });
      const prices = result.cars.map(car => car.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('should sort cars by rating', async () => {
      const result = await carService.getCars({ sort: 'rating' });
      const ratings = result.cars.map(car => car.rating);
      expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
    });

    it('should paginate results', async () => {
      const page = 1;
      const limit = 2;
      const result = await carService.getCars({ page, limit });
      expect(result.cars.length).toBeLessThanOrEqual(limit);
      expect(result.pagination.page).toBe(page);
      expect(result.pagination.hasMore).toBeDefined();
    });
  });

  describe('getCarById', () => {
    it('should return a car when valid ID is provided', async () => {
      const car = await carService.getCarById('tesla-model-3');
      expect(car).toBeDefined();
      expect(car.id).toBe('tesla-model-3');
    });

    it('should return null for invalid car ID', async () => {
      const car = await carService.getCarById('invalid-id');
      expect(car).toBeNull();
    });
  });

  describe('Helper Methods', () => {
    it('should return available car types', () => {
      const types = carService.getCarTypes();
      expect(types).toContain('electric');
      expect(types).toContain('hybrid');
      expect(types).toContain('sports');
    });

    it('should return available price ranges', () => {
      const ranges = carService.getPriceRanges();
      expect(ranges).toContain('budget');
      expect(ranges).toContain('luxury');
    });

    it('should return all unique features', () => {
      const features = carService.getAvailableFeatures();
      expect(features).toContain('GPS');
      expect(features).toContain('Bluetooth');
    });
  });
});
