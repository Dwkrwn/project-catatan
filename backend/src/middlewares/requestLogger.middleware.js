/**
 * Request Logger Middleware
 * Log semua incoming requests
 */

const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    method: req.method,
    endpoint: req.path,
    ip: req.ip,
    userId: req.user?.id
  });

  // Override res.json to log response
  const originalJson = res.json.bind(res);

  res.json = (data) => {
    const duration = Date.now() - startTime;

    logger.info('Outgoing response', {
      method: req.method,
      endpoint: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id
    });

    return originalJson(data);
  };

  next();
};

module.exports = requestLogger;
