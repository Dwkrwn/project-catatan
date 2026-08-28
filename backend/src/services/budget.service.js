/**
 * Budget Service
 * Business logic untuk budget operations
 */

const logger = require('../utils/logger');
const budgetRepository = require('../repositories/budget.repository');
const { ValidationError, NotFoundError, ConflictError, ServiceError } = require('../utils/errorClasses');
const messages = require('../constants/messages');

class BudgetService {
  /**
   * Get budgets berdasarkan bulan dan tahun
   */
  async getBudgets(userId, month, year) {
    try {
      logger.info('Fetching budgets', { userId, month, year });

      const budgets = await budgetRepository.findByUserAndMonth(userId, month, year);

      logger.info('Budgets fetched successfully', { userId, count: budgets.length });

      return budgets;

    } catch (error) {
      logger.error('Error fetching budgets', { userId, month, year, error: error.message });
      throw error;
    }
  }

  /**
   * Add budget baru
   */
  async addBudget(userId, categoryId, amount, month, year) {
    try {
      logger.info('Adding new budget', { userId, categoryId, amount, month, year });

      // Check apakah budget sudah ada untuk kategori ini di bulan/tahun tersebut
      const existing = await budgetRepository.findExisting(userId, categoryId, month, year);

      if (existing) {
        logger.warn('Budget already exists', { userId, categoryId, month, year });
        throw new ConflictError(
          messages.BUDGET.ALREADY_EXISTS,
          'BUDGET_ALREADY_EXISTS'
        );
      }

      // Create budget
      const budget = await budgetRepository.create(userId, categoryId, amount, month, year);

      logger.info('Budget created successfully', { budgetId: budget.id, userId, categoryId });

      return budget;

    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }

      logger.error('Error adding budget', { userId, categoryId, error: error.message });
      throw error;
    }
  }

  /**
   * Update budget
   */
  async updateBudget(userId, budgetId, categoryId, amount, month, year) {
    try {
      logger.info('Updating budget', { userId, budgetId, categoryId, amount, month, year });

      // Check apakah budget exists
      const existing = await budgetRepository.findByIdAndUser(budgetId, userId);

      if (!existing) {
        logger.warn('Budget not found', { budgetId, userId });
        throw new NotFoundError(
          messages.BUDGET.NOT_FOUND,
          'BUDGET_NOT_FOUND'
        );
      }

      // Update dengan nilai baru atau keep existing
      const updatedBudget = await budgetRepository.update(
        budgetId,
        userId,
        categoryId || existing.category_id,
        amount || existing.amount,
        month !== undefined ? month : existing.month,
        year || existing.year
      );

      logger.info('Budget updated successfully', { budgetId, userId });

      return updatedBudget;

    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Error updating budget', { userId, budgetId, error: error.message });
      throw error;
    }
  }

  /**
   * Delete budget
   */
  async deleteBudget(userId, budgetId) {
    try {
      logger.info('Deleting budget', { userId, budgetId });

      const deletedBudget = await budgetRepository.delete(budgetId, userId);

      if (!deletedBudget) {
        logger.warn('Budget not found for deletion', { budgetId, userId });
        throw new NotFoundError(
          messages.BUDGET.NOT_FOUND,
          'BUDGET_NOT_FOUND'
        );
      }

      logger.info('Budget deleted successfully', { budgetId, userId });

      return deletedBudget;

    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Error deleting budget', { userId, budgetId, error: error.message });
      throw error;
    }
  }
}

module.exports = new BudgetService();
