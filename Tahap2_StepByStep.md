# 🟢 TAHAP 2: Backend & REST API (Express.js + Node.js)

> **Status**: BERJALAN
> **Goal**: Membangun layanan API yang aman untuk memproses data keuangan dari/ke PostgreSQL

---

## 📋 Struktur Folder Backend

```
backend/
├── config/
│   └── db.js              # Koneksi ke PostgreSQL
├── middleware/
│   └── auth.js            # Middleware JWT verifikasi
├── routes/
│   ├── authRoutes.js      # Route Register & Login
│   ├── transactionRoutes.js # Route CRUD Transaksi
│   ├── categoryRoutes.js  # Route Kategori
│   └── budgetRoutes.js    # Route Budget (Anggaran)
├── controllers/
│   ├── authController.js  # Logic Register & Login
│   ├── transactionController.js # Logic Transaksi
│   ├── categoryController.js # Logic Kategori
│   └── budgetController.js # Logic Budget (Anggaran)
├── queries/
│   ├── auth.sql           # Query untuk user
│   ├── transaction.sql    # Query untuk transaksi
│   └── category.sql       # Query untuk kategori
├── .env                   # Environment variables
├── package.json
└── server.js              # Entry point Express
```

---

## 🔧 TAHAP 2.1: Setup Project & Dependencies

### Langkah 1: Inisialisasi Project
```bash
mkdir backend
cd backend
npm init -y
```

### Langkah 2: Install Dependencies
```bash
npm install express pg dotenv cors bcrypt jsonwebtoken
npm install --save-dev nodemon
```

| Package | Fungsi |
|---------|--------|
| `express` | Framework web server |
| `pg` | PostgreSQL client untuk Node.js |
| `dotenv` | Membaca variabel dari `.env` |
| `cors` | Mengizinkan akses cross-origin |
| `bcrypt` | Enkripsi password (hashing) |
| `jsonwebtoken` | Membuat & verifikasi token JWT |
| `nodemon` | Auto-restart server saat perubahan (dev) |

### Langkah 3: Buat File `.env`
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=catatan_keuangan
DB_USER=postgres
DB_PASSWORD=password_anda
JWT_SECRET=rahasia_jwt_token_anda
```

### Langkah 4: Update `package.json` Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

## 🗃️ TAHAP 2.2: Setup Database PostgreSQL

### Langkah 1: Buat Database
```sql
CREATE DATABASE catatan_keuangan;
```

### Langkah 2: Buat Tabel Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Langkah 3: Buat Tabel Categories
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default categories
INSERT INTO categories (name, type, icon) VALUES
('Gaji', 'income', 'briefcase'),
('Freelance', 'income', 'laptop'),
('Makanan', 'expense', 'utensils'),
('Transport', 'expense', 'car'),
('Belanja', 'expense', 'shopping-bag'),
('Tagihan', 'expense', 'file-text');
```

### Langkah 4: Buat Tabel Transactions
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
### Langkah 5: Buat Tabel tb_budgets
``` sql
CREATE TABLE tb_budgets (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES tb_users(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES tb_categories(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    month INT CHECK (month BETWEEN 1 AND 12) NOT NULL,
    year INT NOT NULL,
    CONSTRAINT unique_budget_per_category_month UNIQUE (user_id, category_id, month, year)
);
```

---

## 🔌 TAHAP 2.3: Setup Koneksi Database

### Buat `config/db.js`
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

module.exports = pool;
```

---

## 🔐 TAHAP 2.4: Autentikasi User (Register & Login)

### Buat `controllers/authController.js`

#### 1. Register
```javascript
const bcrypt = require('bcrypt');
const pool = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validasi input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Semua field wajib diisi' });
        }

        // Cek jika user sudah ada
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: 'Email atau Username sudah terdaftar' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user baru
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        res.status(201).json({
            message: 'Registrasi berhasil',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

#### 2. Login
```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password wajib diisi' });
        }

        // Cari user berdasarkan email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const user = result.rows[0];

        // Verifikasi password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // Buat JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

### Buat `middleware/auth.js`
```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Ambil token dari header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });
        }

        const token = authHeader.split(' ')[1];

        // Verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        res.status(401).json({ message: 'Token tidak valid' });
    }
};
```

### Buat `routes/authRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
```

---

## 📦 TAHAP 2.5: CRUD Transaksi

### Buat `controllers/transactionController.js`

#### 1. Get Semua Transaksi User
```javascript
const pool = require('../config/db');

exports.getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query;

        let query = `
            SELECT t.*, c.name as category_name, c.icon as category_icon
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = $1
        `;
        const params = [userId];

        // Filter berdasarkan bulan & tahun jika ada
        if (month && year) {
            query += ` AND EXTRACT(MONTH FROM t.date) = $${params.length + 1}
                       AND EXTRACT(YEAR FROM t.date) = $${params.length + 2}`;
            params.push(month, year);
        }

        query += ' ORDER BY t.date DESC, t.created_at DESC';

        const result = await pool.query(query, params);

        res.json({
            count: result.rows.length,
            transactions: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

#### 2. Tambah Transaksi
```javascript
exports.addTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category_id, type, amount, description, date } = req.body;

        // Validasi input
        if (!type || !amount) {
            return res.status(400).json({ message: 'Type dan amount wajib diisi' });
        }

        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ message: 'Type harus income atau expense' });
        }

        const result = await pool.query(
            `INSERT INTO transactions (user_id, category_id, type, amount, description, date)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [userId, category_id, type, amount, description, date || new Date()]
        );

        res.status(201).json({
            message: 'Transaksi berhasil ditambahkan',
            transaction: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

#### 3. Edit Transaksi
```javascript
exports.updateTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactionId = req.params.id;
        const { category_id, type, amount, description, date } = req.body;

        // Cek apakah transaksi milik user
        const existing = await pool.query(
            'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
            [transactionId, userId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
        }

        const result = await pool.query(
            `UPDATE transactions
             SET category_id = $1, type = $2, amount = $3, description = $4, date = $5
             WHERE id = $6 AND user_id = $7
             RETURNING *`,
            [category_id, type, amount, description, date, transactionId, userId]
        );

        res.json({
            message: 'Transaksi berhasil diupdate',
            transaction: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

#### 4. Hapus Transaksi
```javascript
exports.deleteTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactionId = req.params.id;

        const result = await pool.query(
            'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
            [transactionId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
        }

        res.json({ message: 'Transaksi berhasil dihapus' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

### Buat `routes/transactionRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

// Semua route ini butuh autentikasi
router.use(auth);

router.get('/', transactionController.getTransactions);
router.post('/', transactionController.addTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
```

---

## 📂 TAHAP 2.6: Kategori

### Buat `controllers/categoryController.js`
```javascript
const pool = require('../config/db');

exports.getCategories = async (req, res) => {
    try {
        const userId = req.user.id;

        // Ambil kategori default + kategori custom user
        const result = await pool.query(
            `SELECT * FROM categories
             WHERE user_id IS NULL OR user_id = $1
             ORDER BY type, name`,
            [userId]
        );

        res.json({
            count: result.rows.length,
            categories: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, type, icon } = req.body;

        if (!name || !type) {
            return res.status(400).json({ message: 'Name dan type wajib diisi' });
        }

        const result = await pool.query(
            'INSERT INTO categories (name, type, icon, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, type, icon, userId]
        );

        res.status(201).json({
            message: 'Kategori berhasil ditambahkan',
            category: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

### Buat `routes/categoryRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

router.use(auth);

router.get('/', categoryController.getCategories);
router.post('/', categoryController.addCategory);

module.exports = router;
```

---

## 💰 TAHAP 2.6b: CRUD Budget (Anggaran)

> **Tujuan**: Mengelola batas pengeluaran per kategori per bulan. User bisa menentukan berapa budget maksimal untuk setiap kategori pengeluaran di bulan tertentu.

### Struktur Table `tb_budgets`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | SERIAL PRIMARY KEY | ID budget (auto increment) |
| `user_id` | UUID NOT NULL | ID user pemilik budget (foreign key ke `tb_users`) |
| `category_id` | INT NOT NULL | ID kategori terkait (foreign key ke `tb_categories`) |
| `amount` | NUMERIC(15,2) NOT NULL | Besaran budget (batas maksimal pengeluaran) |
| `month` | INT NOT NULL | Bulan budget (1-12) |
| `year` | INT NOT NULL | Tahun budget |
| `UNIQUE` | (user_id, category_id, month, year) | Satu kategori hanya boleh punya 1 budget per bulan |

### Buat `controllers/budgetController.js`

#### 1. Get Semua Budget User
```javascript
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

        // Filter berdasarkan bulan & tahun jika ada
        if (month && year) {
            query += ` AND b.month = $${params.length + 1}
                       AND b.year = $${params.length + 2}`;
            params.push(month, year);
        }

        query += " ORDER BY b.year DESC, b.month DESC, c.name ASC";

        const result = await pool.query(query, params);

        res.json({
            count: result.rows.length,
            budgets: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

#### 2. Tambah Budget
```javascript
exports.addBudget = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category_id, amount, month, year } = req.body;

        // Validasi input
        if (!category_id || !amount || !month || !year) {
            return res.status(400).json({
                message: 'Category_id, amount, month, dan year wajib diisi'
            });
        }

        if (month < 1 || month > 12) {
            return res.status(400).json({ message: 'Month harus antara 1 dan 12' });
        }

        // Cek apakah budget untuk kategori & bulan ini sudah ada
        const existing = await pool.query(
            `SELECT * FROM tb_budgets
             WHERE user_id = $1 AND category_id = $2 AND month = $3 AND year = $4`,
            [userId, category_id, month, year]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                message: 'Budget untuk kategori ini di bulan tersebut sudah ada'
            });
        }

        const result = await pool.query(
            `INSERT INTO tb_budgets (user_id, category_id, amount, month, year)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, category_id, amount, month, year]
        );

        res.status(201).json({
            message: 'Budget berhasil ditambahkan',
            budget: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

#### 3. Edit Budget
```javascript
exports.updateBudget = async (req, res) => {
    try {
        const userId = req.user.id;
        const budgetId = req.params.id;
        const { category_id, amount, month, year } = req.body;

        // Cek apakah budget milik user
        const existing = await pool.query(
            'SELECT * FROM tb_budgets WHERE id = $1 AND user_id = $2',
            [budgetId, userId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Budget tidak ditemukan' });
        }

        if (month && (month < 1 || month > 12)) {
            return res.status(400).json({ message: 'Month harus antara 1 dan 12' });
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
                userId
            ]
        );

        res.json({
            message: 'Budget berhasil diupdate',
            budget: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

#### 4. Hapus Budget
```javascript
exports.deleteBudget = async (req, res) => {
    try {
        const userId = req.user.id;
        const budgetId = req.params.id;

        const result = await pool.query(
            'DELETE FROM tb_budgets WHERE id = $1 AND user_id = $2 RETURNING *',
            [budgetId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Budget tidak ditemukan' });
        }

        res.json({ message: 'Budget berhasil dihapus' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

### Buat `routes/budgetRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const budgetController = require('../controllers/budgetController');

// Semua route ini butuh autentikasi
router.use(auth);

router.get('/', budgetController.getBudgets);
router.post('/', budgetController.addBudget);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
```

---

### Tambahkan di `controllers/transactionController.js`

#### Get Summary (Saldo, Total Income, Total Expense Bulanan)
```javascript
exports.getSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query;

        const currentMonth = month || new Date().getMonth() + 1;
        const currentYear = year || new Date().getFullYear();

        // Total Income
        const incomeResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM transactions
             WHERE user_id = $1 AND type = 'income'
             AND EXTRACT(MONTH FROM date) = $2
             AND EXTRACT(YEAR FROM date) = $3`,
            [userId, currentMonth, currentYear]
        );

        // Total Expense
        const expenseResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM transactions
             WHERE user_id = $1 AND type = 'expense'
             AND EXTRACT(MONTH FROM date) = $2
             AND EXTRACT(YEAR FROM date) = $3`,
            [userId, currentMonth, currentYear]
        );

        // Total Seluruh Saldo
        const balanceResult = await pool.query(
            `SELECT
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as balance
             FROM transactions
             WHERE user_id = $1`,
            [userId]
        );

        const totalIncome = parseFloat(incomeResult.rows[0].total);
        const totalExpense = parseFloat(expenseResult.rows[0].total);

        res.json({
            month: parseInt(currentMonth),
            year: parseInt(currentYear),
            totalIncome,
            totalExpense,
            balance: parseFloat(balanceResult.rows[0].balance),
            netIncome: totalIncome - totalExpense
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

#### Get Expense by Category (untuk Pie Chart)
```javascript
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
             FROM categories c
             LEFT JOIN transactions t ON c.id = t.category_id
                 AND EXTRACT(MONTH FROM t.date) = $2
                 AND EXTRACT(YEAR FROM t.date) = $3
                 AND t.user_id = $1
                 AND t.type = 'expense'
             WHERE c.type = 'expense' AND (c.user_id IS NULL OR c.user_id = $1)
             GROUP BY c.id, c.name, c.icon
             HAVING COALESCE(SUM(t.amount), 0) > 0
             ORDER BY total DESC`,
            [userId, currentMonth, currentYear]
        );

        res.json({
            month: parseInt(currentMonth),
            year: parseInt(currentYear),
            categories: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

#### Update `routes/transactionRoutes.js` untuk menambah summary routes
```javascript
router.get('/summary', transactionController.getSummary);
router.get('/summary/category', transactionController.getExpenseByCategory);
```

---

## 🚀 TAHAP 2.8: Entry Point Server

### Buat `server.js`
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'API Catatan Keuangan Berjalan!' });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
```

---

## 🧪 TAHAP 2.9: Testing dengan Postman (Step by Step)

> **Pastikan server backend sudah berjalan** sebelum testing!
> Jalankan: `npm run dev` di terminal backend

---

### 📥 Langkah 0: Install Postman

1. Download Postman di https://www.postman.com/downloads/
2. Install seperti biasa
3. Buka Postman

---

### 📝 Langkah 1: Register User Baru

**Tujuan**: Membuat akun baru untuk testing

1. **Buka tab baru** di Postman (klik tab `+`)
2. **Ubah method** menjadi `POST` (klik dropdown yang tertulis GET, pilih POST)
3. **Masukkan URL**: `http://localhost:5000/api/auth/register`
4. **Klik tab `Body`** di bawah kolom URL
5. **Pilih `raw`** (bukan form-data, x-www-form-urlencoded, dll)
6. **Ubah dropdown di sebelah raw** dari `Text` menjadi `JSON`
7. **Ketik body** seperti ini:

```json
{
    "username": "testuser",
    "email": "test@email.com",
    "password": "123456"
}
```

8. **Klik tombol `Send`** (biru, di sebelah kanan URL)

**Expected Response (Status 201 Created):**
```json
{
    "message": "Registrasi berhasil",
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@email.com"
    }
}
```

> Jika muncul error 409, berarti email/username sudah terdaftar. Ganti dengan data lain.

---

### 🔑 Langkah 2: Login & Mendapatkan Token JWT

**Tujuan**: Login dan ambil token untuk akses endpoint lain

1. **Buka tab baru** di Postman (klik tab `+`)
2. **Ubah method** menjadi `POST`
3. **Masukkan URL**: `http://localhost:5000/api/auth/login`
4. **Klik tab `Body`**
5. **Pilih `raw`** → **pilih `JSON`**
6. **Ketik body**:

```json
{
    "email": "test@email.com",
    "password": "123456"
}
```

7. **Klik tombol `Send`**

**Expected Response (Status 200 OK):**
```json
{
    "message": "Login berhasil",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTY5MjMwMDAwMH0.XXXXXXX",
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@email.com"
    }
}
```

### ⚠️ CARA MENDAPATKAN TOKEN

Perhatikan response di atas! **Token** ada di field `"token"`:
```
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Untuk menyalin token:**
1. **Klik dan drag** untuk select seluruh teks token (bagian setelah `"token": "`)
2. **Klik kanan** → **Copy** (atau `Ctrl+C`)
3. **Simpan token ini** di temporary notepad atau langsung paste di langkah berikutnya

> **Catatan Penting**: Token ini akan expire dalam 24 jam. Jika expired, login lagi untuk dapat token baru.

---

### 🔐 Langkah 3: Cara Menggunakan Token di Request Lain

**Setiap request yang butuh autentikasi harus pakai token!**

Caranya:
1. **Buka tab baru** untuk request
2. **Setelah memilih method dan URL**, klik tab **`Headers`** (di bawah kolom URL)
3. **Tambahkan header baru**:

| Key | Value |
|-----|-------|
| `Authorization` | `Bearer TOKEN_ANDA_DISINI` |

**Contoh tampilan di Postman:**
```
Key:    Authorization
Value:  Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Pastikan ada spasi** antara `Bearer` dan token!
> Format: `Bearer <spasi> <token>`

---

### 📂 Langkah 4: Cek Kategori

1. **Buka tab baru**
2. **Method**: `GET`
3. **URL**: `http://localhost:5000/api/categories`
4. **Tab Headers**: Tambahkan `Authorization: Bearer <token_anda>`
5. **Klik `Send`**

**Expected Response:**
```json
{
    "count": 6,
    "categories": [
        { "id": 1, "name": "Gaji", "type": "income", "icon": "briefcase" },
        { "id": 2, "name": "Freelance", "type": "income", "icon": "laptop" },
        { "id": 3, "name": "Makanan", "type": "expense", "icon": "utensils" },
        ...
    ]
}
```

> **Catatan**: Simpan `category_id` yang akan digunakan untuk transaksi!

---

### 💰 Langkah 5: Tambah Transaksi

1. **Buka tab baru**
2. **Method**: `POST`
3. **URL**: `http://localhost:5000/api/transactions`
4. **Tab Headers**: `Authorization: Bearer <token_anda>`
5. **Tab Body** → `raw` → `JSON`:

```json
{
    "category_id": 1,
    "type": "income",
    "amount": 5000000,
    "description": "Gaji bulanan Agustus",
    "date": "2026-08-19"
}
```

6. **Klik `Send`**

**Expected Response (201):**
```json
{
    "message": "Transaksi berhasil ditambahkan",
    "transaction": {
        "id": 1,
        "user_id": 1,
        "category_id": 1,
        "type": "income",
        "amount": "5000000.00",
        "description": "Gaji bulanan Agustus",
        "date": "2026-08-19"
    }
}
```

---

### 📋 Langkah 6: Lihat Semua Transaksi

1. **Method**: `GET`
2. **URL**: `http://localhost:5000/api/transactions`
3. **Tab Headers**: `Authorization: Bearer <token_anda>`
4. **Klik `Send`**

---

### 📊 Langkah 7: Lihat Ringkasan Keuangan

1. **Method**: `GET`
2. **URL**: `http://localhost:5000/api/transactions/summary?month=8&year=2026`
3. **Tab Headers**: `Authorization: Bearer <token_anda>`
4. **Klik `Send`**

**Expected Response:**
```json
{
    "month": 8,
    "year": 2026,
    "totalIncome": 5000000,
    "totalExpense": 0,
    "balance": 5000000,
    "netIncome": 5000000
}
```

---

### 📈 Langkah 8: Lihat Expense per Kategori

1. **Method**: `GET`
2. **URL**: `http://localhost:5000/api/transactions/summary/category?month=8&year=2026`
3. **Tab Headers**: `Authorization: Bearer <token_anda>`
4. **Klik `Send`**

---

### ✏️ Langkah 9: Edit Transaksi

1. **Method**: `PUT`
2. **URL**: `http://localhost:5000/api/transactions/1`
3. **Tab Headers**: `Authorization: Bearer <token_anda>`
4. **Tab Body** → `raw` → `JSON`:

```json
{
    "category_id": 1,
    "type": "income",
    "amount": 5500000,
    "description": "Gaji bulanan Agustus (updated)",
    "date": "2026-08-19"
}
```

5. **Klik `Send`**

---

### 🗑️ Langkah 10: Hapus Transaksi

1. **Method**: `DELETE`
2. **URL**: `http://localhost:5000/api/transactions/1`
3. **Tab Headers**: `Authorization: Bearer <token_anda>`
4. **Klik `Send`**

---

### 💰 Langkah 11: Tambah Budget

**Tujuan**: Membuat batas pengeluaran untuk suatu kategori di bulan tertentu

1. **Buka tab baru**
2. **Method**: `POST`
3. **URL**: `http://localhost:5000/api/budgets`
4. **Tab Headers**: `Authorization: Bearer <token_anda>`
5. **Tab Body** → `raw` → `JSON`:

```json
{
    "category_id": 3,
    "amount": 500000,
    "month": 8,
    "year": 2026
}
```

> **Keterangan**: `category_id: 3` adalah kategori "Makanan". Artinya budget makanan bulan Agustus 2026 adalah Rp 500.000.

6. **Klik `Send`**

**Expected Response (201):**
```json
{
    "message": "Budget berhasil ditambahkan",
    "budget": {
        "id": 1,
        "user_id": "uuid-anda",
        "category_id": 3,
        "amount": "500000.00",
        "month": 8,
        "year": 2026
    }
}
```

> **Catatan**: Jika muncul error 409, berarti budget untuk kategori & bulan tersebut sudah ada.

---

### 📋 Langkah 12: Lihat Semua Budget

1. **Method**: `GET`
2. **URL**: `http://localhost:5000/api/budgets`
3. **Tab Headers**: `Authorization: Bearer <token_anda>`
4. **Klik `Send`**

**Expected Response:**
```json
{
    "count": 1,
    "budgets": [
        {
            "id": 1,
            "user_id": "uuid-anda",
            "category_id": 3,
            "amount": "500000.00",
            "month": 8,
            "year": 2026,
            "category_name": "Makanan",
            "category_icon": "utensils"
        }
    ]
}
```

**Filter by bulan & tahun:**
- URL: `http://localhost:5000/api/budgets?month=8&year=2026`

---

### 🔍 Langkah 13: Lihat Budget per Kategori Tertentu

1. **Method**: `GET`
2. **URL**: `http://localhost:5000/api/budgets?month=8&year=2026`
3. **Tab Headers**: `Authorization: Bearer <token_anda>`
4. **Klik `Send`**

---

### ✏️ Langkah 14: Edit Budget

1. **Method**: `PUT`
2. **URL**: `http://localhost:5000/api/budgets/1`
3. **Tab Headers**: `Authorization: Bearer <token_anda>`
4. **Tab Body** → `raw` → `JSON`:

```json
{
    "amount": 600000,
    "month": 8,
    "year": 2026
}
```

> **Keterangan**: Update budget makanan dari Rp 500.000 menjadi Rp 600.000.

5. **Klik `Send`**

**Expected Response:**
```json
{
    "message": "Budget berhasil diupdate",
    "budget": {
        "id": 1,
        "user_id": "uuid-anda",
        "category_id": 3,
        "amount": "600000.00",
        "month": 8,
        "year": 2026
    }
}
```

---

### 🗑️ Langkah 15: Hapus Budget

1. **Method**: `DELETE`
2. **URL**: `http://localhost:5000/api/budgets/1`
3. **Tab Headers**: `Authorization: Bearer <token_anda>`
4. **Klik `Send`**

**Expected Response:**
```json
{
    "message": "Budget berhasil dihapus"
}
```**

---

### ⚠️ Troubleshooting di Postman

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `401 Unauthorized` | Token tidak ada atau expired | Login ulang, dapatkan token baru |
| `401 "Akses ditolak, token tidak ditemukan"` | Lupa pasang header Authorization | Tambahkan header `Authorization: Bearer <token>` |
| `401 "Token tidak valid"` | Token salah atau expired | Copy token dengan benar dari response login |
| `400 "Semua field wajib diisi"` | Body kosong atau ada field yang missing | Pastikan semua field diisi di body JSON |
| `409 "Email atau Username sudah terdaftar"` | Email/username sudah dipakai | Gunakan email/username lain saat register |
| `409 "Budget untuk kategori ini sudah ada"` | Budget untuk kategori & bulan yang sama sudah dibuat | Update budget yang sudah ada atau gunakan kategori/bulan lain |
| `500 "Server error"` | Server mati atau ada error di backend | Cek terminal backend, pastikan server jalan |
| `ECONNREFUSED` | Server tidak jalan | Jalankan `npm run dev` di backend |

---

### 📋 Ringkasan Order Testing

| Urutan | Method | Endpoint | Keterangan |
|--------|--------|----------|------------|
| 1 | POST | `/api/auth/register` | Register dulu (tanpa token) |
| 2 | POST | `/api/auth/login` | Login, **AMBIL TOKEN** dari response |
| 3 | GET | `/api/categories` | Cek kategori (pakai token) |
| 4 | POST | `/api/transactions` | Tambah transaksi (pakai token) |
| 5 | GET | `/api/transactions` | Lihat transaksi (pakai token) |
| 6 | GET | `/api/transactions/summary` | Lihat ringkasan (pakai token) |
| 7 | GET | `/api/transactions/summary/category` | Lihat expense/kategori (pakai token) |
| 8 | PUT | `/api/transactions/:id` | Edit transaksi (pakai token) |
| 9 | DELETE | `/api/transactions/:id` | Hapus transaksi (pakai token) |
| 10 | POST | `/api/budgets` | Tambah budget (pakai token) |
| 11 | GET | `/api/budgets` | Lihat semua budget (pakai token) |
| 12 | GET | `/api/budgets?month=8&year=2026` | Lihat budget per bulan (pakai token) |
| 13 | PUT | `/api/budgets/:id` | Edit budget (pakai token) |
| 14 | DELETE | `/api/budgets/:id` | Hapus budget (pakai token) |

---

## ✅ Checklist Penyelesaian Tahap 2

- [ ] Project backend terinisialisasi dengan benar
- [ ] Database PostgreSQL dan tabel sudah dibuat
- [ ] Koneksi database (`config/db.js`) berfungsi
- [ ] Register user berhasil (password ter-encrypt)
- [ ] Login user berhasil (menghasilkan JWT token)
- [ ] Middleware autentikasi berfungsi
- [ ] CRUD Transaksi berfungsi (Create, Read, Update, Delete)
- [ ] CRUD Budget berfungsi (Create, Read, Update, Delete)
- [ ] Endpoint Summary berfungsi
- [ ] Endpoint Kategori berfungsi
- [ ] Semua endpoint sudah diuji dengan Postman/Thunder Client

---

## 📝 Catatan Penting

1. **Keamanan**: Selalu gunakan `bcrypt` untuk password, jangan pernah simpan plain text
2. **JWT**: TokenExpiredError terjadi setelah 24 jam, user harus login ulang
3. **Validasi**: Selalu validasi input di backend, jangan percaya pada frontend saja
4. **Error Handling**: Gunakan try-catch di setiap controller
5. **SQL Injection**: Gunakan parameterized query ($1, $2, dst) bukan string concatenation

---

## 🎯 Selanjutnya

Setelah Tahap 2 selesai, lanjut ke **Tahap 3: Frontend Web (Vue.js 3 + Pinia)**
