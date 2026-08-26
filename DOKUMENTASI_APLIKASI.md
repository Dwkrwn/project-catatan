# Dokumentasi Lengkap Aplikasi CatatanKeu

> Dokumen ini menjelaskan secara rinci kegunaan, arsitektur, dan cara kerja
> seluruh aplikasi web **CatatanKeu** — aplikasi pencatatan keuangan pribadi
> berbasis web dengan arsitektur client-server.

---

## Daftar Isi

1. [Gambaran Umum Aplikasi](#1-gambaran-umum-aplikasi)
2. [Arsitektur & Tech Stack](#2-arsitektur--tech-stack)
3. [Struktur Folder](#3-struktur-folder)
4. [Alur Kerja Aplikasi (Flow)](#4-alur-kerja-aplikasi-flow)
5. [Fitur-fitur Aplikasi](#5-fitur-fitur-aplikasi)
6. [Penjelasan Modul Backend](#6-penjelasan-modul-backend)
7. [Penjelasan Modul Frontend](#7-penjelasan-modul-frontend)
8. [Sistem Autentikasi & Keamanan](#8-sistem-autentikasi--keamanan)
9. [Database & Struktur Tabel](#9-database--struktur-tabel)
10. [Alur Data dari User Interface ke Database](#10-alur-data-dari-user-interface-ke-database)
11. [Cara Menjalankan Aplikasi](#11-cara-menjalankan-aplikasi)
12. [Endpoint API Reference](#12-endpoint-api-reference)

---

## 1. Gambaran Umum Aplikasi

**CatatanKeu** adalah aplikasi web pencatatan keuangan pribadi yang memungkinkan pengguna untuk:

- **Mencatat transaksi** (pemasukan & pengeluaran) secara harian
- **Mengelola kategori** transaksi (bawaan sistem + kustom oleh user)
- **Mengatur anggaran (budget)** per kategori per bulan
- **Melihat ringkasan keuangan** (total pemasukan, pengeluaran, saldo, dan distribusi pengeluaran per kategori)

Aplikasi ini bersifat **multi-user** — setiap pengguna memiliki akun sendiri dan hanya bisa melihat data keuangannya sendiri.

---

## 2. Arsitektur & Tech Stack

### Arsitektur

Aplikasi ini menggunakan arsitektur **client-server** dengan pendekatan **REST API**:

```
[ Browser / Frontend ]
        |
        | HTTP Request (JSON)
        v
[ Backend / API Server ]  ---->  [ Database PostgreSQL ]
        ^
        |
[ Frontend Dev Server (Vite Proxy) ]
```

### Tech Stack

| Layer | Teknologi | Kegunaan |
|-------|-----------|----------|
| **Frontend** | Vue.js 3 | Framework UI (Composition API + `<script setup>`) |
| **State Management** | Pinia | Mengelola state global (auth, transaksi, kategori, budget) |
| **Routing** | Vue Router 4 | Navigasi antar halaman (SPA) |
| **HTTP Client** | Axios | Melakukan request ke REST API backend |
| **Icons** | Lucide Vue Next | Library ikon yang ringan dan modern |
| **Build Tool** | Vite 8 | Dev server & bundler untuk frontend |
| **Backend** | Node.js + Express 5 | Framework web server & REST API |
| **Database** | PostgreSQL (via `pg`) | Database relasional untuk menyimpan data |
| **Autentikasi** | JWT (jsonwebtoken) | Token-based authentication |
| **Password Hashing** | Bcrypt | Enkripsi password sebelum disimpan |

---

## 3. Struktur Folder

```
pencatatan/
├── backend/
│   ├── config/
│   │   └── db.js                  # Konfigurasi koneksi PostgreSQL
│   ├── middleware/
│   │   └── auth.js                # Middleware verifikasi JWT token
│   ├── controllers/
│   │   ├── authController.js      # Logic registrasi & login
│   │   ├── transactionController.js # Logic CRUD transaksi + summary
│   │   ├── categoryController.js  # Logic CRUD kategori
│   │   └── budgetController.js    # Logic CRUD budget
│   ├── routes/
│   │   ├── authRoutes.js          # Route /api/auth/*
│   │   ├── transactionRoutes.js   # Route /api/transactions/*
│   │   ├── categoryRoutes.js      # Route /api/categories/*
│   │   └── budgetRoutes.js        # Route /api/budgets/*
│   ├── .env                       # Environment variables (PORT, DB, JWT_SECRET)
│   ├── server.js                  # Entry point Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   └── styles.css         # CSS global
│   │   ├── components/
│   │   │   ├── Sidebar.vue        # Sidebar navigasi kiri
│   │   │   ├── Navbar.vue         # Navbar atas (judul halaman + info user)
│   │   │   ├── MainLayout.vue     # Layout wrapper (Sidebar + Navbar + content)
│   │   │   ├── Model.vue          # Modal dialog reusable
│   │   │   ├── AlertMessage.vue   # Notifikasi sukses/error
│   │   │   └── LoadingSpinner.vue # Indikator loading
│   │   ├── views/
│   │   │   ├── Login.vue          # Halaman login
│   │   │   ├── Register.vue       # Halaman registrasi
│   │   │   ├── Dashboard.vue      # Dashboard ringkasan keuangan
│   │   │   ├── Transactions.vue   # Halaman manajemen transaksi
│   │   │   ├── Categories.vue     # Halaman manajemen kategori
│   │   │   └── Budgets.vue        # Halaman manajemen budget
│   │   ├── stores/
│   │   │   ├── auth.js            # State autentikasi (login, register, logout)
│   │   │   ├── transactions.js    # State transaksi + summary
│   │   │   ├── categories.js      # State kategori
│   │   │   └── budgets.js         # State budget
│   │   ├── services/
│   │   │   └── api.js             # Axios instance + interceptor (token otomatis)
│   │   ├── router/
│   │   │   └── index.js           # Konfigurasi路由 + navigation guard
│   │   ├── App.vue                # Root component
│   │   └── main.js                # Entry point (mount Vue app)
│   ├── index.html
│   ├── vite.config.js             # Konfigurasi Vite (port, proxy ke backend)
│   └── package.json
│
├── Tujuan.md
├── Tahap2_StepByStep.md
├── Tahap3_StepByStep.md
├── RIWAYAT_Perbaikan.md
├── DIAGNOSA_LayarPutih.md
└── DOKUMENTASI_APLIKASI.md        # (dokumen ini)
```

---

## 4. Alur Kerja Aplikasi (Flow)

### 4.1 Alur Autentikasi

```
User buka browser --> /login atau /register
        |
        v
[Navigation Guard] -- Cek token di localStorage
        |
        |-- Belum login + akses halaman auth --> Izinkan (tampilkan form)
        |-- Belum login + akses halaman utama --> Redirect ke /login
        |-- Sudah login + akses halaman auth --> Redirect ke /
        |-- Sudah login + akses halaman utama --> Izinkan
        |
        v
[Login] --> POST /api/auth/login --> Backend verifikasi email + password
        |
        |-- Gagal --> Tampilkan error message
        |-- Berhasil --> Simpan token + user data ke localStorage
        |              --> Redirect ke Dashboard (/)
        v
[Setiap Request API] --> Axios interceptor otomatis tambahkan
        Bearer token di header Authorization
        |
        v
[Backend] --> Middleware auth.js verifikasi token
        |
        |-- Token invalid/expired --> 401 Unauthorized --> Auto logout
        |-- Token valid --> Lanjut ke controller
```

### 4.2 Alur Transaksi

```
User klik "Tambah Transaksi"
        |
        v
[Form Modal] --> Pilih tipe (income/expense), jumlah, kategori, deskripsi, tanggal
        |
        v
[Axios POST /api/transactions] --> Backend simpan ke tabel transactions
        |
        v
[Store update state] --> Transaksi baru muncul di daftar
        |
        v
[Dashboard] --> Ambil data summary & expense per kategori
              --> Tampilkan card total income, expense, saldo
              --> Tampilkan daftar pengeluaran per kategori
```

### 4.3 Alur Budget

```
User klik "Tambah Budget"
        |
        v
[Form Modal] --> Pilih kategori pengeluaran, jumlah budget, bulan, tahun
        |
        v
[Axios POST /api/budgets] --> Backend cek duplikasi (unique per kategori/bulan)
        |
        |-- Sudah ada --> 409 Conflict
        |-- Belum ada --> Simpan ke tabel tb_budgets
        |
        v
[Budget list] --> Tampilkan semua budget yang sudah diatur
```

---

## 5. Fitur-fitur Aplikasi

### 5.1 Autentikasi (Login & Register)

| Aspek | Detail |
|-------|--------|
| **Register** | User baru daftar dengan username, email, password |
| **Login** | User masuk dengan email + password |
| **Keamanan Password** | Password di-hash dengan bcrypt (salt 10 rounds) sebelum disimpan |
| **Token** | JWT token dihasilkan saat login, berlaku 24 jam |
| **Penyimpanan Token** | Disimpan di `localStorage` browser |
| **Auto Logout** | Jika token expired (401 response), user otomatis di-logout |
| **Navigation Guard** | Halaman tertentu hanya bisa diakses setelah login |

### 5.2 Dashboard

| Komponen | Penjelasan |
|----------|------------|
| **Card Total Income** | Menampilkan total pemasukan bulan ini (Rp) |
| **Card Total Expense** | Menampilkan total pengeluaran bulan ini (Rp) |
| **Card Saldo** | Menampilkan selisih total income - expense (akumulasi seluruh waktu) |
| **Pengeluaran per Kategori** | Daftar kategori pengeluaran bulan ini beserta jumlah dan jumlah transaksi |

### 5.3 Manajemen Transaksi

| Fitur | Detail |
|-------|--------|
| **Tambah Transaksi** | Input: tipe (income/expense), jumlah, kategori, deskripsi, tanggal |
| **Edit Transaksi** | Mengubah data transaksi yang sudah ada |
| **Hapus Transaksi** | Menghapus transaksi (dengan konfirmasi) |
| **Filter** | Filter berdasarkan bulan dan tahun |
| **Daftar Transaksi** | Menampilkan semua transaksi dengan info kategori & tanggal |

### 5.4 Manajemen Kategori

| Fitur | Detail |
|-------|--------|
| **Kategori Bawaan** | Sistem menyediakan kategori default (Gaji, Freelance, Makanan, Transport, dll) |
| **Kategori Kustom** | User bisa menambah kategori sendiri dengan nama & ikon custom |
| **Tab Pengeluaran/Pemasukan** | Filter kategori berdasarkan tipe |
| **Pilihan Ikon** | 16 pilihan ikon (briefcase, laptop, utensils, car, dll) |
| **Hapus Kategori** | Hanya kategori kustom yang bisa dihapus (kategori bawaan tidak bisa) |

### 5.5 Manajemen Budget (Anggaran)

| Fitur | Detail |
|-------|--------|
| **Tambah Budget** | Tentukan batas pengeluaran per kategori per bulan |
| **Edit Budget** | Mengubah besaran budget |
| **Hapus Budget** | Menghapus budget yang sudah diatur |
| **Filter** | Filter budget berdasarkan bulan dan tahun |
| **Validasi Duplikasi** | Satu kategori hanya boleh punya 1 budget per bulan |

---

## 6. Penjelasan Modul Backend

### 6.1 Entry Point — `server.js`

File utama yang menjalankan Express server. Melakukan:
- Setup middleware (`cors`, `express.json`)
- Mounting route ke path tertentu:
  - `/api/auth` → autentikasi (register, login)
  - `/api/transactions` → CRUD transaksi + summary
  - `/api/categories` → CRUD kategori
  - `/api/budgets` → CRUD budget
- Menjalankan server di port 5000

### 6.2 Database Config — `config/db.js`

Membuat koneksi pool ke PostgreSQL menggunakan library `pg`. Konfigurasi diambil dari file `.env`:

| Variabel | Kegunaan |
|----------|----------|
| `DB_HOST` | Host database (localhost) |
| `DB_PORT` | Port database (5432) |
| `DB_NAME` | Nama database (db_pencatatan) |
| `DB_USER` | Username database (postgres) |
| `DB_PASSWORD` | Password database |

### 6.3 Middleware Auth — `middleware/auth.js`

Middleware yang melindungi route yang butuh autentikasi. Cara kerja:

1. Ambil header `Authorization` dari request
2. Pastikan format `Bearer <token>`
3. Verifikasi token menggunakan `jwt.verify()` dengan secret key
4. Simpan data user (decoded) ke `req.user`
5. Lanjutkan ke controller berikutnya (`next()`)
6. Jika token tidak valid → return 401

### 6.4 Controllers

#### `authController.js` — Autentikasi

| Fungsi | Endpoint | Penjelasan |
|--------|----------|------------|
| `register` | POST /api/auth/register | Membuat akun baru: validasi input, cek duplikasi email/username, hash password, insert ke database |
| `login` | POST /api/auth/login | Verifikasi login: cari user by email, bandingkan password dengan bcrypt, buat JWT token |

#### `transactionController.js` — Transaksi & Analitik

| Fungsi | Endpoint | Penjelasan |
|--------|----------|------------|
| `getTransactions` | GET /api/transactions | Ambil semua transaksi user, bisa filter by bulan/tahun, JOIN dengan tabel kategori untuk dapat nama & ikon |
| `addTransaction` | POST /api/transactions | Tambah transaksi baru: validasi tipe (income/expense) & jumlah |
| `updateTransaction` | PUT /api/transactions/:id | Update transaksi: cek kepemilikan, lalu update field |
| `deleteTransaction` | DELETE /api/transactions/:id | Hapus transaksi: cek kepemilikan, lalu delete |
| `getSummary` | GET /api/transactions/summary | Hitung total income bulanan, total expense bulanan, dan saldo total (akumulasi seluruh waktu) |
| `getExpenseByCategory` | GET /api/transactions/summary/category | Hitung total pengeluaran per kategori untuk bulan tertentu (untuk pie chart/distribusi) |

#### `categoryController.js` — Kategori

| Fungsi | Endpoint | Penjelasan |
|--------|----------|------------|
| `getCategories` | GET /api/categories | Ambil semua kategori: kategori default (user_id NULL) + kategori kustom user |
| `addCategory` | POST /api/categories | Tambah kategori baru dengan nama, tipe, dan ikon |
| `deleteCategory` | DELETE /api/categories/:id | Hapus kategori kustom (hanya milik user sendiri) |

#### `budgetController.js` — Budget/Anggaran

| Fungsi | Endpoint | Penjelasan |
|--------|----------|------------|
| `getBudgets` | GET /api/budgets | Ambil semua budget user, bisa filter by bulan/tahun, JOIN dengan tabel kategori |
| `addBudget` | POST /api/budgets | Tambah budget baru: validasi tidak ada duplikasi (satu kategori per bulan) |
| `updateBudget` | PUT /api/budgets/:id | Update budget: cek kepemilikan, lalu update |
| `deleteBudget` | DELETE /api/budgets/:id | Hapus budget: cek kepemilikan, lalu delete |

### 6.5 Routes

Setiap route file mendefinisikan endpoint dan menghubungkannya ke controller yang sesuai. Route yang butuh autentikasi menggunakan middleware `auth`:

- **authRoutes**: TANPA middleware auth (register & login adalah public)
- **transactionRoutes**: DENGAN middleware auth (semua transaksi butuh login)
- **categoryRoutes**: DENGAN middleware auth
- **budgetRoutes**: DENGAN middleware auth

---

## 7. Penjelasan Modul Frontend

### 7.1 Entry Point — `main.js`

- Membuat Vue app instance
- Install plugin Pinia (state management)
- Install plugin Vue Router
- Mount app ke element `#app` di HTML

### 7.2 Root Component — `App.vue`

Root component minimalis — hanya merender `<RouterView />` yang akan menampilkan halaman sesuai URL.

### 7.3 Router — `router/index.js`

Mendefinisikan 6 rute halaman:

| Path | Komponen | Meta | Keterangan |
|------|----------|------|------------|
| `/login` | Login.vue | `requiresGuest` | Hanya bisa diakses jika BELUM login |
| `/register` | Register.vue | `requiresGuest` | Hanya bisa diakses jika BELUM login |
| `/` | Dashboard.vue | `requiresAuth` | Halaman utama, butuh login |
| `/transactions` | Transactions.vue | `requiresAuth` | Manajemen transaksi, butuh login |
| `/categories` | Categories.vue | `requiresAuth` | Manajemen kategori, butuh login |
| `/budgets` | Budgets.vue | `requiresAuth` | Manajemen budget, butuh login |

**Navigation Guard** (`beforeEach`): Setiap navigasi dicek — jika halaman butuh auth tapi belum login, redirect ke `/login`. Jika halaman guest tapi sudah login, redirect ke `/`.

### 7.4 API Service — `services/api.js`

Instance Axios yang dikonfigurasi dengan:

- **Request Interceptor**: Setiap request otomatis menyertakan header `Authorization: Bearer <token>` dari `localStorage`
- **Response Interceptor**: Jika response 401 (token expired), otomatis hapus token & redirect ke `/login`
- **Base URL kosong**: Karena Vite proxy sudah meneruskan `/api/*` ke `http://localhost:5000`

### 7.5 Pinia Stores

#### `stores/auth.js`
- **State**: `user`, `token`, `loading`, `error`
- **Getters**: `isLoggedIn` (cek token ada/tidak), `currentUser`
- **Actions**: `register()`, `login()`, `logout()`
- Token & user disimpan di `localStorage` agar persisten saat reload halaman

#### `stores/transactions.js`
- **State**: `transactions[]`, `summary`, `expenseByCategory[]`, `loading`, `error`
- **Actions**: `fetchTransactions()`, `addTransaction()`, `updateTransaction()`, `deleteTransaction()`, `fetchSummary()`, `fetchExpenseByCategory()`

#### `stores/categories.js`
- **State**: `categories[]`, `loading`, `error`
- **Getters**: `incomeCategories` (filter tipe income), `expenseCategories` (filter tipe expense), `getCategoryById()`
- **Actions**: `fetchCategories()`, `addCategory()`, `deleteCategory()`

#### `stores/budgets.js`
- **State**: `budgets[]`, `loading`, `error`
- **Getters**: `totalBudget` (total semua budget)
- **Actions**: `fetchBudgets()`, `addBudget()`, `updateBudget()`, `deleteBudget()`

### 7.6 Components (Reusable)

| Komponen | Kegunaan |
|----------|----------|
| `MainLayout.vue` | Layout wrapper: Sidebar di kiri + Navbar di atas + konten di tengah. Digunakan oleh semua halaman utama (Dashboard, Transaksi, Kategori, Budget) |
| `Sidebar.vue` | Navigasi kiri: logo "CatatanKeu", link ke Dashboard/Transaksi/Kategori/Budget, tombol logout |
| `Navbar.vue` | Header atas: judul halaman (dinamis sesuai route), nama user yang sedang login |
| `Model.vue` (Modal) | Dialog popup reusable: overlay gelap + konten card putih + header + slot body. Menggunakan `v-model` untuk show/hide |
| `AlertMessage.vue` | Notifikasi sukses (hijau) atau error (merah) dengan ikon dan tombol close |
| `LoadingSpinner.vue` | Animasi loading berputar dengan teks opsional |

### 7.7 Views (Halaman)

#### `Login.vue`
- Form email + password
- Toggle show/hide password
- Loading state saat submit
- Link ke halaman register

#### `Register.vue`
- Form username + email + password
- Validasi minlength password: 6 karakter
- Pesan sukses setelah register, otomatis redirect ke login setelah 2 detik

#### `Dashboard.vue`
- 3 card ringkasan: Total Income, Total Expense, Saldo
- Daftar pengeluaran per kategori (nama kategori, jumlah transaksi, total rupiah)
- Filter otomatis berdasarkan bulan & tahun saat ini

#### `Transactions.vue`
- Filter bulan & tahun
- Daftar transaksi (daftar, bukan tabel) dengan ikon tipe, deskripsi, kategori, tanggal, jumlah
- Tombol edit & hapus (muncul saat hover)
- Modal form untuk tambah/edit transaksi (tipe, jumlah, kategori, deskripsi, tanggal)

#### `Categories.vue`
- Tab switcher: Pengeluaran / Pemasukan
- Grid card kategori dengan ikon, nama, badge tipe
- Tombol hapus hanya muncul untuk kategori kustom (user_id != null)
- Modal form untuk tambah kategori (nama, tipe, pilihan ikon)

#### `Budgets.vue`
- Filter bulan & tahun
- Grid card budget: nama kategori, periode (bulan/tahun), jumlah budget
- Tombol edit & hapus
- Modal form untuk tambah/edit budget (kategori pengeluaran, jumlah, bulan, tahun)

---

## 8. Sistem Autentikasi & Keamanan

### Alur Autentikasi Lengkap

```
1. REGISTER
   User isi form --> POST /api/auth/register
   Backend: validasi --> cek duplikasi --> hash password (bcrypt) --> insert user --> return 201

2. LOGIN
   User isi form --> POST /api/auth/login
   Backend: cari user by email --> bcrypt.compare(password) --> buat JWT token (24h) --> return token + user data

3. STORE TOKEN (Frontend)
   Simpan token & user data di localStorage

4. AKSES HALAMAN PROTECTED
   Navigation Guard cek token di localStorage --> izinkan atau redirect ke /login

5. SETIAP REQUEST API
   Axios interceptor: tambahkan "Authorization: Bearer <token>" ke header
   Backend middleware: verifikasi token --> decode user data --> attach ke req.user

6. TOKEN EXPIRED
   Backend return 401 --> Axios interceptor: hapus token --> redirect ke /login
```

### Mekanisme Keamanan

| Mekanisme | Implementasi |
|-----------|-------------|
| **Password Hashing** | Bcrypt dengan salt rounds 10 — password tidak pernah disimpan dalam plain text |
| **JWT Token** | Token ditandatangani dengan secret key, berlaku 24 jam |
| **Middleware Auth** | Route transaksi/kategori/budget dilindungi middleware yang wajibkan token valid |
| **Data Isolation** | Setiap query di-filter dengan `user_id` — user hanya bisa akses data sendiri |
| **SQL Injection Prevention** | Semua query menggunakan parameterized query (`$1`, `$2`, dst) |
| **CORS** | Backend mengizinkan cross-origin request dari frontend |
| **Vite Proxy** | Frontend proxy `/api/*` ke backend untuk menghindari CORS saat development |

---

## 9. Database & Struktur Tabel

### Database: PostgreSQL (db_pencatatan)

#### Tabel `tb_users`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | SERIAL PRIMARY KEY | ID user (auto increment) |
| `username` | VARCHAR(50) UNIQUE | Nama pengguna |
| `email` | VARCHAR(100) UNIQUE | Email pengguna |
| `password` | VARCHAR(255) | Password ter-hash (bcrypt) |
| `created_at` | TIMESTAMP | Waktu pendaftaran |

#### Tabel `tb_categories`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | SERIAL PRIMARY KEY | ID kategori |
| `name` | VARCHAR(50) | Nama kategori |
| `type` | VARCHAR(20) | Tipe: `income` atau `expense` |
| `icon` | VARCHAR(50) | Nama ikon (lucide icon name) |
| `user_id` | INTEGER (FK → users) | NULL = kategori default, ada = kategori kustom user |

**Kategori Default:**

| Nama | Tipe | Ikon |
|------|------|------|
| Gaji | income | briefcase |
| Freelance | income | laptop |
| Makanan | expense | utensils |
| Transport | expense | car |
| Belanja | expense | shopping-bag |
| Tagihan | expense | file-text |

#### Tabel `tb_transactions`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | SERIAL PRIMARY KEY | ID transaksi |
| `user_id` | INTEGER (FK → users) | ID pemilik transaksi |
| `category_id` | INTEGER (FK → categories) | ID kategori terkait |
| `type` | VARCHAR(20) | Tipe: `income` atau `expense` |
| `amount` | DECIMAL(12,2) | Jumlah nominal |
| `description` | TEXT | Deskripsi transaksi (opsional) |
| `date` | DATE | Tanggal transaksi |
| `created_at` | TIMESTAMP | Waktu record dibuat |

#### Tabel `tb_budgets`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | SERIAL PRIMARY KEY | ID budget |
| `user_id` | INTEGER (FK → users) | ID pemilik budget |
| `category_id` | INTEGER (FK → categories) | ID kategori terkait |
| `amount` | NUMERIC(15,2) | Batas budget |
| `month` | INT (1-12) | Bulan budget |
| `year` | INT | Tahun budget |
| **UNIQUE** | (user_id, category_id, month, year) | Satu kategori hanya boleh punya 1 budget per bulan |

### Relasi Antar Tabel

```
tb_users (1) ──── (many) tb_transactions
tb_users (1) ──── (many) tb_budgets
tb_users (1) ──── (many) tb_categories (custom)
tb_categories (1) ──── (many) tb_transactions
tb_categories (1) ──── (many) tb_budgets
```

---

## 10. Alur Data dari User Interface ke Database

### Contoh: Menambah Transaksi

```
1. [User] Klik "Tambah Transaksi" di halaman Transactions.vue
2. [Frontend] Modal form muncul (Model.vue)
3. [User] Isi form: tipe=expense, amount=50000, category_id=3, description="Makan siang", date=2026-08-25
4. [Frontend] onClick submit → transactionStore.addTransaction(formData)
5. [Store] Panggil api.post('/api/transactions', formData)
6. [Axios] Tambahkan header Authorization: Bearer <token> → kirim POST ke backend
7. [Vite Proxy] Teruskan request dari :3000 ke :5000
8. [Backend] Middleware auth.js verifikasi token → tambahkan req.user
9. [Backend] transactionController.addTransaction():
   - Ambil userId dari req.user.id
   - Validasi: type harus income/expense, amount wajib
   - Jalankan query INSERT INTO tb_transactions...
   - Return 201 + data transaksi baru
10. [Frontend] Store push transaksi baru ke array transactions[]
11. [Frontend] UI update: transaksi baru muncul di daftar
12. [Frontend] AlertMessage tampilkan "Transaksi berhasil ditambahkan"
```

---

## 11. Cara Menjalankan Aplikasi

### Prasyarat

- Node.js (v18+)
- PostgreSQL (v14+)
- npm atau yarn

### Langkah 1: Setup Database

```sql
-- Buka psql atau pgAdmin
CREATE DATABASE db_pencatatan;

-- Jalankan query CREATE TABLE dari Tahap2_StepByStep.md
-- atau buat tabel sesuai struktur di bagian 9
```

### Langkah 2: Jalankan Backend

```bash
cd backend
npm install          # Install dependencies
npm run dev          # Jalankan server dengan nodemon (port 5000)
```

### Langkah 3: Jalankan Frontend

```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Jalankan Vite dev server (port 3000)
```

### Langkah 4: Buka Browser

```
http://localhost:3000
```

Frontend akan otomatis proxy request `/api/*` ke backend di `http://localhost:5000`.

---

## 12. Endpoint API Reference

### Autentikasi (Public — Tanpa Token)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/register` | `{ username, email, password }` | 201: `{ message, user }` |
| POST | `/api/auth/login` | `{ email, password }` | 200: `{ message, token, user }` |

### Transaksi (Butuh Token)

| Method | Endpoint | Body/Query | Response |
|--------|----------|------------|----------|
| GET | `/api/transactions` | Query: `?month=&year=` | 200: `{ count, transactions[] }` |
| POST | `/api/transactions` | `{ category_id, type, amount, description, date }` | 201: `{ message, transaction }` |
| PUT | `/api/transactions/:id` | `{ category_id, type, amount, description, date }` | 200: `{ message, transaction }` |
| DELETE | `/api/transactions/:id` | — | 200: `{ message }` |
| GET | `/api/transactions/summary` | Query: `?month=&year=` | 200: `{ month, year, totalIncome, totalExpense, balance, netIncome }` |
| GET | `/api/transactions/summary/category` | Query: `?month=&year=` | 200: `{ month, year, categories[] }` |

### Kategori (Butuh Token)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/categories` | — | 200: `{ count, categories[] }` |
| POST | `/api/categories` | `{ name, type, icon }` | 201: `{ message, category }` |
| DELETE | `/api/categories/:id` | — | 200: `{ message }` |

### Budget (Butuh Token)

| Method | Endpoint | Body/Query | Response |
|--------|----------|------------|----------|
| GET | `/api/budgets` | Query: `?month=&year=` | 200: `{ count, budgets[] }` |
| POST | `/api/budgets` | `{ category_id, amount, month, year }` | 201: `{ message, budget }` |
| PUT | `/api/budgets/:id` | `{ category_id, amount, month, year }` | 200: `{ message, budget }` |
| DELETE | `/api/budgets/:id` | — | 200: `{ message }` |

### Format Token di Header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

*Dokumen ini dibuat berdasarkan analisis seluruh source code aplikasi CatatanKeu per tanggal 25 Agustus 2026.*
