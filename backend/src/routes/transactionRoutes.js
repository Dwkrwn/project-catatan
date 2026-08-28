const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const transactionController = require('../controllers/transactionController');
const {
    addTransactionSchema,
    updateTransactionSchema,
} = require('../validations/transactionValidation');

router.use(authMiddleware);

router.get('/', transactionController.getTransactions);
router.get('/summary', transactionController.getSummary);
router.get('/summary/category', transactionController.getExpenseByCategory);
router.post('/', validate(addTransactionSchema), transactionController.addTransaction);
router.put('/:id', validate(updateTransactionSchema), transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
