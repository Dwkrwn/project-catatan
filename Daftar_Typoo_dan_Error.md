# 🔧 Daftar Typo & Error di Backend

> **Status**: Perlu Diperbaiki
> **Catatan**: File ini hanya dokumentasi. Tidak ada kode yang diubah secara otomatis.

---

## 📌 RINGKASAN MASALAH

| # | File | Severity | Keterangan |
|---|------|----------|------------|
| 1 | transactionController.js:15 | CRITICAL | `const query` tidak bisa di-reassign → **Server Crash** |
| 2 | transactionController.js:20 | CRITICAL | Kolom `transaction_date` tidak ada di database → **Query Error** |
| 3 | transactionController.js:25 | HIGH | Key `const` salah, seharusnya `count` |
| 4 | transactionController.js:8 | MEDIUM | Typo `catagory_icon` → `category_icon` |
| 5 | transactionController.js:47 | MEDIUM | Typo `expanse` → `expense` |
| 6 | transactionRoutes.js:1 | CRITICAL | Typo `experss` → `express` → **Server Crash** |
| 7 | transactionRoutes.js:10 | HIGH | Path `'summary/category'` kurang `/` di depan |
| 8 | transactionRoutes.js:12 | HIGH | PUT tanpa `/:id` → update tidak bisa jalan |
| 9 | transactionRoutes.js:13 | HIGH | DELETE tanpa `/:id` → delete tidak bisa jalan |
| 10 | categoryRoutes.js:10 | HIGH | DELETE tanpa `/:id` → delete tidak bisa jalan |
| 11 | categoryController.js:49 | MEDIUM | Fungsi `deteleCategory` typo (seharusnya `deleteCategory`) |
| 12 | categoryController.js:60 | LOW | Konsistensi casing: `Category` vs `category` |
| 13 | authController.js:73 | LOW | `expiresIn: '24H'` seharusnya `'24h'` (lowercase) |
| 14 | middleware/auth.js:15 | LOW | Variabel `decode` seharusnya `decoded` (konsistensi) |

---

## 📝 DETIL MASALAH & CARA PERBAIKAN

---

### ❌ 1. [CRITICAL] `const query` tidak bisa di-reassign

**File**: `controllers/transactionController.js`  
**Baris**: 15

**Kode Sekarang (SALAH)**:
```javascript
const query = ` SELECT t.*, ...`;  // line 8

if (month && year) {
    query += ` AND EXTRACT(...)    // line 15 — ERROR: Assignment to constant variable
```

**Penjelasan**:  
`const` membuat variabel tidak bisa diubah nilainya. Tapi di baris 15, `query +=` mencoba menambah isi string ke `query`. Ini akan menyebabkan error:
```
TypeError: Assignment to constant variable.
```
Server akan crash setiap kali user memanggil GET `/api/transactions?month=8&year=2026`.

**Cara Perbaikan**:  
Ganti `const query` menjadi `let query` di baris 8.

```javascript
// SEBELUM (SALAH)
const query = ` SELECT ...`;

// SESUDAH (BENAR)
let query = ` SELECT ...`;
```

---

### ❌ 2. [CRITICAL] Kolom `transaction_date` tidak ada di database

**File**: `controllers/transactionController.js`  
**Baris**: 20

**Kode Sekarang (SALAH)**:
```javascript
query += " ORDER BY t.transaction_date DESC, t.created_at DESC";
```

**Penjelasan**:  
Berdasarkan schema database `tb_transactions`, kolom yang ada adalah:
- `id`
- `user_id`
- `category_id`
- `type`
- `amount`
- `description`
- `date`          ← ini yang benar
- `created_at`

Tidak ada kolom bernama `transaction_date`. Query akan gagal dengan error:
```
error: column "transaction_date" does not exist
```

**Cara Perbaikan**:  
Ganti `t.transaction_date` menjadi `t.date`.

```javascript
// SEBELUM (SALAH)
query += " ORDER BY t.transaction_date DESC, t.created_at DESC";

// SESUDAH (BENAR)
query += " ORDER BY t.date DESC, t.created_at DESC";
```

---

### ❌ 3. [HIGH] Key `const` salah, seharusnya `count`

**File**: `controllers/transactionController.js`  
**Baris**: 25

**Kode Sekarang (SALAH)**:
```javascript
res.json({
    const: result.rows.length,   // key-nya "const", bukan "count"
    transactions: result.rows,
});
```

**Penjelasan**:  
Response akan mengirim `{ "const": 5, "transactions": [...] }` padahal seharusnya `{ "count": 5, "transactions": [...] }`. Frontend yang membaca field `count` akan mendapatkan `undefined`.

**Cara Perbaikan**:
```javascript
// SEBELUM (SALAH)
const: result.rows.length,

// SESUDAH (BENAR)
count: result.rows.length,
```

---

### ❌ 4. [MEDIUM] Typo `catagory_icon`

**File**: `controllers/transactionController.js`  
**Baris**: 8

**Kode Sekarang (SALAH)**:
```javascript
c.icon as catagory_icon    // "catagory" salah
```

**Penjelasan**:  
Typo: `catagory` → seharusnya `category`. Frontend yang mengakses field `category_icon` akan mendapatkan `undefined`.

**Cara Perbaikan**:
```javascript
// SEBELUM (SALAH)
c.icon as catagory_icon

// SESUDAH (BENAR)
c.icon as category_icon
```

---

### ❌ 5. [MEDIUM] Typo `expanse`

**File**: `controllers/transactionController.js`  
**Baris**: 47

**Kode Sekarang (SALAH)**:
```javascript
.json({ message: "Type harus income atau expanse" });
```

**Penjelasan**:  
`expanse` bukan kata yang benar. Yang benar adalah `expense`.

**Cara Perbaikan**:
```javascript
// SEBELUM (SALAH)
"Type harus income atau expanse"

// SESUDAH (BENAR)
"Type harus income atau expense"
```

---

### ❌ 6. [CRITICAL] Typo `experss` → Server tidak bisa start

**File**: `routes/transactionRoutes.js`  
**Baris**: 1

**Kode Sekarang (SALAH)**:
```javascript
const experss = require('express');
const router = experss.Router();
```

**Penjelasan**:  
`experss` bukan nama module yang benar. `require('express')` mengembalikan object express, tapi saat dipanggil `experss.Router()` akan error karena variabelnya typo. Server akan crash saat startup:
```
TypeError: experss.Router is not a function
```

**Cara Perbaikan**:
```javascript
// SEBELUM (SALAH)
const experss = require('express');
const router = experss.Router();

// SESUDAH (BENAR)
const express = require('express');
const router = express.Router();
```

---

### ❌ 7. [HIGH] Path summary/category kurang `/`

**File**: `routes/transactionRoutes.js`  
**Baris**: 10

**Kode Sekarang (SALAH)**:
```javascript
router.get('summary/category', transactionController.getExpenseByCategory);
```

**Penjelasan**:  
Path `'summary/category'` tanpa `/` di depan akan menjadi `/summary/category` secara teknis, tapi ini bukan convention yang benar dan bisa menyebabkan issue di beberapa versi Express. Seharusnya `/summary/category`.

**Cara Perbaikan**:
```javascript
// SEBELUM (SALAH)
router.get('summary/category', transactionController.getExpenseByCategory);

// SESUDAH (BENAR)
router.get('/summary/category', transactionController.getExpenseByCategory);
```

---

### ❌ 8. [HIGH] PUT tanpa parameter `/:id`

**File**: `routes/transactionRoutes.js`  
**Baris**: 12

**Kode Sekarang (SALAH)**:
```javascript
router.put('/', transactionController.updateTransaction);
```

**Penjelasan**:  
`updateTransaction` di controller menggunakan `req.params.id` untuk mencari transaksi yang mau diupdate. Tapi route `PUT '/'` tidak menerima parameter id. `req.params.id` akan selalu `undefined`.

**Cara Perbaikan**:
```javascript
// SEBELUM (SALAH)
router.put('/', transactionController.updateTransaction);

// SESUDAH (BENAR)
router.put('/:id', transactionController.updateTransaction);
```

---

### ❌ 9. [HIGH] DELETE tanpa parameter `/:id`

**File**: `routes/transactionRoutes.js`  
**Baris**: 13

**Kode Sekarang (SALAH)**:
```javascript
router.delete('/', transactionController.deleteTransaction);
```

**Penjelasan**:  
Sama seperti PUT, `deleteTransaction` menggunakan `req.params.id`. Tanpa `/:id` di route, id tidak akan pernah ada.

**Cara Perbaikan**:
```javascript
// SEBELUM (SALAH)
router.delete('/', transactionController.deleteTransaction);

// SESUDAH (BENAR)
router.delete('/:id', transactionController.deleteTransaction);
```

---

### ❌ 10. [HIGH] DELETE category tanpa parameter `/:id`

**File**: `routes/categoryRoutes.js`  
**Baris**: 10

**Kode Sekarang (SALAH)**:
```javascript
router.delete('/', categoryController.deteleCategory);
```

**Penjelasan**:  
`deteleCategory` di controller menggunakan `req.params.id`. Tanpa `/:id`, id tidak akan ada.

**Cara Perbaikan**:
```javascript
// SEBELUM (SALAH)
router.delete('/', categoryController.deteleCategory);

// SESUDAH (BENAR)
router.delete('/:id', categoryController.deleteCategory);
```

> **Catatan**: Fungsi controller juga harus diganti dari `deteleCategory` → `deleteCategory` (lihat nomor 11).

---

### ❌ 11. [MEDIUM] Nama fungsi `deteleCategory` typo

**File**: `controllers/categoryController.js`  
**Baris**: 49

**Kode Sekarang (SALAH)**:
```javascript
exports.deteleCategory = async (req, res) => {
```

**Penjelasan**:  
`detele` → seharusnya `delete`. Ini typo nama fungsi. Route harus panggil nama yang sama persis.

**Cara Perbaikan**:
```javascript
// SEBELUM (SALAH)
exports.deteleCategory = async (req, res) => {

// SESUDAH (BENAR)
exports.deleteCategory = async (req, res) => {
```

> **Jangan lupa**: Update juga di `categoryRoutes.js` baris 10 untuk memanggil `categoryController.deleteCategory`.

---

### ⚠️ 12. [LOW] Konsistensi casing di pesan response

**File**: `controllers/categoryController.js`  
**Baris**: 60 & 63

**Kode Sekarang**:
```javascript
return res.status(404).json({ message: 'Category tidak ditemukan' });   // capital C
res.json({ message: 'category berhasil dihapus' });                     // lowercase c
```

**Penjelasan**:  
Tidak konsisten. Seharusnya sama-sama capital `Category` atau lowercase `category`.

**Cara Perbaikan** (pilih salah satu, yang penting konsisten):
```javascript
// OPSI 1: Capital C (disarankan untuk konsistensi)
message: 'Category tidak ditemukan'
message: 'Category berhasil dihapus'

// OPSI 2: Lowercase c
message: 'category tidak ditemukan'
message: 'category berhasil dihapus'
```

---

### ⚠️ 13. [LOW] `expiresIn: '24H'` seharusnya lowercase

**File**: `controllers/authController.js`  
**Baris**: 73

**Kode Sekarang**:
```javascript
{ expiresIn: '24H' }
```

**Penjelasan**:  
Secara teknis `jsonwebtoken` masih menerima `'24H'`, tapi standar dan dokumentasi menggunakan lowercase `'24h'`. Lebih aman pakai lowercase.

**Cara Perbaikan**:
```javascript
// SEBELUM
{ expiresIn: '24H' }

// SESUDAH (disarankan)
{ expiresIn: '24h' }
```

---

### ⚠️ 14. [LOW] Variabel `decode` seharusnya `decoded`

**File**: `middleware/auth.js`  
**Baris**: 15-16

**Kode Sekarang**:
```javascript
const decode = jwt.verify(token, process.env.JWT_SECRET);
req.user = decode;
```

**Penjelasan**:  
Secara teknis tidak error, tapi convention JavaScript untuk hasil decode/verify adalah `decoded` (bukan `decode`). Juga konsisten dengan error handler `TokenExpiredError` yang sering disebut "decoded token".

**Cara Perbaikan**:
```javascript
// SEBELUM
const decode = jwt.verify(token, process.env.JWT_SECRET);
req.user = decode;

// SESUDAH (disarankan)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;
```

---

## ✅ FILE YANG TIDAK ADA MASALAH

| File | Status |
|------|--------|
| `config/db.js` | Bersih |
| `middleware/auth.js` | Minor (nomor 14) |
| `controllers/authController.js` | Minor (nomor 13) |
| `controllers/budgetController.js` | Bersih |
| `routes/authRoutes.js` | Bersih |
| `routes/budgetRoutes.js` | Bersih |
| `server.js` | Bersih |

---

## 🎯 PRIORITAS PERBAIKAN

### Harus diperbaiki SEKARANG (Server Crash / Fatal Error):
1. **transactionRoutes.js:1** — `experss` → `express`
2. **transactionController.js:15** — `const query` → `let query`
3. **transactionController.js:20** — `transaction_date` → `date`

### Harus diperbaiki (Fitur Tidak Jalan):
4. **transactionController.js:25** — `const:` → `count:`
5. **transactionRoutes.js:10** — `'summary/category'` → `'/summary/category'`
6. **transactionRoutes.js:12** — `put('/')` → `put('/:id')`
7. **transactionRoutes.js:13** — `delete('/')` → `delete('/:id')`
8. **categoryRoutes.js:10** — `delete('/')` → `delete('/:id')`
9. **categoryController.js:49** — `deteleCategory` → `deleteCategory`

### Sebaiknya diperbaiki (Konsistensi / Kualitas):
10. **transactionController.js:8** — `catagory_icon` → `category_icon`
11. **transactionController.js:47** — `expanse` → `expense`
12. **categoryController.js:60,63** — Konsistensi casing
13. **authController.js:73** — `'24H'` → `'24h'`
14. **middleware/auth.js:15** — `decode` → `decoded`
