/**
 * User Repository
 * Data access layer untuk user operations
 */

const pool = require('../config/database');
const logger = require('../utils/logger');
const { DatabaseError } = require('../utils/errorClasses');

class UserRepository {
  async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM tb_users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by email', { email, error: error.message });
      throw new DatabaseError('Error finding user by email', error);
    }
  }

  async findByUsername(username) {
    try {
      const result = await pool.query(
        'SELECT * FROM tb_users WHERE username = $1',
        [username]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by username', { username, error: error.message });
      throw new DatabaseError('Error finding user by username', error);
    }
  }

  async findByEmailOrUsername(email, username) {
    try {
      const result = await pool.query(
        'SELECT * FROM tb_users WHERE email = $1 OR username = $2',
        [email, username]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error finding user', { email, username, error: error.message });
      throw new DatabaseError('Error finding user', error);
    }
  }

  async create(username, email, hashedPassword) {
    try {
      const result = await pool.query(
        'INSERT INTO tb_users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hashedPassword]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating user', { username, email, error: error.message });
      throw new DatabaseError('Error creating user', error);
    }
  }

  async findById(userId) {
    try {
      const result = await pool.query(
        'SELECT id, username, email FROM tb_users WHERE id = $1',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding user by id', { userId, error: error.message });
      throw new DatabaseError('Error finding user by id', error);
    }
  }
}

module.exports = new UserRepository();
