# Alur Pembuatan Backend (Step by Step)

> **Proyek**: Sistem Aplikasi Catatan Keuangan Pribadi
> **Tech Stack**: Express.js + Node.js + PostgreSQL

---

## 🗺️ Alur Pembuatan Backend

### **TAHAP 1: Inisialisasi Project**
> *Membuat fondasi awal*

1. Buat folder `backend`
2. Jalankan `npm init -y` untuk membuat `package.json`
3. Install semua dependencies:
   ```bash
   npm install express pg dotenv cors bcrypt jsonwebtoken
   npm install --save-dev nodemon
   ```
4. Buat file `.env` berisi kredensial database & JWT secret

---

### **TAHAP 2: Setup Database PostgreSQL**
> *Membuat "rumah" penyimpanan data*

1. Buat database: `CREATE DATABASE db_pencatatan;`
2. Buat tabel `tb_users` (data user/login)
3. Buat tabel `tb_categories` (kategori pemasukan/pengeluaran) + insert data default
4. Buat tabel `tb_transactions` (catatan transaksi)
5. Buat tabel `tb_budgets` (anggaran per kategori per bulan)

> ⚠️ **Mengapa di awal?** Karena semua controller nantinya akan mengquery database ini. Tanpa tabel, kode backend tidak akan bisa dijalankan.

---

### **TAHAP 3: Buat Konfigurasi Database (`config/db.js`)**
> *Membuat "jembatan" koneksi ke database*

- Buat file `config/db.js` yang berisi koneksi Pool ke PostgreSQL
- Pool membaca data dari `.env`

> 📌 **Mengapa ini duluan?** Karena **semua controller** akan memanggil `require('../config/db')` untuk query. Jadi config ini harus siap terlebih dahulu.

---

### **TAHAP 4: Buat Server Utama (`server.js`) - Versi Minimal**
> *Membuat "tulang punggung" server*

Buat `server.js` dengan isi dasar:
- Import express, cors, dotenv
- Setup middleware `cors()` dan `express.json()`
- Buat route root `/` untuk pengecekan server
- Jalankan `app.listen(PORT)`

> 📌 **Mengapa sekarang?** Agar bisa langsung test apakah server bisa berjalan dengan `npm run dev`, meskipun belum ada route lain.

---

### **TAHAP 5: Buat Autentikasi (Register & Login)**
> *Membuat "gerbang keamanan" - FITUR PERTAMA yang harus ada*

**Urutan dalam autentikasi:**

| Urutan | File | Yang Dibuat |
|--------|------|-------------|
| 5a | `controllers/authController.js` | Logika `register` (hash password + simpan user) dan `login` (verifikasi password + buat JWT) |
| 5b | `middleware/auth.js` | Middleware JWT verifikasi (penjaga semua route yang butuh login) |
| 5c | `routes/authRoutes.js` | Route `/register` dan `/login` (TANPA middleware auth) |
| 5d | Update `server.js` | Daftarkan `authRoutes` ke `/api/auth` |

> 📌 **Mengapa autentikasi duluan?**
> - Karena semua fitur lain (transaksi, kategori, budget) **wajib login**.
> - Tanpa autentikasi, tidak ada cara memberi identitas user pada data.
> - User ID dari JWT (`req.user.id`) dibutuhkan di semua controller lain.

---

### **TAHAP 6: Buat Fitur Kategori**
> *Membuat "label/tag" untuk mengelompokkan transaksi*

| Urutan | File | Yang Dibuat |
|--------|------|-------------|
| 6a | `controllers/categoryController.js` | Logika `getCategories`, `addCategory`, `deleteCategory` |
| 6b | `routes/categoryRoutes.js` | Route dengan middleware auth |
| 6c | Update `server.js` | Daftarkan `categoryRoutes` ke `/api/categories` |

> 📌 **Mengapa kategori sebelum transaksi?**
> - Karena setiap transaksi **harus punya `category_id`**.
> - Harus ada data kategori dulu baru bisa membuat transaksi.

---

### **TAHAP 7: Buat Fitur Transaksi (CRUD + Analitik)**
> *Fitur INTI dari aplikasi catatan keuangan*

| Urutan | File | Yang Dibuat |
|--------|------|-------------|
| 7a | `controllers/transactionController.js` | Logika `getTransactions`, `addTransaction`, `updateTransaction`, `deleteTransaction` |
| 7b | Tambah di controller yang sama | `getSummary` (total saldo, income, expense) dan `getExpenseByCategory` (untuk pie chart) |
| 7c | `routes/transactionRoutes.js` | Route dengan middleware auth + route summary |
| 7d | Update `server.js` | Daftarkan `transactionRoutes` ke `/api/transactions` |

> 📌 **Mengapa transaksi sesudah kategori?**
> - Transaksi membutuhkan `category_id` yang sudah ada di database.
> - Query transaksi melakukan `JOIN` ke tabel `tb_categories`.

---

### **TAHAP 8: Buat Fitur Budget (Anggaran)**
> *Fitur tambahan untuk mengontrol pengeluaran*

| Urutan | File | Yang Dibuat |
|--------|------|-------------|
| 8a | `controllers/budgetController.js` | Logika CRUD budget |
| 8b | `routes/budgetRoutes.js` | Route dengan middleware auth |
| 8c | Update `server.js` | Daftarkan `budgetRoutes` ke `/api/budgets` |

> 📌 **Mengapa budget paling akhir?**
> - Budget adalah fitur **tambahan** yang bergantung pada kategori.
> - Tidak ada dependensi ke controller lain, jadi bisa dibuat kapan saja setelah kategori jadi.

---

### **TAHAP 9: Testing dengan Postman/Thunder Client**
> *Memastikan semua API berfungsi*

Urutan testing yang benar:
1. **Register** → POST `/api/auth/register` (tanpa token)
2. **Login** → POST `/api/auth/login` → **SALIN TOKEN**
3. **Lihat Kategori** → GET `/api/categories` (pakai token)
4. **Tambah Transaksi** → POST `/api/transactions` (pakai token)
5. **Lihat Transaksi** → GET `/api/transactions`
6. **Ringkasan Saldo** → GET `/api/transactions/summary`
7. **Expense per Kategori** → GET `/api/transactions/summary/category`
8. **Edit/Hapus Transaksi**
9. **Budget CRUD** → POST/GET/PUT/DELETE `/api/budgets`

---

## 🔄 Visualisasi Dependensi (Kenapa Urutannya Begitu)

```
┌─────────────────────────────────────────────────────┐
│                    .env (Kredensial)                  │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│              config/db.js (Koneksi DB)               │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│         Database PostgreSQL (Tabel-tabel)             │
│    users → categories → transactions, budgets        │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│       controllers/authController.js                  │
│       middleware/auth.js                             │
│       routes/authRoutes.js                           │
│       (Autentikasi - GERBANG PERTAMA)                │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│    controllers/categoryController.js                 │
│    routes/categoryRoutes.js                          │
│    (Kategori - DIBUTUHKAN oleh Transaksi)            │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│    controllers/transactionController.js              │
│    routes/transactionRoutes.js                       │
│    (Transaksi - FITUR INTI)                          │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│    controllers/budgetController.js                   │
│    routes/budgetRoutes.js                            │
│    (Budget - FITUR TAMBAHAN)                         │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│         server.js (Menghubungkan Semua)              │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Ringkasan Aturan Emas

| # | Aturan | Alasan |
|---|--------|--------|
| 1 | **Database duluan** | Tanpa tabel, tidak ada yang bisa di-query |
| 2 | **Config DB kedua** | Semua controller butuh koneksi DB |
| 3 | **Autentikasi ketiga** | Semua fitur lain butuh identitas user dari JWT |
| 4 | **Kategori sebelum Transaksi** | Transaksi butuh `category_id` |
| 5 | **Transaksi sebelum Budget** | Budget adalah fitur pengontrol transaksi |
| 6 | **Controller sebelum Route** | Route memanggil fungsi di controller |
| 7 | **Route sebelum Server.js** | Server.js memuat semua route |

---

## 📁 Struktur Folder Backend (Hasil Akhir)

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
├── .env                   # Environment variables (RAHASIA)
├── package.json
└── server.js              # Entry point Express
```

---

## 📦 Dependencies yang Digunakan

| Package | Fungsi |
|---------|--------|
| `express` | Framework web server |
| `pg` | PostgreSQL client untuk Node.js |
| `dotenv` | Membaca variabel dari `.env` |
| `cors` | Mengizinkan akses cross-origin dari frontend |
| `bcrypt` | Enkripsi password (hashing) |
| `jsonwebtoken` | Membuat & verifikasi token JWT |
| `nodemon` | Auto-restart server saat perubahan (dev) |

---

## 🔌 API Endpoints

### Autentikasi (Tanpa Login)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/api/auth/register` | Daftar akun baru |
| POST | `/api/auth/login` | Login & dapatkan token |

### Transaksi (Wajib Login)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/transactions` | Lihat semua transaksi |
| GET | `/api/transactions/summary` | Ringkasan saldo bulanan |
| GET | `/api/transactions/summary/category` | Pengeluaran per kategori |
| POST | `/api/transactions` | Tambah transaksi |
| PUT | `/api/transactions/:id` | Edit transaksi |
| DELETE | `/api/transactions/:id` | Hapus transaksi |

### Kategori (Wajib Login)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/categories` | Lihat semua kategori |
| POST | `/api/categories` | Tambah kategori custom |
| DELETE | `/api/categories/:id` | Hapus kategori custom |

### Budget (Wajib Login)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/budgets` | Lihat semua budget |
| POST | `/api/budgets` | Tambah budget |
| PUT | `/api/budgets/:id` | Edit budget |
| DELETE | `/api/budgets/:id` | Hapus budget |

---

## 💡 Tips Penting

1. **Keamanan**: Selalu gunakan `bcrypt` untuk password, jangan pernah simpan plain text
2. **JWT**: Token expire dalam 24 jam, user harus login ulang jika expired
3. **Validasi**: Selalu validasi input di backend, jangan percaya pada frontend saja
4. **Error Handling**: Gunakan `try-catch` di setiap controller
5. **SQL Injection**: Gunakan parameterized query (`$1, $2, dst`) bukan string concatenation

---

*File ini dibuat sebagai panduan alur pembuatan backend proyek Catatan Keuangan.*
