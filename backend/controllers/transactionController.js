const pool = require("../config/db");

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    let query = ` SELECT t.*, c.name as category_name, c.icon as category_icon
            FROM tb_transactions t LEFT JOIN tb_categories c ON t.category_id = c.id
            WHERE t.user_id = $1 `;

    const params = [userId];

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM t.date) = $${params.length + 1}
            AND EXTRACT(YEAR FROM t.date) = $${params.length + 2}`;
      params.push(month, year);
    }

    query += " ORDER BY t.transaction_date DESC, t.created_at DESC";

    const result = await pool.query(query, params);

    res.json({
      count: result.rows.length,
      transactions: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category_id, type, amount, description, date } = req.body;

    // validasi input
    if (!type || !amount) {
      return res.status(400).json({ message: "Type dan amount wajib diisi" });
    }

    if (!["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Type harus income atau expense" });
    }

    const result = await pool.query(
      `INSERT INTO tb_transactions (user_id, category_id, type, amount, description, date)
                    VALUES ($1, $2, $3, $4, $5,$6) RETURNING *`,
      [userId, category_id, type, amount, description, date || new Date()],
    );

    res.status(201).json({
      message: "Transaksi berhasil ditambahkan",
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const { category_id, type, amount, description, date } = req.body;

    const existing = await pool.query(
      `SELECT * FROM tb_transactions WHERE id = $1 AND user_id = $2`,
      [transactionId, userId],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    const result = await pool.query(
      `UPDATE tb_transactions
        SET category_id = $1, type = $2, amount = $3, description = $4, date = $5
        WHERE id = $6 AND user_id = $7 RETURNING *`,
      [category_id, type, amount, description, date, transactionId, userId],
    );

    res.json({
      message: "Transaksi berhasil diupdate",
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const result = await pool.query(
      "DELETE FROM tb_transactions WHERE id = $1 AND user_id = $2 RETURNING *",
      [transactionId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    res.json({ message: "Transaksi berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    // Total Income
    const incomeResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
             FROM tb_transactions
             WHERE user_id = $1 AND type = 'income'
             AND EXTRACT(MONTH FROM date) = $2
             AND EXTRACT(YEAR FROM date) = $3`,
      [userId, currentMonth, currentYear],
    );

    // Total Expense
    const expenseResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
             FROM tb_transactions
             WHERE user_id = $1 AND type = 'expense'
             AND EXTRACT(MONTH FROM date) = $2
             AND EXTRACT(YEAR FROM date) = $3`,
      [userId, currentMonth, currentYear],
    );

    // Total Seluruh Saldo
    const balanceResult = await pool.query(
      `SELECT
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as balance
             FROM tb_transactions
             WHERE user_id = $1`,
      [userId],
    );

    const totalIncome = parseFloat(incomeResult.rows[0].total);
    const totalExpense = parseFloat(expenseResult.rows[0].total);

    res.json({
      month: parseInt(currentMonth),
      year: parseInt(currentYear),
      totalIncome,
      totalExpense,
      balance: parseFloat(balanceResult.rows[0].balance),
      netIncome: totalIncome - totalExpense,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getExpenseByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const result = await pool.query(
      `SELECT
                c.name as category_name,
                c.icon,
                COALESCE(SUM(t.amount), 0) as total,
                COUNT(t.id) as transaction_count
             FROM tb_categories c
             LEFT JOIN tb_transactions t ON c.id = t.category_id
                 AND EXTRACT(MONTH FROM t.date) = $2
                 AND EXTRACT(YEAR FROM t.date) = $3
                 AND t.user_id = $1
                 AND t.type = 'expense'
             WHERE c.type = 'expense' AND (c.user_id IS NULL OR c.user_id = $1)
             GROUP BY c.id, c.name, c.icon
             HAVING COALESCE(SUM(t.amount), 0) > 0
             ORDER BY total DESC`,
      [userId, currentMonth, currentYear],
    );

    res.json({
      month: parseInt(currentMonth),
      year: parseInt(currentYear),
      categories: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
