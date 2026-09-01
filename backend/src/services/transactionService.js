const ApiError = require('../utils/ApiError');
const transactionModel = require('../models/transactionModel');
const budgetModel = require('../models/budgetModel');

async function validateIncomeBudget(userId, incomeBudgetId, date, type) {
    if (!incomeBudgetId) return null;

    if (type !== 'expense') {
        throw new ApiError(400, 'Sumber pemasukan hanya berlaku untuk transaksi pengeluaran');
    }

    let month = null;
    let year = null;
    if (date) {
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
            month = d.getMonth() + 1;
            year = d.getFullYear();
        }
    }

    let source;
    if (month && year) {
        source = await budgetModel.findIncomeSource(incomeBudgetId, userId, month, year);
    } else {
        source = null;
    }

    if (!source) {
        throw new ApiError(400, 'Sumber pemasukan tidak valid atau tidak cocok dengan bulan/tahun transaksi');
    }

    return incomeBudgetId;
}

const getTransactions = async (userId, query) => {
    const { month, year, type } = query;
    const validType = ['income', 'expense'].includes(type) ? type : null;
    const transactions = await transactionModel.getAll(userId, month, year, validType);
    return { count: transactions.length, transactions };
};

const addTransaction = async (userId, body) => {
    const { category_id, type, amount, description, date, income_budget_id } = body;

    if (!type || !amount) {
        throw new ApiError(400, 'Type dan amount wajib diisi');
    }

    if (!['income', 'expense'].includes(type)) {
        throw new ApiError(400, 'Type harus income atau expense');
    }

    const validIncomeBudgetId = await validateIncomeBudget(userId, income_budget_id, date, type);

    const transaction = await transactionModel.create(
        userId,
        category_id,
        type,
        amount,
        description,
        date,
        validIncomeBudgetId
    );

    return {
        message: 'Transaksi berhasil ditambahkan',
        transaction,
    };
};

const updateTransaction = async (userId, body, transactionId) => {
    const { category_id, type, amount, description, date, income_budget_id } = body;

    const existing = await transactionModel.findById(transactionId, userId);
    if (!existing) {
        throw new ApiError(404, 'Transaksi tidak ditemukan');
    }

    if (existing.is_auto) {
        throw new ApiError(400, 'Transaksi otomatis dari budget tidak dapat diedit secara manual. Ubah melalui budget pemasukan.');
    }

    const finalType = type || existing.type;
    const finalDate = date || existing.transaction_date;

    const validIncomeBudgetId = await validateIncomeBudget(userId, income_budget_id, finalDate, finalType);

    const transaction = await transactionModel.update(
        category_id !== undefined ? category_id : existing.category_id,
        finalType,
        amount !== undefined ? amount : existing.amount,
        description !== undefined ? description : existing.description,
        finalDate,
        income_budget_id !== undefined ? validIncomeBudgetId : existing.income_budget_id,
        transactionId,
        userId
    );

    return {
        message: 'Transaksi berhasil diupdate',
        transaction,
    };
};

const deleteTransaction = async (userId, transactionId) => {
    const existing = await transactionModel.findById(transactionId, userId);
    if (!existing) {
        throw new ApiError(404, 'Transaksi tidak ditemukan');
    }

    if (existing.is_auto) {
        throw new ApiError(400, 'Transaksi otomatis dari budget tidak dapat dihapus secara manual. Hapus melalui budget pemasukan.');
    }

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
