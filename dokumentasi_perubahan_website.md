# Dokumentasi Perubahan Website (untuk Replikasi ke Mobile App)

> Dokumen ini merangkum **semua fitur dan perbaikan** yang sudah dikerjakan di website,
> agar bisa **diimplementasikan ulang (replikasi) di aplikasi mobile**.
> Ditulis dengan bahasa sederhana dan mengikuti logika bisnis yang sama.

---

## Ringkasan Dua Fitur Utama yang Ditambahkan

1. **Fitur 1 — Persentase & Sumber Pemasukan (Budget)** — dari `fitur_budget.md`
2. **Fitur 2 — Budget Pemasukan Membuat Transaksi Otomatis + Saldo Dashboard** — dari `persen_budget.md`

Kedua fitur saling berkaitan dan keduanya harus ada agar perilaku website dan mobile konsisten.

---

# FITUR 1: Persentase Budget + Sumber Pemasukan

## Konsep
Setiap budget (kantong uang) kini menampilkan **persentase**, dan pengeluaran bisa ditandai
"diambil dari" budget pemasukan mana.

## Database
- Tambah kolom `income_budget_id` di tabel transaksi (nullable).
  ```sql
  ALTER TABLE tb_transactions ADD COLUMN IF NOT EXISTS
      income_budget_id INTEGER REFERENCES tb_budgets(id) ON DELETE SET NULL;
  ```

## Logika Perhitungan
- **Budget Pengeluaran** (mis. Bensin):
  - `spent` = jumlah semua transaksi **expense** dengan kategori tersebut pada bulan/tahun budget.
  - `progress` = `spent ÷ amount × 100` → **persen terpakai** (naik saat belanja).
- **Budget Pemasukan** (mis. Uang Jajan):
  - `drawn` = jumlah semua transaksi yang `income_budget_id`-nya menunjuk ke budget ini.
  - `remaining` = `amount − drawn`.
  - `progress` = `remaining ÷ amount × 100` → **persen sisa** (turun saat diambil).

## Validasi Sumber Pemasukan
Saat user memilih "diambil dari pemasukan", pastikan:
- Budget tersebut berjenis **pemasukan**.
- Budget **milik user** yang login.
- Bulan/tahun budget **cocok** dengan bulan/tahun tanggal transaksi.

## UI
- **Halaman Transaksi**: dropdown "Diambil dari Pemasukan (opsional)" muncul hanya untuk transaksi
  pengeluaran; menampilkan sisa uang tiap kantong; badge kecil "dari [pemasukan]" di baris transaksi.
- **Halaman Budget**: progress bar + label "Terpakai X%" (merah, pengeluaran) dan "Sisa X%" (hijau, pemasukan).

---

# FITUR 2: Budget Pemasukan → Transaksi Otomatis + Saldo Dashboard

## Konsep
Membuat budget **pemasukan** tidak hanya membuat rencana, tapi **langsung mencatat transaksi
pemasukan** sehingga **saldo Dashboard bertambah**.

## Database
Tambah dua kolom baru di tabel transaksi:
  ```sql
  ALTER TABLE tb_transactions ADD COLUMN IF NOT EXISTS
      is_auto BOOLEAN NOT NULL DEFAULT FALSE;

  ALTER TABLE tb_transactions ADD COLUMN IF NOT EXISTS
      source_budget_id INTEGER REFERENCES tb_budgets(id) ON DELETE SET NULL;
  ```

| Kolom | Fungsi |
|-------|--------|
| `is_auto` | `TRUE` = transaksi otomatis dari budget (dilindungi) |
| `source_budget_id` | id budget asal, agar transaksi bisa ikut berubah/hapus |

## Logika Backend
- **Buat budget pemasukan** (`addBudget`):
  1. Simpan budget.
  2. Jika kategori berjenis **income**, buat transaksi pemasukan otomatis di **tanggal 1** bulan
     budget (kategori & nominal sama, `is_auto = TRUE`, `source_budget_id = id budget`).
  3. Lakukan dalam **satu transaksi database** (commit/rollback) agar tidak ada data setengah jadi.
- **Ubah budget pemasukan** (`updateBudget`): jika nominal/bulan/tahun berubah, transaksi otomatis
  terkait ikut diperbarui (nominal & tanggal).
- **Hapus budget pemasukan** (`deleteBudget`): transaksi otomatis terkait ikut dihapus terlebih
  dahulu.
- **Proteksi transaksi otomatis**: edit/hapus transaksi dengan `is_auto = TRUE` **ditolak** oleh
  API. Sarannya: ubah/hapus lewat halaman Budget.

## UI
- **Halaman Transaksi**: transaksi pemasukan otomatis tampil seperti biasa (`+ Rp x`), diberi
  **badge "otomatis dari budget"**, dan tombol edit/hapus **disembunyikan**.
- **Halaman Dashboard**: saldo (lifetime) otomatis bertambah karena transaksi pemasukan terhitung.
- **Halaman Budget**: tampilan tidak berubah signifikan.

---

# PENTING: Hubungan Antara Dua Kolom Pemasukan

Ada **dua kolom** berbeda yang jangan sampai tertukar di mobile app:

| Kolom | Dipakai untuk | Contoh |
|-------|---------------|--------|
| `income_budget_id` | Pengeluaran menunjuk **sumber pemasukan** (transaksi `expense`) | Pengeluaran Bensin diambil dari Uang Jajan |
| `source_budget_id` | Transaksi **pemasukan otomatis** dari budget (transaksi `income`) | Budget Uang Jajan → transaksi +Rp 1jt |

- `income_budget_id` → dipakai hitung `drawn` (berapa yang sudah diambil dari kantong pemasukan).
- `source_budget_id` → dipakai menautkan transaksi otomatis ke budget asalnya, agar sinkron
  saat budget diubah/dihapus.
- Transaksi otomatis (`is_auto = TRUE`) **tidak boleh** menaruh `income_budget_id`, supaya tidak
  salah masuk ke hitungan `drawn`.

---

# Ringkasan Perilaku yang Harus Sama di Mobile

1. ⚠️ Buat budget pemasukan → otomatis buat transaksi pemasukan (`is_auto=TRUE`, `source_budget_id`,
   tanggal 1 bulan tersebut), saldo bertambah.
2. ⚠️ Ubah nominal budget pemasukan → transaksi otomatis ikut berubah.
3. ⚠️ Hapus budget pemasukan → transaksi otomatis ikut terhapus.
4. ⚠️ Transaksi otomatis tidak bisa diedit/dihapus manual.
5. ✅ Budget pengeluaran → persen **terpakai** (naik); budget pemasukan → persen **sisa** (turun).
6. ✅ Pengeluaran bisa menunjuk sumber pemasukan (`income_budget_id`), dengan validasi bulan/tahun & kepemilikan.
7. ✅ Saldo Dashboard = `SUM(income) − SUM(expense)` (lifetime), sehingga transaksi otomatis ikut menambah saldo.

---

# File Website yang Diubah (referensi implementasi)

**Backend (`backend/src/`):**
| File | Isi perubahan |
|------|---------------|
| `db/schema.sql` | Kolom `income_budget_id`, `is_auto`, `source_budget_id` |
| `models/budgetModel.js` | Hitung `spent`, `drawn`; `findIncomeSource`; `findById` bawa jenis kategori |
| `models/transactionModel.js` | Simpan kolom baru; helper cari/update/hapus transaksi otomatis per budget |
| `services/budgetService.js` | Hitung `progress`; buat/sinkron/hapus transaksi otomatis |
| `services/transactionService.js` | Validasi sumber pemasukan; blokir edit/hapus transaksi `is_auto` |
| `validations/transactionValidation.js` | `income_budget_id` nullable |

**Frontend (`frontend/src/`):**
| File | Isi perubahan |
|------|---------------|
| `views/Budgets.vue` | Progress bar + label "Terpakai/Sisa X%" |
| `views/Transactions.vue` | Dropdown sumber pemasukan; badge "dari ..." ; badge "otomatis dari budget"; sembunyikan tombol edit/hapus utk otomatis |
