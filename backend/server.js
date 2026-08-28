<<<<<<< HEAD
/**
 * Server Entry Point
 * Initialize dan start Express server
 */

require('dotenv').config();
const createApp = require('./src/app');
const logger = require('./src/utils/logger');
const envConfig = require('./src/config/env');

// Create app instance
const app = createApp();

// Start server
const server = app.listen(envConfig.PORT, () => {
  logger.info(`Server berjalan di http://localhost:${envConfig.PORT}`, {
    environment: envConfig.NODE_ENV,
    port: envConfig.PORT
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at Promise', { reason, promise });
  process.exit(1);
});

module.exports = server;
=======
require('dotenv').config();
require('./src/server');
>>>>>>> 7f949e20370a5fd93853fbd9d835127005c5b18d
