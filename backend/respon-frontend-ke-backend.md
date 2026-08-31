# Alur Respon Frontend → Backend → Database

Catatan ini menjelaskan alur lengkap ketika frontend memanggil API backend hingga database, lalu responnya kembali ke frontend. (Contoh kasus: `POST /api/transactions`)

## 1. Frontend (React + axios)

- Komponen memanggil helper `src/services/api.js` → `api.post("/api/transactions", {...})`.
- Request Interceptor otomatis menyisipkan `Authorization: Bearer <token>` dari localStorage.
- `baseURL` kosong, jadi URL akhir relatif ke server yang sama (mis. `http://localhost:5000/api/transactions`).

## 2. Masuk Backend

- `server.js` → `app.js` → `app.use('/api', routes)` → `routes/index.js` meneruskan ke `transactionRoutes.js`.

## 3. Rute & Middleware

- `transactionRoutes` memanggil:
  1. `authMiddleware` — cek JWT
  2. `validate` — cek body dengan skema Joi
  3. `transactionController.addTransaction`

## 4. Controller → Service → Model → DB

- **Controller** (tipis) hanya membungkus `asyncHandler`, memanggil `transactionService.addTransaction(req.user.id, payload)`.
- **Service** menjalankan logika bisnis (mis. cek transaksi valid, pastikan user bayar kategori yang sama); jika gagal melempar `ApiError`.
- **Model** (`transactionModel`) mengeksekusi SQL: `INSERT INTO transactions ...`.

## 5. Database (PostgreSQL)

- Model mengambil koneksi dari **pool** di `src/config/db.js` (kredensial dari `.env`), lalu query dijalankan.

## 6. Kembali ke Frontend

- Model me-return hasil → service → controller kirim `res.status(201).json({ success: true, ... })` → frontend menerimanya.
- Jika error: `asyncHandler` menangkap → `errorHandler.js`:
  - `ApiError` → response sesuai status code (400/401/404/409), tanpa log
  - error server/bug → dictatat stack trace via `console.error` + response 500
  - format respon error konsisten: `{ success: false, message }`
- Interceptor frontend membaca error; jika `401` (token expired) → hapus token & redirect ke `/login`.

## Ringkasan

```
Frontend → route → middleware → controller → service → model → DB
```

Lalu hasilnya balik lewat jalur yang sama ke frontend.