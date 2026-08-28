const pool = require('../config/db');

const getAll = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM tb_categories
             WHERE user_id IS NULL OR user_id = $1
             ORDER BY type, name`,
        [userId]
    );
    return result.rows;
};

const create = async (name, type, icon, userId) => {
    const result = await pool.query(
        "INSERT INTO tb_categories (name, type, icon, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, type, icon, userId]
    );
    return result.rows[0];
};

const remove = async (id, userId) => {
    const result = await pool.query(
        'DELETE FROM tb_categories WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
    );
    return result.rows[0];
};

module.exports = {
    getAll,
    create,
    remove,
};
