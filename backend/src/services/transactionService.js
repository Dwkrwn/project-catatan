const ApiError = require('../utils/ApiError');
const transactionModel = require('../models/transactionModel');

const getTransactions = async (userId, query) => {
    const { month, year, type } = query;
    const validType = ['income', 'expense'].includes(type) ? type : null;
    const transactions = await transactionModel.getAll(userId, month, year, validType);
    return { count: transactions.length, transactions };
};

const addTransaction = async (userId, body) => {
    const { category_id, type, amount, description, date } = body;

    if (!type || !amount) {
        throw new ApiError(400, 'Type dan amount wajib diisi');
    }

    if (!['income', 'expense'].includes(type)) {
        throw new ApiError(400, 'Type harus income atau expense');
    }

    const transaction = await transactionModel.create(
        userId,
        category_id,
        type,
        amount,
        description,
        date
    );

    return {
        message: 'Transaksi berhasil ditambahkan',
        transaction,
    };
};

const updateTransaction = async (userId, body, transactionId) => {
    const { category_id, type, amount, description, date } = body;

    const existing = await transactionModel.findById(transactionId, userId);
    if (!existing) {
        throw new ApiError(404, 'Transaksi tidak ditemukan');
    }

    const transaction = await transactionModel.update(
        category_id,
        type,
        amount,
        description,
        date,
        transactionId,
        userId
    );

    return {
        message: 'Transaksi berhasil diupdate',
        transaction,
    };
};

const deleteTransaction = async (userId, transactionId) => {
    const transaction = await transactionModel.remove(transactionId, userId);
    if (!transaction) {
        throw new ApiError(404, 'Transaksi tidak ditemukan');
    }

    return { message: 'Transaksi berhasil dihapus' };
};

const getSummary = async (userId, query) => {
    const { month, year } = query;

    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const [incomeResult, expenseResult, balanceResult] = await Promise.all([
        transactionModel.getIncomeTotal(userId, currentMonth, currentYear),
        transactionModel.getExpenseTotal(userId, currentMonth, currentYear),
        transactionModel.getBalance(userId),
    ]);

    const totalIncome = parseFloat(incomeResult.total);
    const totalExpense = parseFloat(expenseResult.total);

    return {
        month: parseInt(currentMonth),
        year: parseInt(currentYear),
        totalIncome,
        totalExpense,
        balance: parseFloat(balanceResult.balance),
        netIncome: totalIncome - totalExpense,
    };
};

const getExpenseByCategory = async (userId, query) => {
    const { month, year } = query;

    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const categories = await transactionModel.getExpenseByCategory(
        userId,
        currentMonth,
        currentYear
    );

    return {
        month: parseInt(currentMonth),
        year: parseInt(currentYear),
        categories,
    };
};

const getIncomeByCategory = async (userId, query) => {
    const { month, year } = query;

    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const categories = await transactionModel.getIncomeByCategory(
        userId,
        currentMonth,
        currentYear
    );

    return {
        month: parseInt(currentMonth),
        year: parseInt(currentYear),
        categories,
    };
};

module.exports = {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getSummary,
    getExpenseByCategory,
    getIncomeByCategory,
};
