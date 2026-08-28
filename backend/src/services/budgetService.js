const ApiError = require('../utils/ApiError');
const budgetModel = require('../models/budgetModel');

const getBudgets = async (userId, query) => {
    const { month, year } = query;
    const budgets = await budgetModel.getAll(userId, month, year);
    return { count: budgets.length, budgets };
};

const addBudget = async (userId, body) => {
    const { category_id, amount, month, year } = body;

    if (!category_id || !amount || !month || !year) {
        throw new ApiError(400, 'Category_id, amount, month, dan year wajib diisi');
    }

    if (month < 1 || month > 12) {
        throw new ApiError(400, 'Month harus antara 1 dan 12');
    }

    const existing = await budgetModel.findByUserCategoryMonthYear(
        userId,
        category_id,
        month,
        year
    );

    if (existing) {
        throw new ApiError(409, 'Budget untuk kategori ini di bulan tersebut sudah ada');
    }

    const budget = await budgetModel.create(userId, category_id, amount, month, year);

    return {
        message: 'Budget berhasil ditambahkan',
        budget,
    };
};

const updateBudget = async (userId, body, budgetId) => {
    const { category_id, amount, month, year } = body;

    const existing = await budgetModel.findById(budgetId, userId);
    if (!existing) {
        throw new ApiError(404, 'Budget tidak ditemukan');
    }

    if (month && (month < 1 || month > 12)) {
        throw new ApiError(400, 'Month harus antara 1 dan 12');
    }

    const budget = await budgetModel.update(
        category_id || existing.category_id,
        amount || existing.amount,
        month || existing.month,
        year || existing.year,
        budgetId,
        userId
    );

    return {
        message: 'Budget berhasil diupdate',
        budget,
    };
};

const deleteBudget = async (userId, budgetId) => {
    const budget = await budgetModel.remove(budgetId, userId);
    if (!budget) {
        throw new ApiError(404, 'Budget tidak ditemukan');
    }

    return { message: 'Budget berhasil dihapus' };
};

module.exports = {
    getBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
};
