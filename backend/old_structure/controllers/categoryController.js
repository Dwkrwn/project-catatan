const pool = require("../config/db");

exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ambil kategori default + kategori custom user
    const result = await pool.query(
      `SELECT * FROM tb_categories
             WHERE user_id IS NULL OR user_id = $1
             ORDER BY type, name`,
      [userId],
    );

    res.json({
      count: result.rows.length,
      categories: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Name dan type wajib diisi" });
    }

    const result = await pool.query(
      "INSERT INTO tb_categories (name, type, icon, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, type, icon, userId],
    );

    res.status(201).json({
      message: "Kategori berhasil ditambahkan",
      category: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;

    const result = await pool.query(
      'DELETE FROM tb_categories WHERE id = $1 AND user_id = $2 RETURNING *',
      [categoryId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category tidak ditemukan' });
    }

    res.json({ message: 'Category berhasil dihapus' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'server error' });
  }
};