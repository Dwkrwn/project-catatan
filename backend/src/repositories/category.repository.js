/**
 * Category Repository
 * Data access layer untuk category operations
 */

const pool = require('../config/database');
const logger = require('../utils/logger');
const { DatabaseError } = require('../utils/errorClasses');

class CategoryRepository {
  async findByUserOrDefault(userId) {
    try {
      const result = await pool.query(
        `SELECT * FROM tb_categories
         WHERE user_id IS NULL OR user_id = $1
         ORDER BY type, name`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching categories', { userId, error: error.message });
      throw new DatabaseError('Error fetching categories', error);
    }
  }

  async create(name, type, icon, userId) {
    try {
      const result = await pool.query(
        "INSERT INTO tb_categories (name, type, icon, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, type, icon, userId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating category', { name, type, userId, error: error.message });
      throw new DatabaseError('Error creating category', error);
    }
  }

  async findByIdAndUser(categoryId, userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM tb_categories WHERE id = $1 AND user_id = $2',
        [categoryId, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding category by id and user', { categoryId, userId, error: error.message });
      throw new DatabaseError('Error finding category by id and user', error);
    }
  }

  async delete(categoryId, userId) {
    try {
      const result = await pool.query(
        'DELETE FROM tb_categories WHERE id = $1 AND user_id = $2 RETURNING *',
        [categoryId, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error deleting category', { categoryId, userId, error: error.message });
      throw new DatabaseError('Error deleting category', error);
    }
  }
}

module.exports = new CategoryRepository();
