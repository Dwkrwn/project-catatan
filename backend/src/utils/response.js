/**
 * Response Formatter
 * Standardized response format untuk semua endpoints
 */

const response = {
  success: (data = null, message = 'Success') => ({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  }),

  error: (code, message, details = null) => ({
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    },
    timestamp: new Date().toISOString()
  }),

  paginated: (data = [], total = 0, page = 1, limit = 10, message = 'Success') => ({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    timestamp: new Date().toISOString()
  })
};

module.exports = response;
