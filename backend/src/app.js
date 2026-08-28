<<<<<<< HEAD
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
=======
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'API Catatan Keuangan Berjalan!' });
});

// Handler 404 & error terpusat (harus di akhir)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
>>>>>>> 7f949e20370a5fd93853fbd9d835127005c5b18d
