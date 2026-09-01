const pool = require('../config/db');

const getAll = async (userId, month, year) => {
    let query = `
      SELECT b.*, c.name as category_name, c.icon as category_icon, c.type as category_type,
        (
          SELECT COALESCE(SUM(t.amount), 0)
          FROM tb_transactions t
          WHERE t.user_id = b.user_id
            AND t.category_id = b.category_id
            AND t.type = 'expense'
            AND EXTRACT(MONTH FROM t.transaction_date) = b.month
            AND EXTRACT(YEAR FROM t.transaction_date) = b.year
        ) AS spent,
        (
          SELECT COALESCE(SUM(t.amount), 0)
          FROM tb_transactions t
          WHERE t.user_id = b.user_id
            AND t.income_budget_id = b.id
        ) AS drawn
      FROM tb_budgets b
      LEFT JOIN tb_categories c ON b.category_id = c.id
      WHERE b.user_id = $1
    `;
    const params = [userId];

    if (month && year) {
        query += ` AND b.month = $${params.length + 1}
                 AND b.year = $${params.length + 2}`;
        params.push(month, year);
    }

    query += " ORDER BY b.year DESC, b.month DESC, c.name ASC";

    const result = await pool.query(query, params);
    return result.rows;
};

const findIncomeSource = async (id, userId, month, year) => {
    const result = await pool.query(
        `SELECT b.*, c.type as category_type
       FROM tb_budgets b
       LEFT JOIN tb_categories c ON b.category_id = c.id
       WHERE b.id = $1 AND b.user_id = $2
         AND b.month = $3 AND b.year = $4
         AND c.type = 'income'`,
        [id, userId, month, year]
    );
    return result.rows[0];
};

const findByUserCategoryMonthYear = async (userId, categoryId, month, year) => {
    const result = await pool.query(
        "SELECT * FROM tb_budgets WHERE user_id = $1 AND category_id = $2 AND month = $3 AND year = $4",
        [userId, categoryId, month, year]
    );
    return result.rows[0];
};

const findById = async (id, userId) => {
    const result = await pool.query(
        `SELECT b.*, c.type as category_type
             FROM tb_budgets b
             LEFT JOIN tb_categories c ON b.category_id = c.id
             WHERE b.id = $1 AND b.user_id = $2`,
        [id, userId]
    );
    return result.rows[0];
};

const create = async (userId, categoryId, amount, month, year) => {
    const result = await pool.query(
        `INSERT INTO tb_budgets (user_id, category_id, amount, month, year)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [userId, categoryId, amount, month, year]
    );
    return result.rows[0];
};

const update = async (categoryId, amount, month, year, id, userId) => {
    const result = await pool.query(
        `UPDATE tb_budgets
       SET category_id = $1, amount = $2, month = $3, year = $4
       WHERE id = $5 AND user_id = $6 RETURNING *`,
        [categoryId, amount, month, year, id, userId]
    );
    return result.rows[0];
};

const remove = async (id, userId) => {
    const result = await pool.query(
        "DELETE FROM tb_budgets WHERE id = $1 AND user_id = $2 RETURNING *",
        [id, userId]
    );
    return result.rows[0];
};

module.exports = {
    getAll,
    findByUserCategoryMonthYear,
    findById,
    findIncomeSource,
    create,
    update,
    remove,
};
