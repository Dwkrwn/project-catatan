const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const budgetController = require('../controllers/budgetController');
const {
    addBudgetSchema,
    updateBudgetSchema,
} = require('../validations/budgetValidation');

router.use(authMiddleware);

router.get('/', budgetController.getBudgets);
router.post('/', validate(addBudgetSchema), budgetController.addBudget);
router.put('/:id', validate(updateBudgetSchema), budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
