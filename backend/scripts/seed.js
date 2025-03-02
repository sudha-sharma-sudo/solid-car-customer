require('dotenv').config({ path: '.env.development' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config/config');
const { logger } = require('../middleware/error');

const users = [
  {
    fullName: 'Admin User',
    email: 'admin@solidcar.com',
    password: 'Admin123!@#',
    phone: '+1-555-000-0000',
    membershipLevel: 'Platinum',
    verified: true
  },
  {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    password: 'JohnDoe123!@#',
    phone: '+1-555-111-1111',
    membershipLevel: 'Gold',
    verified: true
  },
  {
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'JaneSmith123!@#',
    phone: '+1-555-222-2222',
    membershipLevel: 'Silver',
    verified: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.uri, config.database.options);
    logger.info('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    logger.info('Cleared existing data');

    // Hash passwords and create users
    const userPromises = users.map(async user => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      return User.create({
        ...user,
        password: hashedPassword,
        memberSince: new Date(),
        preferences: {
          notifications: {
            email: true,
            sms: true
          },
          newsletter: true
        }
      });
    });

    await Promise.all(userPromises);
    logger.info('Sample users created successfully');

    // Add any other seed data here (cars, bookings, etc.)

    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();

// Handle process termination
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  });
});
