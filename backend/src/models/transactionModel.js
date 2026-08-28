const pool = require('../config/db');

const getAll = async (userId, month, year) => {
    let query = ` SELECT t.*, c.name as category_name, c.icon as category_icon
            FROM tb_transactions t LEFT JOIN tb_categories c ON t.category_id = c.id
            WHERE t.user_id = $1 `;

    const params = [userId];

    if (month && year) {
        query += ` AND EXTRACT(MONTH FROM t.transaction_date) = $${params.length + 1}
            AND EXTRACT(YEAR FROM t.transaction_date) = $${params.length + 2}`;
        params.push(month, year);
    }

    query += " ORDER BY t.transaction_date DESC, t.created_at DESC";

    const result = await pool.query(query, params);
    return result.rows;
};

const create = async (userId, categoryId, type, amount, description, date) => {
    const result = await pool.query(
        `INSERT INTO tb_transactions (user_id, category_id, type, amount, description, transaction_date)
            VALUES ($1, $2, $3, $4, $5,$6) RETURNING *`,
        [userId, categoryId, type, amount, description, date || new Date()]
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

const update = async (categoryId, type, amount, description, date, id, userId) => {
    const result = await pool.query(
        `UPDATE tb_transactions
            SET category_id = $1, type = $2, amount = $3, description = $4, transaction_date = $5
            WHERE id = $6 AND user_id = $7 RETURNING *`,
        [categoryId, type, amount, description, date, id, userId]
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

const getExpenseByCategory = async (userId, month, year) => {
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
                 AND t.type = 'expense'
             WHERE c.type = 'expense' AND (c.user_id IS NULL OR c.user_id = $1)
             GROUP BY c.id, c.name, c.icon
             HAVING COALESCE(SUM(t.amount), 0) > 0
             ORDER BY total DESC`,
        [userId, month, year]
    );
    return result.rows;
};

module.exports = {
    getAll,
    create,
    findById,
    update,
    remove,
    getIncomeTotal,
    getExpenseTotal,
    getBalance,
    getExpenseByCategory,
};
