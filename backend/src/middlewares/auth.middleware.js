/**
 * Authentication Middleware
 * Verify JWT token dan extract user information
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { AuthError } = require('../utils/errorClasses');
const messages = require('../constants/messages');
const envConfig = require('../config/env');

const authMiddleware = (req, res, next) => {
  try {
    // Extract token dari header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header', {
        endpoint: req.path,
        method: req.method
      });
      throw new AuthError(
        messages.AUTH.TOKEN_NOT_FOUND,
        'MISSING_TOKEN'
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, envConfig.JWT_SECRET);
    req.user = decoded;

    logger.debug('User authenticated', { userId: decoded.id });
    next();

  } catch (error) {
    // Handle JWT specific errors
    if (error.name === 'TokenExpiredError') {
      logger.warn('Token expired', {
        endpoint: req.path,
        expiredAt: error.expiredAt
      });
      return next(
        new AuthError(
          'Token sudah expired',
          'TOKEN_EXPIRED'
        )
      );
    }

    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid token', {
        endpoint: req.path,
        error: error.message
      });
      return next(
        new AuthError(
          messages.AUTH.INVALID_TOKEN,
          'INVALID_TOKEN'
        )
      );
    }

    // Pass other errors
    next(error);
  }
};

module.exports = authMiddleware;
