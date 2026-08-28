/**
 * Transaction Repository
 * Data access layer untuk transaction operations
 */

const pool = require('../config/database');
const logger = require('../utils/logger');
const { DatabaseError } = require('../utils/errorClasses');

class TransactionRepository {
  async findByUserAndMonth(userId, month, year) {
    try {
      let query = `SELECT t.*, c.name as category_name, c.icon as category_icon
            FROM tb_transactions t LEFT JOIN tb_categories c ON t.category_id = c.id
            WHERE t.user_id = $1 `;

      const params = [userId];

      if (month && year) {
        query += ` AND EXTRACT(MONTH FROM t.transaction_date) = $${params.length + 1}
            AND EXTRACT(YEAR FROM t.transaction_date) = $${params.length + 2}`;
        params.push(month, year);
      }

      query += " ORDER BY t.transaction_date DESC, t.created_at DESC";

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching transactions', { userId, month, year, error: error.message });
      throw new DatabaseError('Error fetching transactions', error);
    }
  }

  async create(userId, categoryId, type, amount, description, transactionDate) {
    try {
      const result = await pool.query(
        `INSERT INTO tb_transactions (user_id, category_id, type, amount, description, transaction_date)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, categoryId, type, amount, description, transactionDate]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating transaction', { userId, type, amount, error: error.message });
      throw new DatabaseError('Error creating transaction', error);
    }
  }

  async findByIdAndUser(transactionId, userId) {
    try {
      const result = await pool.query(
        `SELECT * FROM tb_transactions WHERE id = $1 AND user_id = $2`,
        [transactionId, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding transaction by id and user', { transactionId, userId, error: error.message });
      throw new DatabaseError('Error finding transaction by id and user', error);
    }
  }

  async update(transactionId, userId, categoryId, type, amount, description, transactionDate) {
    try {
      const result = await pool.query(
        `UPDATE tb_transactions
        SET category_id = $1, type = $2, amount = $3, description = $4, transaction_date = $5
        WHERE id = $6 AND user_id = $7 RETURNING *`,
        [categoryId, type, amount, description, transactionDate, transactionId, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error updating transaction', { transactionId, userId, error: error.message });
      throw new DatabaseError('Error updating transaction', error);
    }
  }

  async delete(transactionId, userId) {
    try {
      const result = await pool.query(
        "DELETE FROM tb_transactions WHERE id = $1 AND user_id = $2 RETURNING *",
        [transactionId, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error deleting transaction', { transactionId, userId, error: error.message });
      throw new DatabaseError('Error deleting transaction', error);
    }
  }

  async sumByType(userId, type, month, year) {
    try {
      const result = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM tb_transactions
         WHERE user_id = $1 AND type = $2
         AND EXTRACT(MONTH FROM transaction_date) = $3
         AND EXTRACT(YEAR FROM transaction_date) = $4`,
        [userId, type, month, year]
      );
      return parseFloat(result.rows[0].total);
    } catch (error) {
      logger.error('Error calculating sum by type', { userId, type, month, year, error: error.message });
      throw new DatabaseError('Error calculating sum by type', error);
    }
  }

  async calculateBalance(userId) {
    try {
      const result = await pool.query(
        `SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as balance
         FROM tb_transactions
         WHERE user_id = $1`,
        [userId]
      );
      return parseFloat(result.rows[0].balance);
    } catch (error) {
      logger.error('Error calculating balance', { userId, error: error.message });
      throw new DatabaseError('Error calculating balance', error);
    }
  }

  async sumByCategory(userId, month, year) {
    try {
      const result = await pool.query(
        `SELECT
          c.name as category_name,
          c.icon,
          COALESCE(SUM(t.amount), 0) as total,
          COUNT(t.id) as transaction_count
         FROM tb_categories c
         LEFT JOIN tb_transactions t ON c.id = t.category_id
             AND EXTRACT(MONTH FROM t.transaction_date) = $2
             AND EXTRACT(YEAR FROM t.transaction_date) = $3
             AND t.user_id = $1
             AND t.type = 'expense'
         WHERE c.type = 'expense' AND (c.user_id IS NULL OR c.user_id = $1)
         GROUP BY c.id, c.name, c.icon
         HAVING COALESCE(SUM(t.amount), 0) > 0
         ORDER BY total DESC`,
        [userId, month, year]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error summing by category', { userId, month, year, error: error.message });
      throw new DatabaseError('Error summing by category', error);
    }
  }
}

module.exports = new TransactionRepository();
