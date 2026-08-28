/**
 * Budget Repository
 * Data access layer untuk budget operations
 */

const pool = require('../config/database');
const logger = require('../utils/logger');
const { DatabaseError } = require('../utils/errorClasses');

class BudgetRepository {
  async findByUserAndMonth(userId, month, year) {
    try {
      let query = `
        SELECT b.*, c.name as category_name, c.icon as category_icon
        FROM tb_budgets b
        LEFT JOIN tb_categories c ON b.category_id = c.id
        WHERE b.user_id = $1
      `;
      const params = [userId];

      if (month && year) {
        query += ` AND b.month = $${params.length + 1}
                   AND b.year = $${params.length + 2}`;
        params.push(month, year);
      }

      query += " ORDER BY b.year DESC, b.month DESC, c.name ASC";

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching budgets', { userId, month, year, error: error.message });
      throw new DatabaseError('Error fetching budgets', error);
    }
  }

  async findExisting(userId, categoryId, month, year) {
    try {
      const result = await pool.query(
        "SELECT * FROM tb_budgets WHERE user_id = $1 AND category_id = $2 AND month = $3 AND year = $4",
        [userId, categoryId, month, year]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error checking existing budget', { userId, categoryId, month, year, error: error.message });
      throw new DatabaseError('Error checking existing budget', error);
    }
  }

  async create(userId, categoryId, amount, month, year) {
    try {
      const result = await pool.query(
        `INSERT INTO tb_budgets (user_id, category_id, amount, month, year)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [userId, categoryId, amount, month, year]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating budget', { userId, categoryId, amount, month, year, error: error.message });
      throw new DatabaseError('Error creating budget', error);
    }
  }

  async findById(budgetId) {
    try {
      const result = await pool.query(
        "SELECT * FROM tb_budgets WHERE id = $1",
        [budgetId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding budget by id', { budgetId, error: error.message });
      throw new DatabaseError('Error finding budget by id', error);
    }
  }

  async findByIdAndUser(budgetId, userId) {
    try {
      const result = await pool.query(
        "SELECT * FROM tb_budgets WHERE id = $1 AND user_id = $2",
        [budgetId, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding budget by id and user', { budgetId, userId, error: error.message });
      throw new DatabaseError('Error finding budget by id and user', error);
    }
  }

  async update(budgetId, userId, categoryId, amount, month, year) {
    try {
      const result = await pool.query(
        `UPDATE tb_budgets
         SET category_id = $1, amount = $2, month = $3, year = $4
         WHERE id = $5 AND user_id = $6 RETURNING *`,
        [categoryId, amount, month, year, budgetId, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error updating budget', { budgetId, userId, error: error.message });
      throw new DatabaseError('Error updating budget', error);
    }
  }

  async delete(budgetId, userId) {
    try {
      const result = await pool.query(
        "DELETE FROM tb_budgets WHERE id = $1 AND user_id = $2 RETURNING *",
        [budgetId, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error deleting budget', { budgetId, userId, error: error.message });
      throw new DatabaseError('Error deleting budget', error);
    }
  }
}

module.exports = new BudgetRepository();
