const pool = require("../config/db");

exports.getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    let query = `
      SELECT b.*, c.name as category_name, c.icon as category_icon
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

    res.json({
      count: result.rows.length,
      budgets: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category_id, amount, month, year } = req.body;

    if (!category_id || !amount || !month || !year) {
      return res
        .status(400)
        .json({ message: "Category_id, amount, month, dan year wajib diisi" });
    }

    if (month < 1 || month > 12) {
      return res
        .status(400)
        .json({ message: "Month harus antara 1 dan 12" });
    }

    const existing = await pool.query(
      "SELECT * FROM tb_budgets WHERE user_id = $1 AND category_id = $2 AND month = $3 AND year = $4",
      [userId, category_id, month, year],
    );

    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "Budget untuk kategori ini di bulan tersebut sudah ada" });
    }

    const result = await pool.query(
      `INSERT INTO tb_budgets (user_id, category_id, amount, month, year)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, category_id, amount, month, year],
    );

    res.status(201).json({
      message: "Budget berhasil ditambahkan",
      budget: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    const { category_id, amount, month, year } = req.body;

    const existing = await pool.query(
      "SELECT * FROM tb_budgets WHERE id = $1 AND user_id = $2",
      [budgetId, userId],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Budget tidak ditemukan" });
    }

    if (month && (month < 1 || month > 12)) {
      return res
        .status(400)
        .json({ message: "Month harus antara 1 dan 12" });
    }

    const result = await pool.query(
      `UPDATE tb_budgets
       SET category_id = $1, amount = $2, month = $3, year = $4
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [
        category_id || existing.rows[0].category_id,
        amount || existing.rows[0].amount,
        month || existing.rows[0].month,
        year || existing.rows[0].year,
        budgetId,
        userId,
      ],
    );

    res.json({
      message: "Budget berhasil diupdate",
      budget: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const result = await pool.query(
      "DELETE FROM tb_budgets WHERE id = $1 AND user_id = $2 RETURNING *",
      [budgetId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Budget tidak ditemukan" });
    }

    res.json({ message: "Budget berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
