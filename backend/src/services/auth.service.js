/**
 * Auth Service
 * Business logic untuk authentication (register, login)
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const userRepository = require('../repositories/user.repository');
const { ValidationError, AuthError, ConflictError, ServiceError } = require('../utils/errorClasses');
const messages = require('../constants/messages');
const envConfig = require('../config/env');

class AuthService {
  /**
   * Register user baru
   */
  async register(username, email, password) {
    try {
      logger.info('User registration attempt', { username, email });

      // Cek apakah user sudah ada
      const existingUsers = await userRepository.findByEmailOrUsername(email, username);

      if (existingUsers.length > 0) {
        logger.warn('User already exists', { username, email });
        throw new ConflictError(
          messages.AUTH.USER_ALREADY_EXISTS,
          'USER_ALREADY_EXISTS'
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user baru
      const newUser = await userRepository.create(username, email, hashedPassword);

      logger.info('User registered successfully', { userId: newUser.id, username, email });

      return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      };

    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }

      logger.error('Error during registration', { username, email, error: error.message });
      throw new ServiceError('Error during registration', error);
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      logger.info('User login attempt', { email });

      // Cari user berdasarkan email
      const user = await userRepository.findByEmail(email);

      if (!user) {
        logger.warn('Login failed - user not found', { email });
        throw new AuthError(
          messages.AUTH.INVALID_CREDENTIALS,
          'INVALID_CREDENTIALS'
        );
      }

      // Verifikasi password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        logger.warn('Login failed - invalid password', { email });
        throw new AuthError(
          messages.AUTH.INVALID_CREDENTIALS,
          'INVALID_CREDENTIALS'
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        envConfig.JWT_SECRET,
        { expiresIn: envConfig.JWT_EXPIRY }
      );

      logger.info('User logged in successfully', { userId: user.id, email });

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      };

    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      logger.error('Error during login', { email, error: error.message });
      throw new ServiceError('Error during login', error);
    }
  }
}

module.exports = new AuthService();
