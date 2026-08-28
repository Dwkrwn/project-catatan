/**
 * Transaction Routes
 * Endpoint untuk transaction management
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const transactionController = require('../controllers/transaction.controller');
const transactionValidations = require('../validations/transaction.validation');

// Apply auth middleware untuk semua routes
router.use(authMiddleware);

// GET /api/transactions
router.get('/', transactionController.getTransactions);

// GET /api/transactions/summary
router.get('/summary', transactionController.getSummary);

// GET /api/transactions/summary/category
router.get('/summary/category', transactionController.getExpenseByCategory);

// POST /api/transactions
router.post('/', (req, res, next) => {
  try {
    transactionValidations.validateAddTransaction(req.body);
    next();
  } catch (error) {
    next(error);
  }
}, transactionController.addTransaction);

// PUT /api/transactions/:id
router.put('/:id', (req, res, next) => {
  try {
    transactionValidations.validateUpdateTransaction(req.body);
    next();
  } catch (error) {
    next(error);
  }
}, transactionController.updateTransaction);

// DELETE /api/transactions/:id
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
