const mongoose = require('mongoose');
const { logger } = require('../middleware/error');

const connectDB = async () => {
    try {
        // Skip authentication for test environment
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            serverApi: {
                version: '1',
                strict: true,
                deprecationErrors: true,
            }
        };

        // Use in-memory database for tests without authentication
        const mongoURI = process.env.NODE_ENV === 'test' 
            ? process.env.MONGODB_URI
            : process.env.MONGODB_URI || 'mongodb://localhost:27017/solid-car';

        // Remove all authentication options for test environment
        if (process.env.NODE_ENV === 'test') {
            delete options.auth;
            delete options.authSource;
            delete options.user;
            delete options.pass;
        }

        // Connect to MongoDB
        const conn = await mongoose.connect(mongoURI, options);

        logger.info(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('connected', () => {
            logger.info('Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            logger.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('Mongoose disconnected');
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                logger.info('Mongoose connection closed through app termination');
                process.exit(0);
            } catch (err) {
                logger.error('Error closing Mongoose connection:', err);
                process.exit(1);
            }
        });

    } catch (error) {
        logger.error('MongoDB connection error:', error);
        // Only exit process in non-test environments
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
        throw error; // Re-throw error for test environment
    }
};

module.exports = connectDB;
