const asyncHandler = require('../utils/asyncHandler');
const categoryService = require('../services/categoryService');

exports.getCategories = asyncHandler(async (req, res) => {
    const result = await categoryService.getCategories(req.user.id);
    res.json(result);
});

exports.addCategory = asyncHandler(async (req, res) => {
    const result = await categoryService.addCategory(req.user.id, req.body);
    res.status(201).json(result);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
    const result = await categoryService.deleteCategory(req.user.id, req.params.id);
    res.json(result);
});
