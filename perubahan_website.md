# Perubahan Website CatatanKeu

> Dokumen ini merangkum **semua fitur dan perubahan** yang sudah dikerjakan di website
> **Website CatatanKeu**, yang bertujuan untuk pencatatan keuangan pribadi
> dengan konsep **kantong uang (budget)**.

---

## Daftar Isi

1. [Ringkasan Fitur](#ringkasan-fitur)
2. [Analogi Sederhana](#analogi-sederhana)
3. [Fitur 1: Persentase Budget + Sumber Pemasukan](#fitur-1-persentase-budget--sumber-pemasukan)
4. [Fitur 2: Budget Pemasukan → Transaksi Otomatis + Saldo Dashboard](#fitur-2-budget-pemasukan--transaksi-otomatis--saldo-dashboard)
5. [Perbedaan Dua Kolom Penting](#perbedaan-dua-kolom-penting)
6. [Ringkasan Perilaku Sistem](#ringkasan-perilaku-sistem)
7. [Cara Migrasi Database](#cara-migrasi-database)
8. [File yang Diubah](#file-yang-diubah)

---

## Ringkasan Fitur

Dua fitur utama yang ditambahkan ke website:

1. **Fitur 1 — Persentase & Sumber Pemasukan (Budget)** — Menampilkan persentase pada tiap budget dan memungkinkan pengeluaran ditandai "diambil dari" budget pemasukan mana.
2. **Fitur 2 — Budget Pemasukan Membuat Transaksi Otomatis + Saldo Dashboard** — Membuat budget pemasukan langsung mencatat transaksi pemasukan otomatis sehingga saldo Dashboard bertambah.

Kedua fitur saling berkaitan dan keduanya harus ada agar perilaku website konsisten.

---

## Analogi Sederhana

Anggap aplikasi ini seperti **buku catatan keuangan** yang punya beberapa **kantong uang** (budget). Fitur ini menambahkan dua kemampuan:

1. **Menghitung berapa persen kantong yang sudah terpakai / tersisa.**
2. **Mencatat pengeluaran diambil dari kantong pemasukan mana.**

---

## Fitur 1: Persentase Budget + Sumber Pemasukan

### Konsep

Setiap budget (kantong uang) kini menampilkan **persentase**, dan pengeluaran bisa ditandai "diambil dari" budget pemasukan mana.

### Database

Ditambah kolom `income_budget_id` di tabel transaksi (nullable). Kolom ini menyimpan **"uang ini diambil dari budget pemasukan mana"**:

```sql
ALTER TABLE tb_transactions ADD COLUMN IF NOT EXISTS
    income_budget_id INTEGER REFERENCES tb_budgets(id) ON DELETE SET NULL;
```

- Transaksi lama → kolomnya kosong (`NULL`), karena memang tidak diketahui sumbernya. Tidak ada data yang rusak.

### Logika Perhitungan

#### a) Budget Pengeluaran (mis. Bensin)
- `spent` = jumlah semua transaksi **expense** dengan kategori tersebut pada bulan/tahun budget.
- `progress` = `spent ÷ amount × 100` → **persen terpakai** (naik saat belanja).

| Rumus | Contoh |
|-------|--------|
| `jumlah transaksi ÷ budget × 100` | Transaksi 50rb dari 500rb → **10%** (naik saat belanja) |

#### b) Budget Pemasukan (mis. Uang Jajan)
- `drawn` = jumlah semua transaksi yang `income_budget_id`-nya menunjuk ke budget ini.
- `remaining` = `amount − drawn`.
- `progress` = `remaining ÷ amount × 100` → **persen sisa** (turun saat diambil).

| Rumus | Contoh |
|-------|--------|
| `(budget − yang diambil) ÷ budget × 100` | Diambil 50rb dari 1jt → **95%** (turun saat diambil) |

### Validasi Sumber Pemasukan

Saat user memilih "diambil dari pemasukan", sistem memastikan:
- Budget tersebut berjenis **pemasukan**.
- Budget **milik user** yang sedang login.
- Bulan/tahun budget **cocok** dengan bulan/tahun tanggal transaksi (tidak bisa ambil jatah Januari untuk transaksi Maret).

Jika tidak cocok, sistem menolak dengan pesan yang jelas.

### UI

#### Halaman Transaksi
- Saat menambah transaksi **pengeluaran**, muncul pilihan **"Diambil dari Pemasukan (opsional)"**.
- Pilihannya adalah kantong-kantong pemasukan pada bulan/tahun transaksi, lengkap dengan **sisa uangnya**.
- Boleh dikosongkan (artinya tidak mengurangi kantong mana pun).
- Kolom otomatis hilang saat tipe bukan pengeluaran.
- Ada **badge kecil "dari Uang Jajan"** pada baris transaksi agar sumbernya terlihat.

#### Halaman Budget
- Di bawah jumlah tiap kartu budget kini ada **garis progress** yang terisi sesuai persentase:
  - **Pengeluaran** → merah, teks **"Terpakai 10%"** + "Rp 50.000 / Rp 500.000"
  - **Pemasukan** → hijau, teks **"Sisa 95%"** + "Rp 950.000 / Rp 1.000.000"

### Contoh Alur Nyata

1. Budget **Bensin = 500.000**, budget **Uang Jajan = 1.000.000**.
2. Catat transaksi: *Pengeluaran Bensin 50.000*, pilih sumber **Uang Jajan**.
3. Halaman Budget menampilkan:
   - **Bensin:** Terpakai **10%** (bar merah)
   - **Uang Jajan:** Sisa **95%** (bar hijau)

---

## Fitur 2: Budget Pemasukan → Transaksi Otomatis + Saldo Dashboard

### Konsep

Membuat budget **pemasukan** tidak hanya membuat rencana, tapi **langsung mencatat transaksi pemasukan** sehingga **saldo Dashboard bertambah**.

### Database

Ditambah dua kolom baru di tabel transaksi:

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

### Logika Backend

#### a) Buat Budget Pemasukan (`addBudget`)
1. Simpan budget.
2. Jika kategori berjenis **income**, buat transaksi pemasukan otomatis di **tanggal 1** bulan budget (kategori & nominal sama, `is_auto = TRUE`, `source_budget_id = id budget`).
3. Lakukan dalam **satu transaksi database** (commit/rollback) agar tidak ada data setengah jadi.

#### b) Ubah Budget Pemasukan (`updateBudget`)
Jika nominal/bulan/tahun berubah, transaksi otomatis terkait ikut diperbarui (nominal & tanggal).

#### c) Hapus Budget Pemasukan (`deleteBudget`)
Transaksi otomatis terkait ikut dihapus terlebih dahulu.

#### d) Proteksi Transaksi Otomatis
Edit/hapus transaksi dengan `is_auto = TRUE` **ditolak** oleh API. Sarannya: ubah/hapus lewat halaman Budget.

### UI

#### Halaman Transaksi
- Transaksi pemasukan otomatis tampil seperti biasa (`+ Rp x`), diberi **badge "otomatis dari budget"**, dan tombol edit/hapus **disembunyikan**.

#### Halaman Dashboard
- Saldo (lifetime) otomatis bertambah karena transaksi pemasukan terhitung.

#### Halaman Budget
- Tampilan tidak berubah signifikan.

---

## Perbedaan Dua Kolom Penting

Ada **dua kolom** berbeda yang jangan sampai tertukar:

| Kolom | Dipakai untuk | Contoh |
|-------|---------------|--------|
| `income_budget_id` | Pengeluaran menunjuk **sumber pemasukan** (transaksi `expense`) | Pengeluaran Bensin diambil dari Uang Jajan |
| `source_budget_id` | Transaksi **pemasukan otomatis** dari budget (transaksi `income`) | Budget Uang Jajan → transaksi +Rp 1jt |

- `income_budget_id` → dipakai hitung `drawn` (berapa yang sudah diambil dari kantong pemasukan).
- `source_budget_id` → dipakai menautkan transaksi otomatis ke budget asalnya, agar sinkron saat budget diubah/dihapus.
- Transaksi otomatis (`is_auto = TRUE`) **tidak boleh** menaruh `income_budget_id`, supaya tidak salah masuk ke hitungan `drawn`.

---

## Ringkasan Perilaku Sistem

1. ⚠️ Buat budget pemasukan → otomatis buat transaksi pemasukan (`is_auto=TRUE`, `source_budget_id`, tanggal 1 bulan tersebut), saldo bertambah.
2. ⚠️ Ubah nominal budget pemasukan → transaksi otomatis ikut berubah.
3. ⚠️ Hapus budget pemasukan → transaksi otomatis ikut terhapus.
4. ⚠️ Transaksi otomatis tidak bisa diedit/dihapus manual.
5. ✅ Budget pengeluaran → persen **terpakai** (naik); budget pemasukan → persen **sisa** (turun).
6. ✅ Pengeluaran bisa menunjuk sumber pemasukan (`income_budget_id`), dengan validasi bulan/tahun & kepemilikan.
7. ✅ Saldo Dashboard = `SUM(income) − SUM(expense)` (lifetime), sehingga transaksi otomatis ikut menambah saldo.

---

## Cara Migrasi Database

Karena kolom-kolom baru perlu ada di database, jalankan perintah SQL berikut di **pgAdmin > Query Tool**:

```sql
-- Kolom sumber pemasukan untuk pengeluaran (Fitur 1)
ALTER TABLE tb_transactions ADD COLUMN IF NOT EXISTS
    income_budget_id INTEGER REFERENCES tb_budgets(id) ON DELETE SET NULL;

-- Kolom penanda transaksi otomatis (Fitur 2)
ALTER TABLE tb_transactions ADD COLUMN IF NOT EXISTS
    is_auto BOOLEAN NOT NULL DEFAULT FALSE;

-- Kolom sumber budget untuk transaksi otomatis (Fitur 2)
ALTER TABLE tb_transactions ADD COLUMN IF NOT EXISTS
    source_budget_id INTEGER REFERENCES tb_budgets(id) ON DELETE SET NULL;
```

Tanpa menjalankan migrasi ini, fitur akan error karena sistem tidak menemukan kolom yang diperlukan.

---

## File yang Diubah

### Backend (`backend/src/`)

| File | Perubahan |
|------|-----------|
| `db/schema.sql` | Kolom `income_budget_id`, `is_auto`, `source_budget_id` (untuk setup DB dari nol) |
| `models/budgetModel.js` | Hitung `spent`, `drawn`; helper `findIncomeSource`; `findById` bawa jenis kategori |
| `models/transactionModel.js` | Simpan kolom baru; helper cari/update/hapus transaksi otomatis per budget |
| `services/budgetService.js` | Hitung `progress`; buat/sinkron/hapus transaksi otomatis |
| `services/transactionService.js` | Validasi sumber pemasukan; blokir edit/hapus transaksi `is_auto` |
| `validations/transactionValidation.js` | Tambah `income_budget_id` (nullable) |

### Frontend (`frontend/src/`)

| File | Perubahan |
|------|-----------|
| `views/Budgets.vue` | Progress bar + label "Terpakai/Sisa X%" |
| `views/Transactions.vue` | Dropdown "Diambil dari Pemasukan" + badge sumber; badge "otomatis dari budget"; sembunyikan tombol edit/hapus untuk transaksi otomatis |

---

## Ringkasan Logika

- **Pengeluaran** → persen naik (artinya budget makin terpakai).
- **Pemasukan** → persen turun (artinya sisa makin berkurang saat diambil sebagai sumber).
- **Relasi** keduanya lewat pilihan **"Diambil dari Pemasukan"** saat mencatat transaksi pengeluaran.
- **Transaksi otomatis** dibuat langsung saat budget pemasukan dibuat, dan terus sinkron saat budget diubah/dihapus.
