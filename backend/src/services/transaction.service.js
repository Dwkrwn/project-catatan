/**
 * Transaction Service
 * Business logic untuk transaction operations
 */

const logger = require('../utils/logger');
const transactionRepository = require('../repositories/transaction.repository');
const { NotFoundError, ServiceError } = require('../utils/errorClasses');
const messages = require('../constants/messages');

class TransactionService {
  /**
   * Get transactions berdasarkan bulan dan tahun
   */
  async getTransactions(userId, month, year) {
    try {
      logger.info('Fetching transactions', { userId, month, year });

      const transactions = await transactionRepository.findByUserAndMonth(userId, month, year);

      logger.info('Transactions fetched successfully', { userId, count: transactions.length });

      return transactions;

    } catch (error) {
      logger.error('Error fetching transactions', { userId, month, year, error: error.message });
      throw error;
    }
  }

  /**
   * Add transaction baru
   */
  async addTransaction(userId, categoryId, type, amount, description, date) {
    try {
      logger.info('Adding new transaction', { userId, type, amount });

      const transaction = await transactionRepository.create(
        userId,
        categoryId,
        type,
        amount,
        description,
        date || new Date()
      );

      logger.info('Transaction created successfully', { transactionId: transaction.id, userId, type, amount });

      return transaction;

    } catch (error) {
      logger.error('Error adding transaction', { userId, type, amount, error: error.message });
      throw error;
    }
  }

  /**
   * Update transaction
   */
  async updateTransaction(userId, transactionId, categoryId, type, amount, description, date) {
    try {
      logger.info('Updating transaction', { userId, transactionId });

      // Check apakah transaction exists
      const existing = await transactionRepository.findByIdAndUser(transactionId, userId);

      if (!existing) {
        logger.warn('Transaction not found', { transactionId, userId });
        throw new NotFoundError(
          messages.TRANSACTION.NOT_FOUND,
          'TRANSACTION_NOT_FOUND'
        );
      }

      // Update dengan nilai baru atau keep existing
      const updatedTransaction = await transactionRepository.update(
        transactionId,
        userId,
        categoryId || existing.category_id,
        type || existing.type,
        amount || existing.amount,
        description !== undefined ? description : existing.description,
        date || existing.transaction_date
      );

      logger.info('Transaction updated successfully', { transactionId, userId });

      return updatedTransaction;

    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Error updating transaction', { userId, transactionId, error: error.message });
      throw error;
    }
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(userId, transactionId) {
    try {
      logger.info('Deleting transaction', { userId, transactionId });

      const deletedTransaction = await transactionRepository.delete(transactionId, userId);

      if (!deletedTransaction) {
        logger.warn('Transaction not found for deletion', { transactionId, userId });
        throw new NotFoundError(
          messages.TRANSACTION.NOT_FOUND,
          'TRANSACTION_NOT_FOUND'
        );
      }

      logger.info('Transaction deleted successfully', { transactionId, userId });

      return deletedTransaction;

    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Error deleting transaction', { userId, transactionId, error: error.message });
      throw error;
    }
  }

  /**
   * Get transaction summary (income, expense, balance)
   */
  async getSummary(userId, month, year) {
    try {
      logger.info('Calculating transaction summary', { userId, month, year });

      const currentMonth = month || new Date().getMonth() + 1;
      const currentYear = year || new Date().getFullYear();

      // Get totals
      const totalIncome = await transactionRepository.sumByType(userId, 'income', currentMonth, currentYear);
      const totalExpense = await transactionRepository.sumByType(userId, 'expense', currentMonth, currentYear);
      const balance = await transactionRepository.calculateBalance(userId);

      const summary = {
        month: currentMonth,
        year: currentYear,
        totalIncome,
        totalExpense,
        balance,
        netIncome: totalIncome - totalExpense
      };

      logger.info('Transaction summary calculated successfully', { userId, summary });

      return summary;

    } catch (error) {
      logger.error('Error calculating summary', { userId, month, year, error: error.message });
      throw error;
    }
  }

  /**
   * Get expense breakdown by category
   */
  async getExpenseByCategory(userId, month, year) {
    try {
      logger.info('Calculating expense by category', { userId, month, year });

      const currentMonth = month || new Date().getMonth() + 1;
      const currentYear = year || new Date().getFullYear();

      const categories = await transactionRepository.sumByCategory(userId, currentMonth, currentYear);

      const result = {
        month: currentMonth,
        year: currentYear,
        categories
      };

      logger.info('Expense by category calculated successfully', { userId, count: categories.length });

      return result;

    } catch (error) {
      logger.error('Error calculating expense by category', { userId, month, year, error: error.message });
      throw error;
    }
  }
}

module.exports = new TransactionService();
