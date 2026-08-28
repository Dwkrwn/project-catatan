/**
 * Transaction Controller
 * HTTP request handler untuk transaction endpoints
 * Business logic di-delegate ke transactionService
 */

const transactionService = require('../services/transaction.service');
const transactionValidations = require('../validations/transaction.validation');
const response = require('../utils/response');
const messages = require('../constants/messages');

class TransactionController {
  /**
   * GET /api/transactions
   */
  async getTransactions(req, res, next) {
    try {
      const userId = req.user.id;
      const queryParams = transactionValidations.validateQuery(req.query);

      const transactions = await transactionService.getTransactions(
        userId,
        queryParams.month,
        queryParams.year
      );

      res.json(response.success({ count: transactions.length, transactions }, messages.TRANSACTION.FETCHED));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/transactions/summary
   */
  async getSummary(req, res, next) {
    try {
      const userId = req.user.id;
      const queryParams = transactionValidations.validateQuery(req.query);

      const summary = await transactionService.getSummary(userId, queryParams.month, queryParams.year);

      res.json(response.success(summary, messages.TRANSACTION.SUMMARY_FETCHED));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/transactions/summary/category
   */
  async getExpenseByCategory(req, res, next) {
    try {
      const userId = req.user.id;
      const queryParams = transactionValidations.validateQuery(req.query);

      const data = await transactionService.getExpenseByCategory(userId, queryParams.month, queryParams.year);

      res.json(response.success(data, messages.TRANSACTION.CATEGORY_EXPENSE_FETCHED));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/transactions
   */
  async addTransaction(req, res, next) {
    try {
      const userId = req.user.id;
      const validatedData = transactionValidations.validateAddTransaction(req.body);

      const transaction = await transactionService.addTransaction(
        userId,
        validatedData.category_id,
        validatedData.type,
        validatedData.amount,
        validatedData.description,
        validatedData.date
      );

      res.status(201).json(response.success({ transaction }, messages.TRANSACTION.CREATED));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/transactions/:id
   */
  async updateTransaction(req, res, next) {
    try {
      const userId = req.user.id;
      const transactionId = req.params.id;
      const validatedData = transactionValidations.validateUpdateTransaction(req.body);

      const transaction = await transactionService.updateTransaction(
        userId,
        transactionId,
        validatedData.category_id,
        validatedData.type,
        validatedData.amount,
        validatedData.description,
        validatedData.date
      );

      res.json(response.success({ transaction }, messages.TRANSACTION.UPDATED));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/transactions/:id
   */
  async deleteTransaction(req, res, next) {
    try {
      const userId = req.user.id;
      const transactionId = req.params.id;

      await transactionService.deleteTransaction(userId, transactionId);

      res.json(response.success(null, messages.TRANSACTION.DELETED));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();
