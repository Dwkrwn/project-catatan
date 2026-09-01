const ApiError = require('../utils/ApiError');
const pool = require('../config/db');
const budgetModel = require('../models/budgetModel');
const transactionModel = require('../models/transactionModel');

const getBudgets = async (userId, query) => {
    const { month, year } = query;
    const budgets = await budgetModel.getAll(userId, month, year);

    const mappedBudgets = budgets.map((b) => {
        const amount = parseFloat(b.amount);
        const spent = parseFloat(b.spent);
        const drawn = parseFloat(b.drawn);
        let progress;

        if (b.category_type === 'expense') {
            progress = amount > 0 ? Math.round((spent / amount) * 100) : 100;
        } else {
            const remaining = Math.max(0, amount - drawn);
            progress = amount > 0 ? Math.round((remaining / amount) * 100) : 0;
        }

        return {
            ...b,
            spent,
            drawn,
            progress,
        };
    });

    return { count: budgets.length, budgets: mappedBudgets };
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

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const budget = await budgetModel.create(userId, category_id, amount, month, year);

        const categoryType = await getCategoryType(category_id);

        if (categoryType === 'income') {
            const autoDate = `${year}-${String(month).padStart(2, '0')}-01`;
            await createAutoTransaction(client, {
                userId,
                categoryId: category_id,
                amount,
                date: autoDate,
                sourceBudgetId: budget.id,
            });
        }

        await client.query('COMMIT');
        return {
            message: categoryType === 'income'
                ? 'Budget pemasukan berhasil ditambahkan. Transaksi pemasukan otomatis dibuat.'
                : 'Budget berhasil ditambahkan',
            budget,
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
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

    const finalCategoryId = category_id || existing.category_id;
    const finalAmount = amount || existing.amount;
    const finalMonth = month || existing.month;
    const finalYear = year || existing.year;

    const budget = await budgetModel.update(
        finalCategoryId,
        finalAmount,
        finalMonth,
        finalYear,
        budgetId,
        userId
    );

    if (existing.category_type === 'income') {
        const autoDate = `${finalYear}-${String(finalMonth).padStart(2, '0')}-01`;
        await transactionModel.updateBySourceBudget(
            budgetId,
            userId,
            finalAmount,
            autoDate
        );
    }

    return {
        message: 'Budget berhasil diupdate',
        budget,
    };
};

const deleteBudget = async (userId, budgetId) => {
    const existing = await budgetModel.findById(budgetId, userId);
    if (!existing) {
        throw new ApiError(404, 'Budget tidak ditemukan');
    }

    const budget = await budgetModel.remove(budgetId, userId);
    if (!budget) {
        throw new ApiError(404, 'Budget tidak ditemukan');
    }

    if (existing.category_type === 'income') {
        await transactionModel.deleteBySourceBudgetId(budgetId, userId);
    }

    return { message: 'Budget berhasil dihapus' };
};

async function getCategoryType(categoryId) {
    const result = await pool.query('SELECT type FROM tb_categories WHERE id = $1', [categoryId]);
    return result.rows[0]?.type || null;
}

async function createAutoTransaction(client, { userId, categoryId, amount, date, sourceBudgetId }) {
    await client.query(
        `INSERT INTO tb_transactions
            (user_id, category_id, type, amount, description, transaction_date, is_auto, source_budget_id)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7)`,
        [userId, categoryId, 'income', amount, 'Pemasukan otomatis dari budget', date, sourceBudgetId]
    );
}

module.exports = {
    getBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
};
