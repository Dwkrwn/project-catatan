# Alur & Penjelasan Aplikasi CatatanKeu

Dokumen ini menjelaskan secara terperinci seluruh struktur, kegunaan folder, alur workflow, dan perilaku setiap halaman pada aplikasi **CatatanKeu** — aplikasi pencatatan keuangan pribadi.

---

# Gambaran Umum Aplikasi

Ini adalah **aplikasi pencatatan keuangan pribadi (CatatanKeu)** dengan arsitektur terpisah:
- **Backend** → Node.js + **Express 5** + **PostgreSQL** (pakai library `pg`), autentikasi JWT.
- **Frontend** → **Vue 3** (Composition API) + **Vue Router** + **Pinia** + **Vite**, dibuat dengan Axios untuk komunikasi API.

**Flow koneksi:** Frontend jalan di port `3000` (Vite dev server) → semua request ke `/api` **di-proxy** ke backend port `5000` (lihat `frontend/vite.config.js:9-14`). Jadi browser hanya berbicara ke frontend, dan frontend meneruskan request API ke backend. Backend berkomunikasi ke database PostgreSQL.

---

# BAGIAN 1 — BACKEND

Folder `backend/` adalah REST API. Ini penjelasan tiap file/folder:

## File di root backend

| File/Folder | Kegunaan |
|---|---|
| `server.js` | Entry point. Hanya 2 baris: membaca `.env` lalu memanggil `./src/server`. Dijalankan dengan `npm run dev` (nodemon) atau `npm start`. |
| `.env` / `.env.example` | Konfigurasi rahasia: port server, kredensial database (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`), dan `JWT_SECRET`. `.env` berisi nilai asli (jangan pernah di-commit), `.env.example` berisi template. |
| `.gitignore` | Daftar file yang tidak ikut Git (node_modules, .env, dst). |
| `package.json` | Daftar dependency (express, cors, dotenv, joi, jsonwebtoken, bcrypt, pg, nodemon) + script `start` dan `dev`. |
| `db/schema.sql` | **Skema database** — definisi 4 tabel (lihat bagian database di bawah). Dijalankan manual via `psql`. |
| `DOCUMENTATION.md`, `REFACTOR-NOTES.md`, `respon-frontend-ke-backend.md` | Catatan dokumentasi/catatan refactor. |

## `server.js` (di `src/`)

Memanggil `app` yang diekspor dari `src/app.js` lalu menjalankan `app.listen(PORT)` di port `5000` (atau dari `.env`).

## `src/app.js`

**"Pusat assembli" aplikasi Express.** Urutannya penting:
1. Pasang middleware global: `cors()` (mengizinkan akses dari browser) dan `express.json()` (membaca body JSON). — `app.js:9-10`
2. Daftarkan semua route di bawah prefix `/api` (dari `src/routes/index.js`). — `app.js:13`
3. Route root `/` memberi pesan "API berjalan". — `app.js:16-18`
4. Pasang `notFound` (404) dan `errorHandler` (500) **paling akhir** — rule Express: error handler harus terakhir. — `app.js:21-22`

## `src/config/db.js`

Membuat **koneksi pool PostgreSQL** (`pg.Pool`) memakai nilai dari `.env`. Pool = koneksi yang dibagi untuk banyak query (lebih efisien). Semua model mengimpor file ini.

## `src/routes/` — Pendefinisian endpoint

- `index.js` — Router gabungan: menggabungkan semua sub-route di bawah `/auth`, `/transactions`, `/categories`, `/budgets`. Jadi total endpoint lengkapnya: `/api/auth/*`, `/api/transactions/*`, `/api/categories/*`, `/api/budgets/*`.
- `authRoutes.js` — `POST /register` dan `POST /login`. **Satu-satunya route yang TIDAK butuh login.**
- `categoryRoutes.js` — `GET /`, `POST /`, `DELETE /:id`. Semua pakai `router.use(authMiddleware)` (harus login). — `categoryRoutes.js:8`
- `transactionRoutes.js` — `GET /`, `GET /summary`, `GET /summary/category`, `GET /summary/category/income`, `POST /`, `PUT /:id`, `DELETE /:id`.
- `budgetRoutes.js` — `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`.

Struktur route: **validasi** (middleware `validate`) → **controller**.

## `src/controllers/` — Penerjemah HTTP

Peran: menerima `req`, menyerahkan ke service, lalu membungkus hasilnya dalam `res.json()` dengan kode HTTP yang sesuai (201 untuk create, dst). Tidak berisi logika bisnis. Semua dibungkus `asyncHandler` agar error asinkron otomatis diteruskan ke error handler.
- `authController.js` — `register`, `login`.
- `categoryController.js` — `getCategories`, `addCategory`, `deleteCategory`. Di sinilah `req.user.id` (dari token) dipakai untuk membedakan data milik user.
- `transactionController.js` — CRUD transaksi + 3 endpoint summary/statistik.
- `budgetController.js` — CRUD budget.

## `src/services/` — Logika bisnis

Peran: tempat aturan bisnis, validasi tambahan, orchestrasi antar-model, dan pembentukan error.
- `userService.js` — **Register**: cek user sudah ada → hash password dengan **bcrypt** (10 salt) → simpan → generate **JWT** (berisi `{id, username}`, berlaku 24 jam). **Login**: cek email → bandingkan password dengan `bcrypt.compare` → generate token. — `userService.js:14-58`
- `categoryService.js` — Get kategori (gabungan default + milik user), tambah, hapus (hanya kategori milik user, dicek lewat `user_id`).
- `transactionService.js` — CRUD + statistik: `getSummary` menghitung total income, total expense bulan itu, saldo keseluruhan, dan netIncome (income − expense). `getExpenseByCategory` / `getIncomeByCategory` menghitung total per kategori.
- `budgetService.js` — CRUD budget + cegah duplikat (kategori sama untuk bulan/tahun yang sama → error 409).

## `src/models/` — Akses database (SQL)

Peran: satu-satunya tempat yang menyentuh SQL. Menggunakan **parameterized query** (`$1`, `$2`) untuk mencegah **SQL injection**. Setiap model mewakili 1 tabel:
- `userModel.js` — query ke `tb_users` (cari by email/username, buat user).
- `categoryModel.js` — `getAll` mengambil kategori default (`user_id IS NULL`) + kategori milik user. `remove` hanya menghapus jika `user_id` cocok (tidak bisa hapus kategori default).
- `transactionModel.js` — CRUD transaksi + query agregasi: total income, total expense per bulan, saldo (`SUM CASE WHEN type...`), dan `getByCategory` (gabung tabel kategori dengan transaksi pakai LEFT JOIN, dikelompokkan per kategori). Join dengan `tb_categories` untuk mendapatkan `category_name` & `category_icon`. — `transactionModel.js:98-118`
- `budgetModel.js` — CRUD budget + cek duplikat via `findByUserCategoryMonthYear`.

## `src/middlewares/` — Penyaring sebelum controller

- `authMiddleware.js` — Membaca header `Authorization: Bearer <token>`, verifikasi JWT dengan `jwt.verify`. Jika valid → `req.user = decoded` dan lanjut (`next()`). Jika tidak ada/tidak valid → **401**. Ini sistem "pagar" yang melindungi semua route kecuali auth. — `authMiddleware.js:4-20`
- `validate.js` — Middleware generator: menerima satu skema **Joi**, memvalidasi `req.body` (`abortEarly: false` agar semua error terlaporkan, `stripUnknown: true` untuk buang field tak dikenal). Jika gagal → 400 dengan pesan gabungan.
- `errorHandler.js` — Menangkap semua error. Jika berupa `ApiError` → tampilkan pesannya. Jika error tak dikenal → log detail (untuk debugging) → balas 500. — `errorHandler.js:7-26`

## `src/validations/` — Skema Joi

Definisi aturan field setiap endpoint. Contoh: email harus format email, password min 6 karakter, `type` hanya boleh `'income'`/`'expense'`, `amount` harus angka positif, `month` antara 1–12.

## `src/utils/`

- `ApiError.js` — Class error kustom berisi `statusCode` + `message` + flag `isOperational`. Dipakai service untuk `throw new ApiError(400, '...')`.
- `asyncHandler.js` — Pembungkus fungsi async agar error dilempar ke `next()`, sehingga tidak perlu try/catch di tiap controller.

## Database — 4 tabel (dari `db/schema.sql`)

| Tabel | Isi | Relasi |
|---|---|---|
| `tb_users` | User (username, email, password hash, created_at) | menjadi acuan semua tabel |
| `tb_categories` | Kategori (name, type income/expense, icon). `user_id NULL` = **kategori default untuk semua user**; bukan NULL = kategori custom milik user | FK → users (ON DELETE CASCADE) |
| `tb_transactions` | Transaksi (type, amount, description, transaction_date) | FK → users, FK → categories (ON DELETE SET NULL) |
| `tb_budgets` | Anggaran per kategori per bulan/tahun (amount, month, year) dengan `UNIQUE(user_id, category_id, month, year)` | FK → users, FK → categories |

Ada 4 index untuk mempercepat query (berdasarkan user_id + tanggal, kategori, dsb).

---

# BAGIAN 2 — FRONTEND

## File di root frontend

| File/Folder | Kegunaan |
|---|---|
| `index.html` | Halaman HTML entry. Memuat font Inter dan memanggil `/src/main.js`. Title: "Catatan - Keuangan Pribadi". |
| `vite.config.js` | Konfigurasi Vite. Mengatur port dev `3000` dan **proxy** `/api → http://localhost:5000` (menghubungkan ke backend). — `vite.config.js:7-15` |
| `package.json` | Dependency: vue, vue-router, pinia, axios, lucide-vue-next (ikon). Script: `dev`, `build`, `preview`. |
| `public/` | Aset statis (favicon.svg, icons.svg) yang disalin apa adanya saat build. |
| `dist/` | Hasil build produksi (`npm run build`). |
| `src/style.css` | Global CSS dasar (reset, dll). |
| `src/assets/styles.css` | Gaya global tambahan (dipanggil di main.js). |

## `src/main.js`

Titik awal aplikasi: membuat instance Vue `createApp(App)`, mendaftarkan **Pinia** (`createPinia`) dan **Router**, lalu `mount('#app')`.

## `src/App.vue`

Komponen akar paling sederhana — hanya berisi `<RouterView />` (tempat halaman aktif dirender) dengan background `#f9fafb`.

## `src/router/index.js` — Navigasi & proteksi halaman

Mendefinisikan 6 route:
- `/login` & `/register` → meta `requiresGuest` (hanya untuk yang belum login).
- `/` (Dashboard), `/transactions`, `/categories`, `/budgets` → meta `requiresAuth` (wajib login).
- **Navigation Guard** di `router.beforeEach` (`router/index.js:56-66`): kalau halaman butuh login dan user belum login → lempar ke `/login`; sebaliknya kalau sudah login tapi buka halaman login → lempar ke `/`.

## `src/services/api.js` — Koneksi ke backend

Membuat instance **Axios** dengan dua interceptor:
- **Request interceptor**: otomatis menambahkan header `Authorization: Bearer <token>` dari `localStorage` ke setiap request. — `api.js:11-20`
- **Response interceptor**: jika server membalas **401** (token rusak/kedaluwarsa) → hapus token dari localStorage → alihkan ke `/login`. — `api.js:23-33`

## `src/stores/` — State global (Pinia)

- `auth.js` — Menyimpan `user` & `token` (dibaca dari localStorage). Getter: `isLoggedIn`, `currentUser`. Aksi: `register`, `login` (post ke API lalu simpan token+user ke state dan localStorage), `logout` (bersihkan semua).
- `categories.js` — Menyimpan daftar kategori. Getter: `incomeCategories`, `expenseCategories`, `getCategoryById`. Aksi: fetch, add, delete.
- `transactions.js` — Menyimpan `transactions`, `summary`, `expenseByCategory`, `incomeByCategory`. Aksi: fetch/add/update/delete transaksi + fetch summary & data per kategori.
- `budgets.js` — Menyimpan `budgets`. Getter: `totalBudget`. Aksi: fetch/add/update/delete.

## `src/components/` — Komponen yang dipakai ulang

| Komponen | Kegunaan |
|---|---|
| `MainLayout.vue` | Kerangka halaman dalam: menata **Sidebar** (kiri) + **Navbar** (atas) + konten utama (slot). — `MainLayout.vue:5-8` |
| `Sidebar.vue` | Menu navigasi kiri: logo, link Dashboard/Transaksi/Kategori/Budget, tombol "Keluar" (logout). Link aktif di-highlight hijau. |
| `Navbar.vue` | Header atas: judul halaman (otomatis mengikuti route) + nama username user yang login. |
| `Model.vue` | Modal popup reusable (Teleport ke `body`), bisa dibuka/ditutup via `v-model`, berisi slot untuk form. Dipakai untuk form tambah/edit transaksi, kategori, budget. |
| `AlertMessage.vue` | Pesan notifikasi sukses (hijau) atau error (merah) dengan tombol tutup. |
| `LoadingSpinner.vue` | Indikator loading berputar dengan teks opsional. |

---

# BAGIAN 3 — ALUR WORKFLOW USER

Skenario lengkap saat user memakai aplikasi:

```
[1] Buka aplikasi (localhost:3000)
        │
        ▼
[2] Vite menampilkan halaman /login  (guard: kalau sudah login → langsung Dashboard)
        │  user isi email + password
        ▼
[3] authStore.login() → POST /api/auth/login
        │  userService cek password (bcrypt), kalau cocok balas {token, user}
        ▼
[4] Token JWT + user disimpan di Pinia store & localStorage
        │
        ▼
[5] Router navigasi ke / (Dashboard). Setiap request berikutnya:
        │  Axios interceptor otomatis menyertakan "Bearer <token>"
        ▼
[6] Backend: authMiddleware verifikasi token → req.user terisi
        │  → controller → service → model (query DB)
        ▼
[7] Hasil dikembalikan JSON → store Pinia diperbarui → tampilan Vue re-render
```

**Detail alur per fitur:**

- **Registrasi** → `/register` → isValidasi → hash password → simpan ke `tb_users` → redirect ke `/login` setelah 2 detik.
- **Melihat Dashboard** → saat halaman dimuat, memanggil 3 API paralel (`Promise.all`): `/summary`, `/summary/category`, `/summary/category/income` untuk bulan/tahun yang dipilih → menampilkan kartu Total Income, Total Expense, Saldo + rincian per kategori.
- **Tambah/Edit Transaksi** → buka modal → pilih tipe (income/expense) → pilih kategori (dipisah sesuai tipe) → jumlah, deskripsi, tanggal → `POST`/`PUT /api/transactions` → list diperbarui.
- **Kelola Kategori** → halaman Kategori menampilkan kartu per kategori (default + custom). Kategori **default tidak punya tombol hapus**, hanya kategori custom yang bisa dihapus (`v-if="cat.user_id"` di `Categories.vue:50`).
- **Kelola Budget** → atur batas pengeluaran per kategori per bulan/tahun → disimpan di `tb_budgets` (tidak boleh duplikat untuk kategori+bulan+tahun yang sama).
- **Logout** → hapus token & user dari store + localStorage → kembali ke `/login`.
- **Token expired** → server balas 401 → interceptor otomatis logout paksa → kembali ke `/login`.

**Model keamanan data:** setiap user hanya melihat datanya sendiri karena hampir semua query menyaring `WHERE user_id = req.user.id`.

---

# BAGIAN 4 — PENJELASAN SETIAP HALAMAN

## 1. Halaman Login (`/login`)

Tampilan kartu di tengah layar dengan latar gradasi hijau. Berisi: logo dompet, judul "Selamat Datang", form **Email** + **Password** (dengan ikon, tombol lihat/sembunyikan password), tombol "Masuk" (berubah jadi spinner "Masuk..." saat loading). Ada link "Daftar sekarang" ke `/register`. Error tampil di alert merah. **Tujuan:** autentikasi pengguna sebelum masuk aplikasi.

## 2. Halaman Register (`/register`)

Kartu serupa dengan form **Username, Email, Password** (username min 3 dan password min 6 karakter). Saat berhasil, muncul alert sukses "Registrasi berhasil" lalu otomatis pindah ke `/login` dalam 2 detik. **Tujuan:** membuat akun baru.

## 3. Halaman Dashboard (`/` — halaman utama)

Di dalam MainLayout (sidebar + navbar). Berisi:
- **Dropdown filter bulan** (`Januari`–`Desember`) dan **tahun** (5 tahun terakhir) — mengubah data secara instan.
- **3 kartu ringkasan:** Total Income (hijau), Total Expense (merah), Saldo (hijau, ikon dompet).
- **Panel "Ringkasan per Kategori"** dengan tab **Pengeluaran / Pemasukan**: daftar kategori dengan titik warna, jumlah transaksi, dan total nominal per kategori bulan itu. Jika kosong, tampil ikon pie chart + pesan "Belum ada data".

**Tujuan:** memberi gambaran cepat kondisi keuangan bulanan.

## 4. Halaman Transaksi (`/transactions`)

- **Filter bar:** bulan, tahun, tipe (Semua/Pemasukan/Pengeluaran) + tombol "Filter" yang memicu reload.
- **Tombol "Tambah Transaksi"** (hijau) → membuka modal.
- **Daftar transaksi** (kartu baris): ikon **hijau naik** untuk income / **merah turun** untuk expense, deskripsi ("Tanpa deskripsi" jika kosong), kategori + tanggal, nominal (`+ Rp` / `- Rp`). Tombol **edit (pensil)** dan **hapus (tong sampah)** muncul saat hover.
- **Modal Tambah/Edit:** toggle tipe Pengeluaran/Pemasukan, jumlah (Rp), dropdown kategori (menyesuaikan tipe), deskripsi opsional, tanggal (date picker). Tombol Simpan/Update/Batal.
- Konfirmasi hapus pakai `confirm()`; sukses/gagal ditampilkan lewat alert.

**Tujuan:** mencatat dan mengelola seluruh pemasukan & pengeluaran.

## 5. Halaman Kategori (`/categories`)

- **Tab "Pengeluaran"/"Pemasukan"** + tombol "Tambah Kategori".
- **Grid kartu kategori**: ikon kategori (dari pilihan lucide seperti briefcase, laptop, utensils, car, dsb.), nama kategori, badge tipe (merah=Pengeluaran, hijau=Pemasukan). **Kategori default tidak bisa dihapus** (tombol hapus hanya muncul untuk kartu milik user).
- **Modal Tambah:** nama, tipe (toggle), dan **pilihan 16 ikon** dalam grid yang bisa diklik untuk dipilih.

**Tujuan:** mengatur label pengelompokan transaksi (bisa dibuat custom sesuai kebutuhan user).

## 6. Halaman Budget (`/budgets`)

- **Filter** bulan & tahun + tombol "Filter"; **tombol "Tambah Budget"**.
- **Grid kartu budget**: ikon celengan, nama kategori, badge tipe, periode (bulan tahun), dan nominal budget (hijau). Ada tombol **Edit** dan **Hapus**.
- **Modal Tambah/Edit:** toggle tipe, dropdown kategori (sesuai tipe), input batas budget, dropdown bulan & tahun.

**Tujuan:** merencanakan anggaran — menetapkan batas pengeluaran per kategori untuk periode tertentu.