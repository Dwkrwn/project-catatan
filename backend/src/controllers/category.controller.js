/**
 * Category Controller
 * HTTP request handler untuk category endpoints
 * Business logic di-delegate ke categoryService
 */

const categoryService = require('../services/category.service');
const categoryValidations = require('../validations/category.validation');
const response = require('../utils/response');
const messages = require('../constants/messages');

class CategoryController {
  /**
   * GET /api/categories
   */
  async getCategories(req, res, next) {
    try {
      const userId = req.user.id;

      const categories = await categoryService.getCategories(userId);

      res.json(response.success({ count: categories.length, categories }, messages.CATEGORY.FETCHED));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/categories
   */
  async addCategory(req, res, next) {
    try {
      const userId = req.user.id;
      const validatedData = categoryValidations.validateAddCategory(req.body);

      const category = await categoryService.addCategory(
        userId,
        validatedData.name,
        validatedData.type,
        validatedData.icon
      );

      res.status(201).json(response.success({ category }, messages.CATEGORY.CREATED));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/categories/:id
   */
  async deleteCategory(req, res, next) {
    try {
      const userId = req.user.id;
      const categoryId = req.params.id;

      await categoryService.deleteCategory(userId, categoryId);

      res.json(response.success(null, messages.CATEGORY.DELETED));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
