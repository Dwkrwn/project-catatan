/**
 * Global Error Handler Middleware
 * Menangani semua error dari application dan convert ke response format yang consistent
 */

const logger = require('../utils/logger');
const response = require('../utils/response');
const { AppError, ValidationError, AuthError, NotFoundError } = require('../utils/errorClasses');

const errorHandler = (err, req, res, next) => {
  // Log error dengan context
  logger.error('Request error', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    userId: req.user?.id,
    endpoint: req.path,
    method: req.method,
    body: req.body,
    stack: err.stack
  });

  // Handle known AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      response.error(err.code, err.message, err.details)
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      response.error('INVALID_TOKEN', 'Token tidak valid')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      response.error('TOKEN_EXPIRED', 'Token sudah expired')
    );
  }

  // Handle Database errors
  if (err.code === 'ECONNREFUSED') {
    return res.status(500).json(
      response.error('DATABASE_ERROR', 'Database tidak dapat diakses')
    );
  }

  // Handle generic errors
  res.status(500).json(
    response.error('INTERNAL_ERROR', 'Terjadi error pada server')
  );
};

module.exports = errorHandler;
