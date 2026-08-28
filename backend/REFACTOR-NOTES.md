# Dokumentasi Perombakan Struktur Backend

Dokumen ini menjelaskan perubahan struktur folder backend `Website_pencatatan` dari struktur datar (flat) menjadi **layered architecture** (berlapis). Tujuan utama: membuat kode lebih rapi, terorganisir, konsisten, dan **mudah melacak bug/error**.

---

## 1. Struktur Folder Sebelum (Lama)

```
backend/
├── .env
├── package.json
├── server.js            # setup express + mount routes + listen (semua di satu file)
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── transactionController.js
│   ├── categoryController.js
│   └── budgetController.js
├── middleware/
│   └── auth.js
└── routes/
    ├── authRoutes.js
    ├── transactionRoutes.js
    ├── categoryRoutes.js
    └── budgetRoutes.js
```

**Masalah pada struktur lama:**
- Logika bisnis, validasi, dan query SQL **tercampur** dalam satu controller.
- Tiap fungsi mengulang blok `try/catch` dan `res.status(500).json({ message: 'Server error' })`.
- `server.js` menampung setup app + mount routes + listener sekaligus (sulit di-test).
- Tidak ada penanganan error terpusat → error sulit dilacak dan response error tidak konsisten.
- Tidak ada validasi terpusat, `.gitignore`, atau dokumentasi struktur tabel.

---

## 2. Struktur Folder Sesudah (Baru)

```
backend/
├── db/
│   └── schema.sql                  # Definisi tabel (DDL) untuk setup DB dari nol
├── src/
│   ├── app.js                      # Setup express, mount routes, 404 + error handler
│   ├── server.js                   # Entry point: import app lalu listen
│   ├── config/
│   │   └── db.js                   # Koneksi PostgreSQL (pool)
│   ├── controllers/                # Handler HTTP (tipis): baca request, kirim response
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── categoryController.js
│   │   └── budgetController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js       # Verifikasi JWT
│   │   ├── validate.js             # Validasi payload via skema Joi
│   │   └── errorHandler.js         # 404 + error terpusat
│   ├── models/                     # Query/akses langsung ke database
│   │   ├── userModel.js
│   │   ├── transactionModel.js
│   │   ├── categoryModel.js
│   │   └── budgetModel.js
│   ├── routes/
│   │   ├── index.js                # Penggabung semua route → mount sekali di /api
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── budgetRoutes.js
│   ├── services/                   # Logika bisnis + validasi lanjutan
│   │   ├── userService.js
│   │   ├── transactionService.js
│   │   ├── categoryService.js
│   │   └── budgetService.js
│   ├── validations/                # Skema validasi input (Joi)
│   │   ├── authValidation.js
│   │   ├── transactionValidation.js
│   │   ├── categoryValidation.js
│   │   └── budgetValidation.js
│   └── utils/                      # Helper umum
│       ├── ApiError.js             # Class error khusus (status + pesan)
│       └── asyncHandler.js         # Wrapper Promise pengganti try/catch berulang
├── .env                            # Konfigurasi rahasia (tidak di-commit)
├── .env.example                    # Template variabel env (untuk developer lain)
├── .gitignore                      # Abaikan node_modules, .env, log, dll
├── package.json
└── server.js                       # Thin entry: hanya import ./src/server lalu listen
```

---

## 3. Alur Kode & Alur Error (Kunci Mudah Melacak Bug)

**Alur normal:**
```
Request
  → routes/ (definisi endpoint)
  → middlewares/validate (validasi Joi pada body)
  → controllers/ (tipis, dibungkus asyncHandler)
  → services/ (logika bisnis + validasi lanjutan, melempar ApiError bila perlu)
  → models/ (query SQL ke database)
  → response JSON
```

**Alur error:**
```
Errors dilempar (ApiError dari service, error dari DB, dsb.)
  → diteruskan otomatis oleh asyncHandler
  → diteruskan ke middlewares/errorHandler (terpusat di akhir app)
  → jika ApiError (bisnis): response sesuai status code (400/401/404/409), tanpa log
  → jika error lain (server/bug): dicatat stack trace via console.error + response 500
```

**Keuntungan:**
- Tiap folder punya **satu tanggung jawab** → mudah dipahami.
- **Tidak ada try/catch berulang** lagi di controller (diganti `asyncHandler`).
- Semua error **terpusat di satu file** (`errorHandler.js`) → saat terjadi bug, tinggal cek satu tempat.
- Error bisnis (400/404/409) vs **error server/bug** dibedakan; error server mencatat stack trace agar mudah ditelusuri.
- Format response error **konsisten**: `{ success: false, message }`.

---

## 4. Ringkasan Perubahan per Folder

| Item | Sebelum | Sesudah | Keterangan |
|------|---------|---------|------------|
| `config/db.js` | `config/db.js` | `src/config/db.js` | Isi sama, path dipindah ke dalam `src/` |
| `middleware/auth.js` | lewat `res.status(401)` | `authMiddleware.js` lewat `next(ApiError(401))` | Konsisten dengan error handler |
| `server.js` | setup + routes + listen | **thin entry** → `require('./src/server')` | Script `npm start`/`dev` tidak berubah |
| Controllers | logika + query + try/catch | tipis + `asyncHandler`, tanpa SQL & try/catch | Pindah ke service & model |
| — | (tidak ada) | `services/` | Logika bisnis & validasi lanjutan |
| — | (tidak ada) | `models/` | Semua query SQL |
| — | (tidak ada) | `validations/` + `validate.js` | Validasi input via Joi |
| — | (tidak ada) | `utils/ApiError.js`, `asyncHandler.js` | Helper error & async wrapper |
| — | (tidak ada) | `middlewares/errorHandler.js` | 404 + error terpusat |
| — | mount per-route di server | `routes/index.js` → `app.use('/api', routes)` | Sederhanakan `app.js` |
| — | (tidak ada) | `db/schema.sql` | Dokumentasi & setup tabel dari nol |
| — | (tidak ada) | `.env.example`, `.gitignore` | Template env & abaikan file sensitif |

---

## 5. Perilaku API

**Tidak ada perubahan pada maksud/query bisnis.** Semua endpoint, query SQL, dan logic asli dipertahankan apa adanya — hanya lokasi & cara penulisan yang dirapikan:

| Metode | Endpoint | Controller | Service | Model |
|--------|----------|------------|---------|-------|
| POST | `/api/auth/register` | `authController.register` | `userService.register` | `userModel` |
| POST | `/api/auth/login` | `authController.login` | `userService.login` | `userModel` |
| GET | `/api/transactions` | `transactionController.getTransactions` | `transactionService.getTransactions` | `transactionModel` |
| POST | `/api/transactions` | `transactionController.addTransaction` | `transactionService.addTransaction` | `transactionModel` |
| PUT | `/api/transactions/:id` | `transactionController.updateTransaction` | `transactionService.updateTransaction` | `transactionModel` |
| DELETE | `/api/transactions/:id` | `transactionController.deleteTransaction` | `transactionService.deleteTransaction` | `transactionModel` |
| GET | `/api/transactions/summary` | `transactionController.getSummary` | `transactionService.getSummary` | `transactionModel` |
| GET | `/api/transactions/summary/category` | `transactionController.getExpenseByCategory` | `transactionService.getExpenseByCategory` | `transactionModel` |
| GET | `/api/categories` | `categoryController.getCategories` | `categoryService.getCategories` | `categoryModel` |
| POST | `/api/categories` | `categoryController.addCategory` | `categoryService.addCategory` | `categoryModel` |
| DELETE | `/api/categories/:id` | `categoryController.deleteCategory` | `categoryService.deleteCategory` | `categoryModel` |
| GET | `/api/budgets` | `budgetController.getBudgets` | `budgetService.getBudgets` | `budgetModel` |
| POST | `/api/budgets` | `budgetController.addBudget` | `budgetService.addBudget` | `budgetModel` |
| PUT | `/api/budgets/:id` | `budgetController.updateBudget` | `budgetService.updateBudget` | `budgetModel` |
| DELETE | `/api/budgets/:id` | `budgetController.deleteBudget` | `budgetService.deleteBudget` | `budgetModel` |

> Semua endpoint selain `/api/auth/*` dilindungi oleh `authMiddleware` (sama seperti sebelumnya).

---

## 6. Dependency Baru

- **`joi`** — library validasi skema. Digunakan di `src/validations/*` dan dipanggil lewat `middlewares/validate.js`.

---

## 7. Cara Menjalankan

```bash
npm install        # pasang dependency (jalankan sekali)
npm run dev        # development (nodemon, auto-reload)
# atau
npm start          # production
```

---

## 8. Jika Membutuhkan Setup Database dari Nol

Struktur tabel sudah didokumentasikan di `db/schema.sql`. Untuk membuat ulang:

```bash
psql -U <user> -d db_pencatatan -f db/schema.sql
```

Cukup gunakan jika ingin membuat database segar; struktur tabel yang sudah ada **tidak perlu** diubah.

---

## 9. Catatan

- File `.env` berisi kredensial → **jangan di-commit**. Gunakan `.env.example` (di root backend) sebagai template saat clone repo.
- Script `npm start` dan `npm run dev` tetap `node server.js` (tidak berubah), karena `server.js` root masih ada sebagai thin entry.
