/**
 * Express App Setup
 * Konfigurasi Express app dengan semua middleware dan routes
 * App ini exportable untuk testing tanpa listen
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const setupRoutes = require('./routes');
const requestLogger = require('./middlewares/requestLogger.middleware');
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

/**
 * Create Express app
 * @returns {Object} Express app instance
 */
function createApp() {
  const app = express();

  // Middleware global
  app.use(express.json());
  app.use(cors());
  app.use(requestLogger);

  logger.info('Express app initialized');

  // Setup routes
  setupRoutes(app);

  // Error handling middleware (harus paling akhir)
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
