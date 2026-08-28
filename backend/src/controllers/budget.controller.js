/**
 * Budget Controller
 * HTTP request handler untuk budget endpoints
 * Business logic di-delegate ke budgetService
 */

const budgetService = require('../services/budget.service');
const budgetValidations = require('../validations/budget.validation');
const response = require('../utils/response');
const messages = require('../constants/messages');

class BudgetController {
  /**
   * GET /api/budgets
   */
  async getBudgets(req, res, next) {
    try {
      const userId = req.user.id;
      const queryParams = budgetValidations.validateQuery(req.query);

      const budgets = await budgetService.getBudgets(
        userId,
        queryParams.month,
        queryParams.year
      );

      res.json(response.success({ count: budgets.length, budgets }, messages.BUDGET.FETCHED));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/budgets
   */
  async addBudget(req, res, next) {
    try {
      const userId = req.user.id;
      const validatedData = budgetValidations.validateAddBudget(req.body);

      const budget = await budgetService.addBudget(
        userId,
        validatedData.category_id,
        validatedData.amount,
        validatedData.month,
        validatedData.year
      );

      res.status(201).json(response.success({ budget }, messages.BUDGET.CREATED));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/budgets/:id
   */
  async updateBudget(req, res, next) {
    try {
      const userId = req.user.id;
      const budgetId = req.params.id;
      const validatedData = budgetValidations.validateUpdateBudget(req.body);

      const budget = await budgetService.updateBudget(
        userId,
        budgetId,
        validatedData.category_id,
        validatedData.amount,
        validatedData.month,
        validatedData.year
      );

      res.json(response.success({ budget }, messages.BUDGET.UPDATED));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/budgets/:id
   */
  async deleteBudget(req, res, next) {
    try {
      const userId = req.user.id;
      const budgetId = req.params.id;

      await budgetService.deleteBudget(userId, budgetId);

      res.json(response.success(null, messages.BUDGET.DELETED));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BudgetController();
