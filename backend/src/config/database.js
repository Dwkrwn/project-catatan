/**
 * Database Configuration
 * PostgreSQL Pool connection setup dengan error handling
 */

const { Pool } = require('pg');
require('dotenv').config();
const logger = require('../utils/logger');

// Create pool connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'db_pencatatan',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456'
});

// Pool event listeners
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', {
    error: err.message,
    code: 'POOL_ERROR'
  });
});

pool.on('connect', () => {
  logger.debug('New client connected to pool');
});

// Graceful shutdown
process.on('exit', async () => {
  logger.info('Closing database pool...');
  await pool.end();
});

// Test connection
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    logger.error('Database connection failed', {
      error: err.message,
      host: process.env.DB_HOST
    });
  } else {
    logger.info('Database connected successfully', {
      timestamp: result.rows[0].now
    });
  }
});

module.exports = pool;
