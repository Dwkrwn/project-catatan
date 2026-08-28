const pool = require('../config/db');

const findByEmailOrUsername = async (email, username) => {
    const result = await pool.query(
        'SELECT * FROM tb_users WHERE email = $1 OR username = $2',
        [email, username]
    );
    return result.rows[0];
};

const findByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM tb_users WHERE email = $1', [email]);
    return result.rows[0];
};

const create = async (username, email, hashedPassword) => {
    const result = await pool.query(
        'INSERT INTO tb_users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hashedPassword]
    );
    return result.rows[0];
};

module.exports = {
    findByEmailOrUsername,
    findByEmail,
    create,
};
