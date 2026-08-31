# Ide Fitur: Persen di Halaman Budget + Sumber Pemasukan

> **Status: DITUNDA (backlog)** — ide dicatat untuk diimplementasikan di kemudian hari.
> Tanggal catatan: 30 Agustus 2026

---

## 1. Deskripsi Ide

Menambahkan **persentase di bawah kartu budget** pada halaman Budget, lengkap dengan logika "pengeluaran diambil dari sumber pemasukan".

### Logika yang diinginkan

- Jika transaksi **pengeluaran** dicatat di kategori **Bensin**, persen di kartu budget **Bensin** bertambah (terpakai).
- Pada saat yang sama, pemasukan dari salah satu **jatah bulanan** atau **Parttime** akan **berkurang** (sisa tersedia), sesuai sumber yang dipilih di transaksi.
- Nantinya, form transaksi akan punya pilihan **"diambil dari pemasukan mana"** (sumber pengeluaran).

---

## 2. Keputusan Desain (Sudah Dikonfirmasi)

| Aspek | Keputusan |
|-------|-----------|
| **Arti % kartu budget Pemasukan** | Persen **sisa tersedia** = `(budget − terpakai) / budget` → **berkurang** saat ada pengeluaran yang diambil dari sumber itu |
| **Arti % kartu budget Pengeluaran** | Persen **terpakai** = `spent / budget` → **bertambah** saat ada transaksi expense di kategori & bulan itu |
| **Pengaruh transaksi pemasukan** | **Tidak** memengaruhi persen budget pemasukan. Hanya pengeluaran yang mengurangi |
| **Opsi sumber di form transaksi** | Dropdown hanya tampil saat tipe = **Pengeluaran**, berisi **budget pemasukan pada bulan/tahun transaksi** tersebut; boleh dikosongkan = tidak mengurangi budget pemasukan mana pun |

---

## 3. Syarat / Migrasi Database

Saat ini **tidak ada relasi** antara `tb_transactions` dan `tb_budgets` (keduanya hanya terhubung ke `tb_categories`). Data tautan sumber pengeluaran belum punya tempat penyimpanan.

Perlu menambah **satu kolom FK** (nullable) pada `tb_transactions`:

```sql
ALTER TABLE tb_transactions ADD COLUMN IF NOT EXISTS
    income_budget_id INTEGER REFERENCES tb_budgets(id) ON DELETE SET NULL;
```

- Kolom **nullable** → transaksi lama otomatis `NULL`; tidak mengubah persen apa pun.
- Buka dulu config: karena akses DB tidak otomatis, perintah di atas dijalankan manual di psql/pgAdmin.
- Juga update `db/schema.sql` agar setup DB dari nol menyertakan kolom ini.

---

## 4. Rencana Implementasi (Bluepaint untuk Nanti)

### Backend

| File | Perubahan |
|------|-----------|
| `backend/db/schema.sql` | Tambah kolom `income_budget_id` pada `tb_transactions` |
| `backend/src/models/budgetModel.js` | `getAll`: subquery `spent` (expense per kategori+bulan) & `drawn` (expense dengan `income_budget_id = b.id`); helper `findIncomeSource(id, userId, month, year)` (cek budget pemasukan milik user pada periode tsb) |
| `backend/src/services/budgetService.js` | Hitung `progress`: expense → `round(spent/amount*100)`; income → `round(max(0, (amount−drawn)/amount*100))`. Sertakan `spent`, `drawn`, `progress` |
| `backend/src/validations/transactionValidation.js` | Tambah `income_budget_id: Joi.number().integer().allow(null).optional()` (add & update) |
| `backend/src/services/transactionService.js` | Validasi sumber (wajib income, milik user, bulan/tahun cocok dgn tanggal transaksi → `ApiError(400)` bila tidak); teruskan `income_budget_id` |
| `backend/src/models/transactionModel.js` | `create`/`update` menyimpan kolom `income_budget_id` |

### Frontend

| File | Perubahan |
|------|-----------|
| `frontend/src/views/Transactions.vue` | Form: dropdown "Diambil dari Pemasukan (opsional)" hanya saat tipe = Pengeluaran; opsi = budget pemasukan bulan/tahun tanggal transaksi (via `budgetStore.fetchBudgets({month, year})` + filter `category_type === 'income'`); kirim `income_budget_id` (null bila kosong); restore saat edit |
| `frontend/src/views/Budgets.vue` | Di bawah kartu: progress bar + teks — expense: "Terpakai X%" & `Rp spent / Rp amount`; income: "Sisa X%" & `Rp drawn / Rp amount`. Lebar bar `min(progress, 100)`, warna merah (expense) / hijau (income). Tambah CSS `.budget-progress`, `.progress-bar`, `.progress-fill` |

### Urutan Implementasi yang Disarankan

1. Migrasi DB (ALTER TABLE) + update `schema.sql`.
2. Backend: model budget → service budget → validasi & service/model transaksi.
3. Frontend: form transaksi → kartu budget.
4. Verifikasi: `node --check` backend + `npm run build` frontend; uji manual alur "expense Bensin + sumber Jatah Bulanan".