/**
 * Budget Routes
 * Endpoint untuk budget management
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const budgetController = require('../controllers/budget.controller');
const budgetValidations = require('../validations/budget.validation');

// Apply auth middleware untuk semua routes
router.use(authMiddleware);

// GET /api/budgets
router.get('/', budgetController.getBudgets);

// POST /api/budgets
router.post('/', (req, res, next) => {
  try {
    budgetValidations.validateAddBudget(req.body);
    next();
  } catch (error) {
    next(error);
  }
}, budgetController.addBudget);

// PUT /api/budgets/:id
router.put('/:id', (req, res, next) => {
  try {
    budgetValidations.validateUpdateBudget(req.body);
    next();
  } catch (error) {
    next(error);
  }
}, budgetController.updateBudget);

// DELETE /api/budgets/:id
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
