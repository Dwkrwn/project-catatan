const asyncHandler = require('../utils/asyncHandler');
const transactionService = require('../services/transactionService');

exports.getTransactions = asyncHandler(async (req, res) => {
    const result = await transactionService.getTransactions(req.user.id, req.query);
    res.json(result);
});

exports.addTransaction = asyncHandler(async (req, res) => {
    const result = await transactionService.addTransaction(req.user.id, req.body);
    res.status(201).json(result);
});

exports.updateTransaction = asyncHandler(async (req, res) => {
    const result = await transactionService.updateTransaction(
        req.user.id,
        req.body,
        req.params.id
    );
    res.json(result);
});

exports.deleteTransaction = asyncHandler(async (req, res) => {
    const result = await transactionService.deleteTransaction(req.user.id, req.params.id);
    res.json(result);
});

exports.getSummary = asyncHandler(async (req, res) => {
    const result = await transactionService.getSummary(req.user.id, req.query);
    res.json(result);
});

exports.getExpenseByCategory = asyncHandler(async (req, res) => {
    const result = await transactionService.getExpenseByCategory(req.user.id, req.query);
    res.json(result);
});
