const asyncHandler = require('../utils/asyncHandler');
const budgetService = require('../services/budgetService');

exports.getBudgets = asyncHandler(async (req, res) => {
    const result = await budgetService.getBudgets(req.user.id, req.query);
    res.json(result);
});

exports.addBudget = asyncHandler(async (req, res) => {
    const result = await budgetService.addBudget(req.user.id, req.body);
    res.status(201).json(result);
});

exports.updateBudget = asyncHandler(async (req, res) => {
    const result = await budgetService.updateBudget(req.user.id, req.body, req.params.id);
    res.json(result);
});

exports.deleteBudget = asyncHandler(async (req, res) => {
    const result = await budgetService.deleteBudget(req.user.id, req.params.id);
    res.json(result);
});
