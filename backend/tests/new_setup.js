const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports = {
  async setup() {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Initialize database connection with no authentication
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auth: undefined,
      authSource: undefined,
      user: undefined,
      pass: undefined
    });

    // Verify connection
    if (!mongoose.connection.db) {
      throw new Error('Failed to establish database connection');
    }
  },

  async teardown() {
    await mongoose.disconnect();
    await mongoServer.stop();
  },

  async clearDatabase() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};
