const pool = require('../config/db');

const getAll = async (userId, month, year, type) => {
    let query = ` SELECT t.*, c.name as category_name, c.icon as category_icon,
            sb.category_name as source_budget_name
            FROM tb_transactions t
            LEFT JOIN tb_categories c ON t.category_id = c.id
            LEFT JOIN (
                SELECT b.id, c2.name as category_name
                FROM tb_budgets b
                LEFT JOIN tb_categories c2 ON b.category_id = c2.id
            ) sb ON sb.id = t.source_budget_id
            WHERE t.user_id = $1 `;

    const params = [userId];

    if (month && year) {
        query += ` AND EXTRACT(MONTH FROM t.transaction_date) = $${params.length + 1}
            AND EXTRACT(YEAR FROM t.transaction_date) = $${params.length + 2}`;
        params.push(month, year);
    }

    if (type) {
        query += ` AND t.type = $${params.length + 1}`;
        params.push(type);
    }

    query += " ORDER BY t.transaction_date DESC, t.created_at DESC";

    const result = await pool.query(query, params);
    return result.rows;
};

const create = async (userId, categoryId, type, amount, description, date, incomeBudgetId, isAuto = false, sourceBudgetId = null) => {
    const result = await pool.query(
        `INSERT INTO tb_transactions (user_id, category_id, type, amount, description, transaction_date, income_budget_id, is_auto, source_budget_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [userId, categoryId, type, amount, description, date || new Date(), incomeBudgetId || null, isAuto, sourceBudgetId]
    );
    return result.rows[0];
};

const findById = async (id, userId) => {
    const result = await pool.query(
        `SELECT * FROM tb_transactions WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );
    return result.rows[0];
};

const update = async (categoryId, type, amount, description, date, incomeBudgetId, id, userId) => {
    const result = await pool.query(
        `UPDATE tb_transactions
            SET category_id = $1, type = $2, amount = $3, description = $4, transaction_date = $5, income_budget_id = $6
            WHERE id = $7 AND user_id = $8 RETURNING *`,
        [categoryId, type, amount, description, date, incomeBudgetId || null, id, userId]
    );
    return result.rows[0];
};

const remove = async (id, userId) => {
    const result = await pool.query(
        "DELETE FROM tb_transactions WHERE id = $1 AND user_id = $2 RETURNING *",
        [id, userId]
    );
    return result.rows[0];
};

const findBySourceBudgetId = async (sourceBudgetId, userId) => {
    const result = await pool.query(
        `SELECT * FROM tb_transactions
             WHERE source_budget_id = $1 AND user_id = $2 AND is_auto = TRUE`,
        [sourceBudgetId, userId]
    );
    return result.rows[0];
};

const updateBySourceBudget = async (sourceBudgetId, userId, amount, date) => {
    const result = await pool.query(
        `UPDATE tb_transactions
             SET amount = $1, transaction_date = $2
             WHERE source_budget_id = $3 AND user_id = $4 AND is_auto = TRUE RETURNING *`,
        [amount, date || new Date(), sourceBudgetId, userId]
    );
    return result.rows[0];
};

const deleteBySourceBudgetId = async (sourceBudgetId, userId) => {
    const result = await pool.query(
        `DELETE FROM tb_transactions
             WHERE source_budget_id = $1 AND user_id = $2 AND is_auto = TRUE RETURNING *`,
        [sourceBudgetId, userId]
    );
    return result.rows;
};

const getIncomeTotal = async (userId, month, year) => {
    const result = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total
             FROM tb_transactions
             WHERE user_id = $1 AND type = 'income'
             AND EXTRACT(MONTH FROM transaction_date) = $2
             AND EXTRACT(YEAR FROM transaction_date) = $3`,
        [userId, month, year]
    );
    return result.rows[0];
};

const getExpenseTotal = async (userId, month, year) => {
    const result = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total
             FROM tb_transactions
             WHERE user_id = $1 AND type = 'expense'
             AND EXTRACT(MONTH FROM transaction_date) = $2
             AND EXTRACT(YEAR FROM transaction_date) = $3`,
        [userId, month, year]
    );
    return result.rows[0];
};

const getBalance = async (userId) => {
    const result = await pool.query(
        `SELECT
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as balance
             FROM tb_transactions
             WHERE user_id = $1`,
        [userId]
    );
    return result.rows[0];
};

const getByCategory = async (userId, month, year, type) => {
    const result = await pool.query(
        `SELECT
                c.name as category_name,
                c.icon,
                COALESCE(SUM(t.amount), 0) as total,
                COUNT(t.id) as transaction_count
             FROM tb_categories c
             LEFT JOIN tb_transactions t ON c.id = t.category_id
                 AND EXTRACT(MONTH FROM t.transaction_date) = $2
                 AND EXTRACT(YEAR FROM t.transaction_date) = $3
                 AND t.user_id = $1
                 AND t.type = $4
             WHERE c.type = $4 AND (c.user_id IS NULL OR c.user_id = $1)
             GROUP BY c.id, c.name, c.icon
             HAVING COALESCE(SUM(t.amount), 0) > 0
             ORDER BY total DESC`,
        [userId, month, year, type]
    );
    return result.rows;
};

const getExpenseByCategory = async (userId, month, year) =>
    getByCategory(userId, month, year, 'expense');

const getIncomeByCategory = async (userId, month, year) =>
    getByCategory(userId, month, year, 'income');

module.exports = {
    getAll,
    create,
    findById,
    update,
    remove,
    findBySourceBudgetId,
    updateBySourceBudget,
    deleteBySourceBudgetId,
    getIncomeTotal,
    getExpenseTotal,
    getBalance,
    getExpenseByCategory,
    getIncomeByCategory,
};
