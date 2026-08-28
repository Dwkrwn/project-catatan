/**
 * Logger Utility
 * Structured logging untuk semua aplikasi
 */

const logger = {
  info: (message, data = {}) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  },

  error: (message, data = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      ...data,
      stack: data.error?.stack || data.stack
    }));
  },

  warn: (message, data = {}) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  },

  debug: (message, data = {}) => {
    if (process.env.DEBUG === 'true') {
      console.log(JSON.stringify({
        level: 'DEBUG',
        timestamp: new Date().toISOString(),
        message,
        ...data
      }));
    }
  }
};

module.exports = logger;
