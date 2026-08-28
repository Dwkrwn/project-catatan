/**
 * Category Service
 * Business logic untuk category operations
 */

const logger = require('../utils/logger');
const categoryRepository = require('../repositories/category.repository');
const { NotFoundError, ServiceError } = require('../utils/errorClasses');
const messages = require('../constants/messages');

class CategoryService {
  /**
   * Get semua categories (default + user custom)
   */
  async getCategories(userId) {
    try {
      logger.info('Fetching categories', { userId });

      const categories = await categoryRepository.findByUserOrDefault(userId);

      logger.info('Categories fetched successfully', { userId, count: categories.length });

      return categories;

    } catch (error) {
      logger.error('Error fetching categories', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Add category baru (custom)
   */
  async addCategory(userId, name, type, icon) {
    try {
      logger.info('Adding new category', { userId, name, type });

      const category = await categoryRepository.create(name, type, icon, userId);

      logger.info('Category created successfully', { categoryId: category.id, userId, name });

      return category;

    } catch (error) {
      logger.error('Error adding category', { userId, name, error: error.message });
      throw error;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(userId, categoryId) {
    try {
      logger.info('Deleting category', { userId, categoryId });

      const deletedCategory = await categoryRepository.delete(categoryId, userId);

      if (!deletedCategory) {
        logger.warn('Category not found for deletion', { categoryId, userId });
        throw new NotFoundError(
          messages.CATEGORY.NOT_FOUND,
          'CATEGORY_NOT_FOUND'
        );
      }

      logger.info('Category deleted successfully', { categoryId, userId });

      return deletedCategory;

    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Error deleting category', { userId, categoryId, error: error.message });
      throw error;
    }
  }
}

module.exports = new CategoryService();
