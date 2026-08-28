/**
 * Environment Configuration
 * Validation dan setup environment variables
 */

require('dotenv').config();

const requiredEnvs = [
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET'
];

// Validate required environment variables
const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

if (missingEnvs.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvs.join(', ')}\n` +
    `Please check your .env file`
  );
}

// Export environment configuration
const envConfig = {
  // Server
  PORT: parseInt(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DB: {
    HOST: process.env.DB_HOST,
    PORT: parseInt(process.env.DB_PORT),
    NAME: process.env.DB_NAME,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD
  },

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',

  // Debug
  DEBUG: process.env.DEBUG === 'true'
};

module.exports = envConfig;
