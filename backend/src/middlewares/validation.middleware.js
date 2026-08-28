/**
 * Request Validation Middleware
 * Middleware untuk validate request body menggunakan validation schema
 */

const logger = require('../utils/logger');

/**
 * Factory function untuk membuat validation middleware
 * @param {Function} validateFn - Function yang melakukan validasi dan throw error jika invalid
 * @returns {Function} Express middleware
 */
const validateRequest = (validateFn) => {
  return (req, res, next) => {
    try {
      logger.debug('Validating request', { 
        endpoint: req.path,
        method: req.method 
      });

      // Validate dan assign ke req.validated
      req.validated = validateFn(req.body);
      
      logger.debug('Validation passed', { 
        endpoint: req.path 
      });

      next();
    } catch (error) {
      // Error dari validasi akan di-catch di error middleware
      next(error);
    }
  };
};

/**
 * Factory function untuk validate query parameters
 * @param {Function} validateFn - Function yang melakukan validasi query
 * @returns {Function} Express middleware
 */
const validateQuery = (validateFn) => {
  return (req, res, next) => {
    try {
      logger.debug('Validating query', { 
        endpoint: req.path,
        query: req.query
      });

      req.validated = validateFn(req.query);
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validateRequest,
  validateQuery
};
