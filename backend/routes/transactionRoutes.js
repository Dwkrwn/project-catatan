const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const transactionController = require('../controllers/transactionController');

router.use(auth);

router.get('/', transactionController.getTransactions);
router.get('/summary', transactionController.getSummary);
router.get('/summary/category', transactionController.getExpenseByCategory);
router.post('/', transactionController.addTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;