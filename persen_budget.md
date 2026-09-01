# Fitur Budget Pemasukan: Transaksi Otomatis + Saldo Dashboard

> Penjelasan perubahan fitur dengan logika manusia (bahasa sederhana, mudah dipahami).
> Ini adalah **pembaruan lanjutan** dari fitur di `fitur_budget.md`.

---

## Analogi Sederhana: "Isi Kantong = Pencatatan Otomatis"

Bayangkan Anda tidak hanya **membuat rencana** kantong uang, tapi saat membuat rencana itu,
sistem **langsung mencatatkan uangnya masuk ke dalam catatan keuangan**.

- Sebelumnya: Membuat budget pemasukan **Uang Saku 1.000.000** hanya membuat "rencana".
- Sekarang: Membuat budget tersebut **otomatis mencatat transaksi pemasukan 1.000.000**
  di halaman Transaksi, sehingga **saldo Dashboard langsung bertambah**.

---

## 1. Apa yang Berubah?

### a) Budget Pemasukan → Langsung Jadi Transaksi Pemasukan

Saat Anda membuat budget berjenis **pemasukan** (mis. Uang Saku Rp 1.000.000):
- Sistem otomatis membuat **satu transaksi pemasukan** (tipe `income`) dengan:
  - Kategori: sama dengan kategori budget (Uang Saku)
  - Nominal: sama dengan budget
  - Tanggal: **tanggal 1** pada bulan/tahun budget
  - Deskripsi: "Pemasukan otomatis dari budget"
- Karena ini transaksi pemasukan sungguhan, **saldo (balance) di Dashboard otomatis bertambah**.

### b) Transaksi Otomatis Terikat Erat dengan Budget

Transaksi otomatis ini **bukan transaksi biasa**:
- **Ubah nominal budget** → nominal transaksi otomatis ikut berubah.
- **Hapus budget** → transaksi otomatis ikut terhapus (tidak jadi data menggantung).
- **Tidak bisa diedit/dihapus manual** dari halaman Transaksi (dilindungi agar tidak kacau).

Untuk itu ditambahkan dua kolom baru di tabel transaksi untuk "menandai" transaksi otomatis.

---

## 2. Kolom Baru di Database

Ada **dua kolom baru** di tabel `tb_transactions`:

| Kolom | Tipe | Fungsi |
|-------|------|--------|
| `is_auto` | `BOOLEAN` | Menandai transaksi **otomatis dari budget** (`TRUE` = otomatis, `FALSE` = manual) |
| `source_budget_id` | `INTEGER` | Menyimpan **id budget** asal transaksi, agar transaksi bisa ikut berubah/hapus saat budget diubah/hapus |

> ⚠️ Kolom ini perlu ditambahkan ke database yang **sudah ada** secara manual (tabel baru).
> Lihat bagian **Cara Migrasi** di bawah.

---

## 3. Logika di Belakang (Backend)

### a) Membuat Budget Pemasukan (`addBudget`)
1. Simpan budget ke database.
2. Cek jenis kategori budget (income/expense).
3. Jika **income**, buat transaksi pemasukan otomatis di **tanggal 1** bulan tersebut
   (dalam satu transaksi database, agar kalau gagal tidak ada data setengah jadi).

### b) Mengubah Budget Pemasukan (`updateBudget`)
- Jika nominal/bulan/tahun budget berubah, transaksi otomatis terkait **ikut diperbarui**
  (nominal dan tanggalnya).

### c) Menghapus Budget Pemasukan (`deleteBudget`)
- Transaksi otomatis terkait **ikut dihapus** terlebih dahulu, supaya tidak ada
  transaksi yatim yang menunjuk ke budget yang sudah tidak ada.

### d) Melindungi Transaksi Otomatis (`transactionService`)
- Saat user mencoba **edit** transaksi yang `is_auto = TRUE` → ditolak.
- Saat user mencoba **hapus** transaksi yang `is_auto = TRUE` → ditolak.
- Sarannya: ubah/hapus lewat **halaman Budget**, bukan halaman Transaksi.

---

## 4. Tampilan Depan (Frontend)

### a) Halaman Transaksi
- Transaksi pemasukan otomatis muncul seperti transaksi biasa (**+ Rp 1.000.000**).
- Ditandai **badge biru "otomatis dari budget"** agar tidak bingung dengan transaksi manual.
- Tombol edit & hapus **disembunyikan** untuk transaksi otomatis.

### b) Halaman Dashboard
- Saldo (balance) otomatis bertambah karena transaksi pemasukan terhitung.
- Total pemasukan bulan tersebut ikut naik.

### c) Halaman Budget
- Tidak ada perubahan tampilan signifikan; budget pemasukan tetap menampilkan persen sisa.

---

## 5. Contoh Alur Nyata

1. Anda membuat budget pemasukan **Uang Saku = 1.000.000** untuk bulan ini.
2. Sistem otomatis mencatat transaksi: **+ Rp 1.000.000** (Pemasukan, kategori Uang Saku, tanggal 1).
3. Dashboard:
   - Saldo bertambah Rp 1.000.000.
   - Total Pemasukan bulan ini naik Rp 1.000.000.
4. Jika Anda ubah budget Uang Saku jadi **2.000.000**:
   - Transaksi otomatis ikut berubah menjadi **+ Rp 2.000.000**.
5. Jika Anda hapus budget Uang Saku:
   - Transaksi otomatisnya ikut terhapus, saldo kembali turun Rp 1.000.000.
6. Anda **tidak bisa** menyentuh transaksi otomatis itu dari halaman Transaksi
   (tidak ada tombol edit/hapus).

---

## 6. Cara Migrasi Database (WAJIB Dilakukan Manual)

Jika database **sudah ada** dan ingin memakai fitur ini, jalankan di **pgAdmin > Query Tool**:

```sql
ALTER TABLE tb_transactions ADD COLUMN IF NOT EXISTS
    is_auto BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE tb_transactions ADD COLUMN IF NOT EXISTS
    source_budget_id INTEGER REFERENCES tb_budgets(id) ON DELETE SET NULL;
```

Tanpa ini, fitur akan error karena kolom belum ada.

---

## 7. File yang Diubah

**Backend:**
| File | Perubahan |
|------|-----------|
| `backend/db/schema.sql` | Tambah kolom `is_auto` & `source_budget_id` (untuk setup DB dari nol) |
| `backend/src/models/transactionModel.js` | Dukung kolom `is_auto` & `source_budget_id`; helper cari/update/hapus transaksi otomatis per budget |
| `backend/src/models/budgetModel.js` | `findById` ikut mengembalikan jenis kategori |
| `backend/src/services/budgetService.js` | Buat transaksi pemasukan otomatis saat buat budget; sinkron saat update; hapus saat hapus budget |
| `backend/src/services/transactionService.js` | Blokir edit/hapus transaksi otomatis `is_auto` |

**Frontend:**
| File | Perubahan |
|------|-----------|
| `frontend/src/views/Transactions.vue` | Badge "otomatis dari budget" + sembunyikan tombol edit/hapus untuk transaksi otomatis |

---

## 8. Ringkasan Logika

- **Budget pemasukan** kini "hidup": dibuat → langsung jadi transaksi pemasukan, saldo naik.
- **Terikat erat**: ubah budget → transaksi ikut berubah; hapus budget → transaksi ikut hilang.
- **Aman**: transaksi otomatis tidak bisa diedit/dihapus manual, jadi datanya selalu konsisten dengan budget.
- Kolom `income_budget_id` (dari fitur sebelumnya) **tetap** dipakai untuk transaksi pengeluaran
  dan penghitungan "diambil dari pemasukan"; kolom baru `source_budget_id` khusus menandai
  transaksi pemasukan otomatis dari budget.
