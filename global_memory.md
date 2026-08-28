# Global Memory - Catatan Keuangan Pribadi

> File ini berisi seluruh ingatan/knowledge dari proses pembuatan aplikasi CatatanKeu
> mencakup Tahap 1 (Database), Tahap 2 (Backend), Tahap 3 (Frontend), dan rencana Tahap 4 (Mobile App)

---

## 1. TUJUAN PROYEK

Membangun Sistem Aplikasi Catatan Keuangan Pribadi Multi-Platform (Full-Stack).

- **Target**: Pengguna mencatat pemasukan & pengeluaran, melihat ringkasan saldo, mengelola anggaran
- **Platform**: Web (Vue.js) dan Mobile (Flutter) dengan data tersinkronisasi via REST API
- **Database**: PostgreSQL

---

## 2. TECH STACK

| Layer | Technology | Keterangan |
|-------|------------|------------|
| Database | PostgreSQL | Relational DB |
| Backend | Express.js + Node.js | REST API Server |
| Frontend Web | Vue.js 3 + Vite | SPA Framework |
| Mobile App | Flutter + Dart | Android/iOS App |
| State Management (Web) | Pinia | Ganti Vuex |
| State Management (Mobile) | Provider/Bloc | Flutter state management |
| HTTP Client (Web) | Axios | Panggil API |
| HTTP Client (Mobile) | http / dio | Panggil API |
| Icons (Web) | Lucide Vue Next | Icon library ringan |
| Icons (Mobile) | Material Icons | Flutter built-in |
| Auth | JWT + Bcrypt | Token + Hashing |
| Token Storage (Web) | localStorage | Browser storage |
| Token Storage (Mobile) | flutter_secure_storage | Encrypted mobile storage |
| ORM/Driver | pg (node-postgres) | PostgreSQL client |

---

## 3. STRUKTUR FOLDER PROYEK

```
pencatatan/
├── backend/
│   ├── config/
│   │   └── db.js                    # Koneksi Pool PostgreSQL
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── routes/
│   │   ├── authRoutes.js            # POST /register, /login
│   │   ├── transactionRoutes.js     # CRUD /summary, /summary/category
│   │   ├── categoryRoutes.js        # GET, POST kategori
│   │   └── budgetRoutes.js          # CRUD budget
│   ├── controllers/
│   │   ├── authController.js        # Register & Login logic
│   │   ├── transactionController.js # CRUD + Summary logic
│   │   ├── categoryController.js    # Category logic
│   │   └── budgetController.js      # Budget logic
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── server.js                    # Entry point Express
├── frontend/
│   ├── src/
│   │   ├── assets/styles.css        # CSS global & reset
│   │   ├── components/
│   │   │   ├── Sidebar.vue          # Navigasi sidebar kiri
│   │   │   ├── Navbar.vue           # Header atas (page title + user)
│   │   │   ├── MainLayout.vue       # Layout wrapper (sidebar+navbar+content)
│   │   │   ├── Modal.vue            # Dialog reusable (v-model)
│   │   │   ├── AlertMessage.vue     # Notifikasi success/error
│   │   │   └── LoadingSpinner.vue   # Loading indicator
│   │   ├── views/
│   │   │   ├── Login.vue            # Halaman login
│   │   │   ├── Register.vue         # Halaman registrasi
│   │   │   ├── Dashboard.vue        # Ringkasan saldo & expense by category
│   │   │   ├── Transactions.vue     # CRUD transaksi + filter
│   │   │   ├── Categories.vue       # Kelola kategori (tab income/expense)
│   │   │   └── Budgets.vue          # CRUD budget + filter
│   │   ├── stores/
│   │   │   ├── auth.js              # User, token, login/logout
│   │   │   ├── transactions.js      # Transaksi + summary + expenseByCategory
│   │   │   ├── categories.js        # Categories list
│   │   │   └── budgets.js           # Budgets list
│   │   ├── services/
│   │   │   └── api.js               # Axios instance + interceptors
│   │   ├── router/index.js          # Vue Router + navigation guard
│   │   ├── App.vue                  # Root component
│   │   └── main.js                  # Entry point (Pinia, Router)
│   ├── index.html                   # HTML entry + Google Fonts Inter
│   ├── package.json
│   └── vite.config.js               # Vite config + proxy /api
├── mobile/                           # Flutter Mobile App (Tahap 4)
│   └── lib/                          # Source code Flutter
└── global_memory.md                 # File ini
```

---

## 4. DATABASE SCHEMA

### 4.1 Tabel Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 Tabel Categories
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Default categories
INSERT INTO categories (name, type, icon) VALUES
('Gaji', 'income', 'briefcase'),
('Freelance', 'income', 'laptop'),
('Makanan', 'expense', 'utensils'),
('Transport', 'expense', 'car'),
('Belanja', 'expense', 'shopping-bag'),
('Tagihan', 'expense', 'file-text');
```

### 4.3 Tabel Transactions
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

### 4.4 Tabel Budgets
```sql
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

> **Note**: Tabel budgets menggunakan prefix `tb_` dan referensi ke `tb_users`/`tb_categories`

---

## 5. ENVIRONMENT VARIABLES (.env)

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=catatan_keuangan
DB_USER=postgres
DB_PASSWORD=password_anda
JWT_SECRET=rahasia_jwt_token_anda
```

---

## 6. BACKEND KNOWLEDGE

### 6.1 Dependencies
| Package | Fungsi |
|---------|--------|
| express | Framework web server |
| pg | PostgreSQL client |
| dotenv | Baca variabel .env |
| cors | Cross-origin access |
| bcrypt | Hash password |
| jsonwebtoken | Buat/verifikasi JWT |
| nodemon | Auto-restart server (dev) |

### 6.2 API Endpoints

#### Auth (No Auth Required)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/register` | `{username, email, password}` | `{message, user}` |
| POST | `/api/auth/login` | `{email, password}` | `{message, token, user}` |

#### Transactions (Auth Required: `Bearer <token>`)
| Method | Endpoint | Query/Body | Response |
|--------|----------|------------|----------|
| GET | `/api/transactions` | `?month=&year=` | `{count, transactions}` |
| POST | `/api/transactions` | `{category_id, type, amount, description, date}` | `{message, transaction}` |
| PUT | `/api/transactions/:id` | Same as POST | `{message, transaction}` |
| DELETE | `/api/transactions/:id` | - | `{message}` |
| GET | `/api/transactions/summary` | `?month=&year=` | `{month, year, totalIncome, totalExpense, balance, netIncome}` |
| GET | `/api/transactions/summary/category` | `?month=&year=` | `{month, year, categories}` |

#### Categories (Auth Required)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/categories` | - | `{count, categories}` |
| POST | `/api/categories` | `{name, type, icon}` | `{message, category}` |

#### Budgets (Auth Required)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/budgets` | `?month=&year=` | `{count, budgets}` |
| POST | `/api/budgets` | `{category_id, amount, month, year}` | `{message, budget}` |
| PUT | `/api/budgets/:id` | Same as POST | `{message, budget}` |
| DELETE | `/api/budgets/:id` | - | `{message}` |

### 6.3 Key Backend Patterns

#### Database Connection (config/db.js)
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

#### Middleware Auth (middleware/auth.js)
- Extract token from `Authorization: Bearer <token>`
- Verify with `jwt.verify(token, process.env.JWT_SECRET)`
- Attach decoded user to `req.user`
- Return 401 if invalid/expired

#### Controller Pattern
- Always use `try-catch` in every async handler
- Validate input before DB query
- Use parameterized queries (`$1, $2, ...`) - never string concatenation
- Return appropriate HTTP status codes (200, 201, 400, 401, 404, 409, 500)

#### Transaction Controller - Summary Logic
```sql
-- Total Income bulanan
SELECT COALESCE(SUM(amount), 0) as total
FROM transactions
WHERE user_id = $1 AND type = 'income'
AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3

-- Total Expense bulanan (sama, type = 'expense')

-- Total Balance seluruhnya
SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) -
       COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) as balance
FROM transactions WHERE user_id = $1
```

#### Expense by Category (Pie Chart)
```sql
SELECT c.name as category_name, c.icon,
       COALESCE(SUM(t.amount), 0) as total,
       COUNT(t.id) as transaction_count
FROM categories c
LEFT JOIN transactions t ON c.id = t.category_id
    AND EXTRACT(MONTH FROM t.date) = $2
    AND EXTRACT(YEAR FROM t.date) = $3
    AND t.user_id = $1 AND t.type = 'expense'
WHERE c.type = 'expense' AND (c.user_id IS NULL OR c.user_id = $1)
GROUP BY c.id, c.name, c.icon
HAVING COALESCE(SUM(t.amount), 0) > 0
ORDER BY total DESC
```

---

## 7. FRONTEND KNOWLEDGE

### 7.1 Dependencies
| Package | Fungsi |
|---------|--------|
| vue-router@4 | Navigasi halaman |
| pinia | State management |
| axios | HTTP client |
| lucide-vue-next | Icon library |

### 7.2 Design System (Tema Hijau-Putih)

| Nama | Kode | Kegunaan |
|------|------|----------|
| Green Primary | `#22c55e` | Tombol utama, aksen |
| Green Dark | `#16a34a` | Hover state |
| Green Light | `#f0fdf4` | Background card |
| Green Border | `#bbf7d0` | Border, focus |
| White | `#ffffff` | Background utama |
| Gray 50 | `#f9fafb` | Background sidebar |
| Gray 100 | `#f3f4f6` | Background alternatif |
| Gray 300 | `#d1d5db` | Border, divider |
| Gray 500 | `#6b7280` | Teks sekunder |
| Gray 700 | `#374151` | Teks utama |
| Gray 900 | `#111827` | Judul, teks tebal |
| Red | `#ef4444` | Error, hapus, expense |
| Yellow | `#eab308` | Warning |

**Prinsip Design**:
1. Clean & Minimalis - banyak whitespace
2. Konsisten - semua elemen punya style sama
3. Icon Separuh - pakai icon untuk navigasi/aksi utama
4. Responsif - baik di desktop dan mobile

### 7.3 Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

> Proxy mengatasi CORS: frontend (port 3000) panggil `/api/...` -> Vite forward ke backend (port 5000)

### 7.4 Router Configuration
- Routes with `meta: { requiresAuth: true }` -> redirect to `/login` if not logged in
- Routes with `meta: { requiresGuest: true }` -> redirect to `/` if already logged in
- Navigation guard using `router.beforeEach`

**Routes**:
| Path | Component | Auth |
|------|-----------|------|
| `/login` | Login.vue | Guest only |
| `/register` | Register.vue | Guest only |
| `/` | Dashboard.vue | Required |
| `/transactions` | Transactions.vue | Required |
| `/categories` | Categories.vue | Required |
| `/budgets` | Budgets.vue | Required |

### 7.5 State Management (Pinia Stores)

#### Auth Store
- **State**: `user`, `token`, `loading`, `error`
- **Getters**: `isLoggedIn`, `currentUser`
- **Actions**: `register(userData)`, `login(credentials)`, `logout()`
- Token & user disimpan di `localStorage`

#### Categories Store
- **State**: `categories`, `loading`, `error`
- **Getters**: `incomeCategories`, `expenseCategories`, `getCategoryById(id)`
- **Actions**: `fetchCategories()`, `addCategory(data)`, `deleteCategory(id)`

#### Transactions Store
- **State**: `transactions`, `summary`, `expenseByCategory`, `loading`, `error`
- **Getters**: `totalTransactions`
- **Actions**: `fetchTransactions(params)`, `addTransaction(data)`, `updateTransaction(id, data)`, `deleteTransaction(id)`, `fetchSummary(params)`, `fetchExpenseByCategory(params)`

#### Budgets Store
- **State**: `budgets`, `loading`, `error`
- **Getters**: `totalBudget`
- **Actions**: `fetchBudgets(params)`, `addBudget(data)`, `updateBudget(id, data)`, `deleteBudget(id)`

### 7.6 API Service (services/api.js)
- Axios instance dengan `baseURL: ''` (karena pakai proxy)
- **Request Interceptor**: Otomatis tambahkan `Authorization: Bearer <token>` dari localStorage
- **Response Interceptor**: Jika 401, hapus token & redirect ke `/login`

### 7.7 Component Architecture

#### Layout Components
- **MainLayout.vue**: Wrapper dengan Sidebar + Navbar + Content slot
- **Sidebar.vue**: Navigasi kiri (Dashboard, Transaksi, Kategori, Budget, Keluar)
- **Navbar.vue**: Header atas (page title + username)
- **Modal.vue**: Dialog reusable, pakai `<Teleport to="body">`, kontrol via `v-model`
- **AlertMessage.vue**: Notifikasi success/error dengan icon
- **LoadingSpinner.vue**: Loading indicator dengan optional text

#### View Components
- **Login.vue**: Form email + password, toggle show/hide password
- **Register.vue**: Form username + email + password, redirect ke login setelah sukses
- **Dashboard.vue**: 3 summary cards (Income, Expense, Balance) + Expense by Category list
- **Transactions.vue**: Filter bulan/tahun, list transaksi, modal tambah/edit, format Rupiah
- **Categories.vue**: Tab income/expense, grid kategori dengan icon, modal tambah
- **Budgets.vue**: Filter bulan/tahun, grid budget cards, modal tambah/edit

### 7.8 CSS Patterns

#### Global Reset (styles.css)
```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #f9fafb; color: #111827; }
```

#### Common Button Styles
```css
.btn-primary { background: #22c55e; color: white; border-radius: 8px; }
.btn-primary:hover { background: #16a34a; }
.btn-secondary { background: white; border: 1px solid #d1d5db; border-radius: 8px; }
.btn-cancel { background: white; border: 1px solid #d1d5db; border-radius: 8px; }
```

#### Form Input Focus
```css
.form-input:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}
```

#### Card Pattern
```css
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #bbf7d0;
}
```

### 7.9 Format Uang
```javascript
const formatMoney = (amount) => new Intl.NumberFormat('id-ID').format(amount)
// Output: 5000000 -> "5.000.000"
```

### 7.10 Icon Mapping (Categories)
```javascript
const iconMap = {
  'briefcase': Briefcase, 'laptop': Laptop, 'utensils': Utensils,
  'car': Car, 'shopping-cart': ShoppingCart, 'shopping-bag': ShoppingCart,
  'file-text': FileText, 'home': Home, 'heart': Heart,
  'book-open': BookOpen, 'gift': Gift, 'dumbbell': Dumbbell,
  'plane': Plane, 'music': Music, 'coffee': Coffee,
  'wifi': Wifi, 'tag': Tags
}
```

---

## 8. KEY PATTERNS & BEST PRACTICES

### 8.1 Security
- Password selalu di-hash dengan `bcrypt` (salt rounds: 10)
- JWT token expire dalam 24 jam
- Selalu validasi input di backend
- Parameterized query untuk hindari SQL injection
- Token disimpan di localStorage, dikirim via header Authorization

### 8.2 Error Handling
- Backend: try-catch di setiap controller async
- Frontend: error state di setiap Pinia store
- User-facing errors via AlertMessage component
- Auto-logout pada 401 (token expired)

### 8.3 Data Flow
```
User Input -> Vue Component -> Pinia Store -> Axios -> Proxy -> Express API -> PostgreSQL
                                                                    |
User Interface <- Vue Component <- Pinia Store <- Axios Response <---+
```

### 8.4 CORS Handling
- Backend: `app.use(cors())`
- Frontend: Vite proxy `/api` -> `http://localhost:5000`

### 8.5 Testing Order (Postman)
1. Register (POST /api/auth/register) - no token
2. Login (POST /api/auth/login) - get token
3. GET /api/categories - verify token works
4. POST /api/transactions - add transaction
5. GET /api/transactions - list transactions
6. GET /api/transactions/summary - view summary
7. PUT /api/transactions/:id - edit
8. DELETE /api/transactions/:id - delete
9. POST /api/budgets - add budget
10. GET /api/budgets - list budgets
11. PUT /api/budgets/:id - edit
12. DELETE /api/budgets/:id - delete

---

## 9. TROUBLESHOOTING

| Error | Penyebab | Solusi |
|-------|----------|--------|
| 401 Unauthorized | Token tidak ada/expired | Login ulang |
| 401 "token tidak ditemukan" | Lupa header Authorization | Tambahkan `Authorization: Bearer <token>` |
| 400 "field wajib diisi" | Body kosong/missing field | Isi semua field |
| 409 "sudah terdaftar" | Email/username duplikat | Gunakan data lain |
| 409 "budget sudah ada" | Budget kategori & bulan sama | Update yang sudah ada |
| 500 "Server error" | Server mati/error | Cek terminal, jalankan `npm run dev` |
| ECONNREFUSED | Server tidak jalan | Jalankan backend dulu |

---

## 10. RUNNING THE APP

### Backend
```bash
cd backend
npm run dev    # Uses nodemon for auto-restart
# Server berjalan di http://localhost:5000
```

### Frontend
```bash
cd frontend
npm run dev    # Uses Vite dev server
# Akses di http://localhost:3000
```

---

## 11. PROGRESS & ROADMAP

```
[ ✅ TAHAP 1: DATABASE ] ---> [ ✅ TAHAP 2: BACKEND API ] ---> [ ✅ TAHAP 3: FRONTEND WEB ] ---> [ ⚪ TAHAP 4: MOBILE APP ]
  (PostgreSQL)                   (Express.js & Node)             (Vue.js 3 & Pinia)             (Flutter & Dart)
  Status: SELESAI                Status: SELESAI                  Status: SELESAI                 Status: AKAN DATANG
```

| Tahap | Status | Technology |
|-------|--------|------------|
| 1. Database | SELESAI | PostgreSQL |
| 2. Backend API | SELESAI | Express.js + Node.js |
| 3. Frontend Web | SELESAI | Vue.js 3 + Pinia |
| 4. Mobile App | AKAN DATANG | Flutter + Dart |

---

## 12. TAHAP 4: MOBILE APP (FLUTTER + DART)

### 12.1 Overview
- **Ibarat Rumah**: Membuat Tampilan Rumah Versi Portabel (HP)
- **Tujuan**: Membuat aplikasi Android/iOS menggunakan Flutter yang mengonsumsi REST API yang sama dengan Web
- **Target Platform**: Android & iOS

### 12.2 Tech Stack Flutter

| Package | Fungsi |
|---------|--------|
| `flutter` | SDK utama |
| `http` atau `dio` | HTTP client untuk panggil API |
| `flutter_secure_storage` | Penyimpanan JWT token aman |
| `provider` atau `flutter_bloc` | State management |
| `shared_preferences` | Local storage (simple data) |
| `intl` | Format tanggal & uang |
| `fl_chart` atau `pie_chart` | Grafik (pie chart expense) |

### 12.3 Struktur Folder Flutter (Planned)

```
mobile/
├── lib/
│   ├── main.dart                 # Entry point
│   ├── config/
│   │   ├── api_config.dart       # Base URL & endpoints
│   │   ├── theme.dart            # App theme (warna hijau-putih)
│   │   └── routes.dart           # Named routes
│   ├── models/
│   │   ├── user.dart             # User model
│   │   ├── transaction.dart      # Transaction model
│   │   ├── category.dart         # Category model
│   │   └── budget.dart           # Budget model
│   ├── services/
│   │   ├── api_service.dart      # HTTP client + interceptors
│   │   ├── auth_service.dart     # Login/Register/Token management
│   │   └── storage_service.dart  # Secure storage wrapper
│   ├── providers/ (atau bloc/)
│   │   ├── auth_provider.dart    # Auth state
│   │   ├── transaction_provider.dart
│   │   ├── category_provider.dart
│   │   └── budget_provider.dart
│   ├── screens/
│   │   ├── splash_screen.dart    # Splash/loading screen
│   │   ├── login_screen.dart     # Login page
│   │   ├── register_screen.dart  # Register page
│   │   ├── dashboard_screen.dart # Dashboard utama
│   │   ├── transactions_screen.dart
│   │   ├── categories_screen.dart
│   │   ├── budgets_screen.dart
│   │   └── add_transaction_screen.dart
│   ├── widgets/
│   │   ├── summary_card.dart     # Card saldo/income/expense
│   │   ├── transaction_tile.dart # List item transaksi
│   │   ├── category_card.dart    # Card kategori
│   │   ├── budget_card.dart      # Card budget
│   │   ├── custom_button.dart    # Tombol reusable
│   │   ├── custom_input.dart     # Input field reusable
│   │   ├── loading_widget.dart   # Loading indicator
│   │   └── alert_dialog.dart     # Dialog notifikasi
│   └── utils/
│       ├── formatters.dart       # formatMoney, formatDate
│       └── validators.dart       # Form validation
├── assets/
│   └── images/                   # Logo, icons
├── android/                      # Android config
├── ios/                          # iOS config
├── pubspec.yaml                  # Dependencies
└── README.md
```

### 12.4 Design System (Harus Konsisten dengan Web)

| Nama | Kode | Kegunaan |
|------|------|----------|
| Green Primary | `Color(0xFF22C55E)` | Tombol utama, aksen |
| Green Dark | `Color(0xFF16A34A)` | Hover/pressed state |
| Green Light | `Color(0xFFF0FDF4)` | Background card |
| Green Border | `Color(0xFFBBF7D0)` | Border, focus |
| White | `Colors.white` | Background utama |
| Gray 50 | `Color(0xFFF9FAFB)` | Background scaffold |
| Gray 100 | `Color(0xFFF3F4F6)` | Background alternatif |
| Gray 300 | `Color(0xFFD1D5DB)` | Border, divider |
| Gray 500 | `Color(0xFF6B7280)` | Teks sekunder |
| Gray 700 | `Color(0xFF374151)` | Teks utama |
| Gray 900 | `Color(0xFF111827)` | Judul, teks tebal |
| Red | `Color(0xFFEF4444)` | Error, expense |
| Yellow | `Color(0xFFEAB308)` | Warning |

### 12.5 Halaman & Screen Flow

```
Splash Screen
    │
    ▼
┌─────────────┐     ┌──────────────┐
│ Login Screen │────>│ Register Screen│
└──────┬──────┘     └──────────────┘
       │ (success)
       ▼
┌─────────────────────────────────────┐
│          Bottom Navigation          │
│  ┌─────────┬─────────┬─────────┐   │
│  │Dashboard│Transaksi│ Budget  │   │
│  └────┬────┴────┬────┴────┬────┘   │
│       │         │         │        │
│       ▼         ▼         ▼        │
│  [Ringkasan] [List]    [List]      │
│  [Saldo]     [Filter]  [Filter]    │
│  [Expense    [FAB +]   [FAB +]     │
│   by Cat]    [Add]     [Add]       │
└─────────────────────────────────────┘
```

### 12.6 API Endpoint Reference (Sama dengan Web)

Base URL: `http://10.0.2.2:5000` (Android Emulator) atau `http://localhost:5000`

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/auth/register` | No | `{username, email, password}` |
| POST | `/api/auth/login` | No | `{email, password}` |
| GET | `/api/transactions` | Yes | `?month=&year=` |
| POST | `/api/transactions` | Yes | `{category_id, type, amount, description, date}` |
| PUT | `/api/transactions/:id` | Yes | Same as POST |
| DELETE | `/api/transactions/:id` | Yes | - |
| GET | `/api/transactions/summary` | Yes | `?month=&year=` |
| GET | `/api/transactions/summary/category` | Yes | `?month=&year=` |
| GET | `/api/categories` | Yes | - |
| POST | `/api/categories` | Yes | `{name, type, icon}` |
| GET | `/api/budgets` | Yes | `?month=&year=` |
| POST | `/api/budgets` | Yes | `{category_id, amount, month, year}` |
| PUT | `/api/budgets/:id` | Yes | Same as POST |
| DELETE | `/api/budgets/:id` | Yes | - |

**Auth Header**: `Authorization: Bearer <token>`

### 12.7 Key Concepts Flutter

#### Token Management (flutter_secure_storage)
```dart
// Simpan token
await storage.write(key: 'jwt_token', value: token);

// Ambil token
String? token = await storage.read(key: 'jwt_token');

// Hapus token (logout)
await storage.delete(key: 'jwt_token');
```

#### HTTP Request Pattern
```dart
final response = await http.get(
  Uri.parse('$baseUrl/api/transactions'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
);
```

#### Format Uang (konsisten dengan web)
```dart
String formatMoney(double amount) {
  final format = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );
  return format.format(amount);
}
```

### 12.8 Widget Layout Patterns

#### Summary Card (Dashboard)
```dart
Card(
  child: Padding(
    padding: EdgeInsets.all(16),
    child: Row(
      children: [
        Container( /* icon */ ),
        SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Total Income', style: TextStyle(color: Colors.grey)),
            Text('Rp 5.000.000', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ],
    ),
  ),
)
```

#### Transaction List Item
```dart
ListTile(
  leading: CircleAvatar(/* icon */),
  title: Text('Gaji bulanan'),
  subtitle: Text('Gaji &bullet; 19 Agt 2026'),
  trailing: Text('+ Rp 5.000.000', style: TextStyle(color: Colors.green)),
)
```

#### Bottom Navigation
```dart
BottomNavigationBar(
  items: [
    BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Dashboard'),
    BottomNavigationBarItem(icon: Icon(Icons.receipt), label: 'Transaksi'),
    BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet), label: 'Budget'),
  ],
)
```

### 12.9 Implementation Steps (Planned)

| Step | Task | Keterangan |
|------|------|------------|
| 4.1 | Setup Flutter Project | `flutter create mobile`, install dependencies |
| 4.2 | Config & Theme | API config, theme colors, routes |
| 4.3 | Models | User, Transaction, Category, Budget models |
| 4.4 | Services | API service, auth service, storage service |
| 4.5 | Providers | Auth, transaction, category, budget providers |
| 4.6 | Splash & Auth Screens | Splash, Login, Register |
| 4.7 | Dashboard Screen | Summary cards + expense by category |
| 4.8 | Transactions Screen | List + filter + add/edit |
| 4.9 | Budgets Screen | List + filter + add/edit |
| 4.10 | Categories Screen | Grid kategori |
| 4.11 | Polish & Testing | Error handling, loading states, testing |

### 12.10 Checklist Tahap 4

- [ ] Project Flutter terinisialisasi
- [ ] Models terbuat (User, Transaction, Category, Budget)
- [ ] API Service + Auth Service berfungsi
- [ ] Token disimpan di flutter_secure_storage
- [ ] Splash Screen tampil
- [ ] Login & Register berfungsi
- [ ] Dashboard menampilkan summary & expense by category
- [ ] Transaksi: CRUD berfungsi
- [ ] Budget: CRUD berfungsi
- [ ] Kategori: Lihat & tambah berfungsi
- [ ] Filter bulan/tahun berfungsi
- [ ] Loading & error handling berfungsi
- [ ] Theme hijau-putih konsisten dengan web
- [ ] Format Rupiah konsisten dengan web

---

*Last updated: Tahap 4 Planning Added*
