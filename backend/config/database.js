const mongoose = require('mongoose');
const { logger } = require('../middleware/error');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solid-car';
        
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        };

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
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
