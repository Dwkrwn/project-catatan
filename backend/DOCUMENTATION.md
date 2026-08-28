# Dokumentasi Pembahasan & Perubahan Backend
### Proyek: Website Pencatatan (Catatan Keuangan)

Dokumen ini mencatat seluruh rangkaian pembahasan dan perubahan yang telah dilakukan pada folder `backend` — mulai dari perombakan struktur, penambahan fitur penanganan error, validasi, hingga perbaikan bug yang ditemukan saat testing.

---

## Daftar Isi
1. [Latar Belakang & Tujuan](#1-latar-belakang--tujuan)
2. [Perbandingan Struktur Folder (Lama vs Baru)](#2-perbandingan-struktur-folder)
3. [Alur Kode & Alur Error](#3-alur-kode--alur-error)
4. [Kegunaan Setiap Folder](#4-kegunaan-setiap-folder)
5. [Perubahan Detail per Folder](#5-perubahan-detail-per-folder)
6. [Dependency Baru](#6-dependency-baru)
7. [Cara Menjalankan](#7-cara-menjalankan)
8. [Panduan Testing Transaksi via Postman](#8-panduan-testing-transaksi-via-postman)
9. [Bug yang Ditemukan & Cara Perbaikan](#9-bug-yang-ditemukan--cara-perbaikan)
10. [Catatan & Komentar Akhir](#10-catatan--komentar-akhir)

---

## 1. Latar Belakang & Tujuan

Pengguna ingin **merombak struktur folder backend** agar:
- Lebih **rapi** dan **mudah dipahami**.
- **Mudah dilacak** saat terjadi bug/error.

Struktur awal berbentuk *flat* di mana logika bisnis, validasi, dan query SQL **tercampur** dalam satu controller, dan `server.js` menampung semua setup. Hal ini menyulitkan pencarian sumber error.

Sebagai referensi, pengguna memiliki **proyek lain** dengan struktur *layered architecture* yang lebih rapi. Struktur tersebut diadopsi dan disesuaikan dengan kebutuhan proyek ini.

---

## 2. Perbandingan Struktur Folder

### Struktur Lama (Sebelum Perombakan)

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

### Struktur Baru (Sesudah Perombakan)

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
├── server.js                       # Thin entry: import ./src/server lalu listen
└── REFACTOR-NOTES.md               # Ringkasan rombak struktur
```

---

## 3. Alur Kode & Alur Error

### Alur Normal
```
Request
  → routes/ (definisi endpoint)
  → middlewares/validate (validasi Joi pada body)  [+ authMiddleware untuk protected route]
  → controllers/ (tipis, dibungkus asyncHandler)
  → services/ (logika bisnis + validasi lanjutan, melempar ApiError bila perlu)
  → models/ (query SQL ke database)
  → response JSON
```

### Alur Error
```
Errors dilempar (ApiError dari service, error dari DB, dsb.)
  → diteruskan otomatis oleh asyncHandler
  → diteruskan ke middlewares/errorHandler (terpusat di akhir app)
  → jika ApiError (bisnis): response sesuai status code (400/401/404/409), tanpa log
  → jika error lain (server/bug): dicatat stack trace via console.error + response 500
```

**Keuntungan:**
- Setiap folder punya satu tanggung jawab → mudah dipahami.
- Tidak ada try/catch berulang lagi di controller (diganti `asyncHandler`).
- Semua error **terpusat di satu file** → saat ada bug, tinggal cek satu tempat.
- Error bisnis vs **error server/bug** dibedakan; error server mencatat stack trace.
- Format response error **konsisten**: `{ success: false, message }`.

---

## 4. Kegunaan Setiap Folder

### Root Level

| Folder/File | Kegunaan |
|-------------|----------|
| `db/` | Definisi tabel database (`schema.sql`) untuk dokumentasi & setup dari nol |
| `src/` | Seluruh source code aplikasi (semua logika inti) |
| `server.js` | Thin entry point — hanya impor `./src/server` lalu menyalakan server |
| `.env` | Konfigurasi rahasia (DB, JWT secret) — tidak di-commit |
| `.env.example` | Template `.env` untuk developer lain saat clone repo |
| `.gitignore` | Daftar file yang diabaikan git (node_modules, .env, dll) |

### Di dalam `src/`

| Folder | Kegunaan | Konten |
|--------|----------|--------|
| **`config/`** | Setup & konfigurasi | `db.js` — koneksi pool PostgreSQL |
| **`app.js`** | Setup app Express: pasang middleware global (cors, json), mount routes `/api`, 404 + error handler | — |
| **`server.js`** | Menjalankan listener server (`app.listen`) | — |
| **`routes/`** | Memetakan URL → controller, plus middleware & validasi per endpoint | `index.js` (penggabung), `authRoutes`, `transactionRoutes`, `categoryRoutes`, `budgetRoutes` |
| **`controllers/`** | Layer tipis — baca request, panggil service, kirim response. Tanpa logika & try/catch | `auth`, `transaction`, `category`, `budget` |
| **`services/`** | Logika bisnis — validasi lanjutan, cek duplikat, hash password, kalkulasi; melempar `ApiError` | `user`, `transaction`, `category`, `budget` |
| **`models/`** | Akses database — semua query SQL | `user`, `transaction`, `category`, `budget` |
| **`middlewares/`** | Fungsi perantara (antara request & controller) | `authMiddleware` (Cek JWT), `validate` (Joi), `errorHandler` (404 + error terpusat) |
| **`validations/`** | Skema validasi input (Joi) yang dipakai middleware validate | `auth`, `transaction`, `category`, `budget` |
| **`utils/`** | Helper umum lintas layer | `ApiError` (class error), `asyncHandler` (wrapper hapus try/catch) |

### Prinsip Kunci
`controllers` tipis, `services` untuk bisnis, `models` untuk query → saat ada bug, langsung terlihat di layer mana masalahnya (error SQL → models, error logika → services, response salah → controllers).

---

## 5. Perubahan Detail per Folder

| Item | Sebelum | Sesudah | Keterangan |
|------|---------|---------|------------|
| `config/db.js` | `config/db.js` | `src/config/db.js` | Isi sama, path dipindah ke dalam `src/` |
| `middleware/auth.js` | lewat `res.status(401)` | `authMiddleware.js` lewat `next(ApiError(401))` | Konsisten dengan error handler |
| `server.js` | setup + routes + listen | thin entry → `require('./src/server')` | Script `npm start`/`dev` tidak berubah |
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

### Setup Database dari Nol (opsional)

Struktur tabel sudah didokumentasikan di `db/schema.sql`:

```bash
psql -U <user> -d db_pencatatan -f db/schema.sql
```

Cukup gunakan jika ingin membuat database segar; tabel yang sudah ada tidak perlu diubah.

---

## 8. Panduan Testing Transaksi via Postman

Semua endpoint transaksi (`/api/transactions*`) dilindungi `authMiddleware` → wajib kirim **token JWT**.

### Langkah 0: Login untuk Mendapat Token
1. **POST** `http://localhost:5000/api/auth/login`
2. **Body** (raw, JSON):
```json
{
  "email": "email_anda",
  "password": "password_anda"
}
```
3. Salin nilai `token` dari response.
4. Di Postman: tab **Authorization** → pilih **Bearer Token** → tempel token.
   *(Atau manual header: `Authorization: Bearer <token>`)*

### 1. POST — Tambah Transaksi
- **Method:** POST — **URL:** `http://localhost:5000/api/transactions`
- **Body** (raw, JSON):
```json
{
  "category_id": 1,
  "type": "expense",
  "amount": 50000,
  "description": "Beli makan siang",
  "date": "2026-08-28"
}
```
- **Validasi (Joi):** `type` wajib `income`/`expense`, `amount` angka positif, `category_id` **bertipe number** dan boleh null, `date` format tanggal.
- **Sukses:** `201` → `{ message: "Transaksi berhasil ditambahkan", transaction: {...} }`
- **Error:** `400` jika `type` bukan income/expense atau `amount` tidak valid; `400` jika `type`/`amount` kosong.

### 2. PUT — Update Transaksi
- **Method:** PUT — **URL:** `http://localhost:5000/api/transactions/{id}`
- **Body** (raw, JSON, bisa partial):
```json
{
  "amount": 75000,
  "description": "Beli makan malam"
}
```
- **Alur:** service cek transaksi `id` + `user_id` → jika tidak ada `404 "Transaksi tidak ditemukan"`, jika ada baru update.
- **Sukses:** `200` → `{ message: "Transaksi berhasil diupdate", transaction: {...} }`

### 3. DELETE — Hapus Transaksi
- **Method:** DELETE — **URL:** `http://localhost:5000/api/transactions/{id}`
- **Body:** kosong.
- **Alur:** hapus transaksi milik user dengan id tsb → jika tidak ada `404`, jika sukses `200` `{ message: "Transaksi berhasil dihapus" }`.

### Tips di Postman
1. Header `Authorization: Bearer <token>` wajib; tanpa ini `401 "Akses ditolak..."`.
2. Set `Content-Type: application/json` agar body terbaca.
3. `category_id` gunakan id kategori valid (bisa cek `GET /api/categories`). Jika dikosongkan, isi `null` atau hapus field.
4. `date` tidak wajib (default hari ini). Format `YYYY-MM-DD`.
5. Gunakan `GET /api/transactions` untuk verifikasi setelah POST/PUT/DELETE.

### Urutan Lengkap yang Disarankan
```
POST /api/auth/login        → dapat token
GET /api/categories         → ambil category_id
POST /api/transactions      → buat data → catat id
GET /api/transactions       → verifikasi data masuk
PUT /api/transactions/{id}  → ubah → verifikasi
DELETE /api/transactions/{id} → hapus → cek 404 jika dihapus ulang
```

---

## 9. Bug yang Ditemukan & Cara Perbaikan

### Bug: `"category_id" must be a string` saat POST transaksi

**Gejala:** Postman merespons
```json
{
  "success": false,
  "message": "\"category_id\" must be a string"
}
```

**Penyebab:** Skema Joi di `src/validations/transactionValidation.js` awalnya menetapkan `category_id` dengan `Joi.string()` (hanya menerima string), padahal kolom `category_id` di database `tb_transactions` bertipe **integer** (SERIAL). Jadi mengirim angka `1` ditolak.

**Perbaikan:**

| File | Sebelum | Sesudah |
|------|---------|---------|
| `src/validations/transactionValidation.js` | `category_id: Joi.string().required()` (via `testObjectId`) | `category_id: Joi.number().integer().allow(null).optional()` (+ hapus variabel `testObjectId`) |
| `src/validations/budgetValidation.js` | `category_id: Joi.string().required()/optional()` (budget: wajib) | `category_id: Joi.number().integer().required()/optional()` |

**Catatan:**
- `categoryValidation.js` **tidak perlu diubah** (tidak ada field `category_id`).
- Model dan service tidak perlu diubah — error murni dari validasi Joi.

> **Status saat ini:** Kedua file validasi sudah diperbaiki menjadi `Joi.number().integer()`, dan program **berjalan dengan baik** (terverifikasi oleh pengguna).

---

## 10. Catatan & Komentar Akhir

- File `.env` berisi kredensial → **jangan di-commit**. Gunakan `.env.example` sebagai template saat clone repo.
- Script `npm start` dan `npm run dev` tetap `node server.js` (tidak berubah), karena `server.js` root masih ada sebagai thin entry yang mengimpor `./src/server`.
- Prilaku API dan semua query bisnis **tidak diubah** selama perombakan — hanya lokasi, struktur, dan penanganan error yang dirapikan.

---

*Dokumen ini dibuat otomatis sebagai catatan pembahasan pengembangan. Perbarui bila ada perubahan struktur atau perilaku di kemudian hari.*
