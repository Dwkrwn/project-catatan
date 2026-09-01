# Fitur Budget: Persentase + Sumber Pemasukan

> Penjelasan perubahan fitur dengan logika manusia (bahasa sederhana, mudah dipahami).

---

## Analogi Sederhana: "Kantong Uang" dan "Catatan Belanja"

Anggap aplikasi ini seperti **buku catatan keuangan** yang punya beberapa **kantong uang** (budget).
Fitur ini menambahkan dua kemampuan:

1. **Menghitung berapa persen kantong yang sudah terpakai / tersisa.**
2. **Mencatat pengeluaran diambil dari kantong pemasukan mana.**

---

## 1. Kolom Baru di Database — "Catatan dari kantong mana"

**Masalah sebelumnya:** Saat mencatat pengeluaran Bensin Rp50rb, sistem hanya tahu "ini pengeluaran Bensin".
Sistem **tidak tahu** uangnya diambil dari kantong **Uang Jajan**.

**Solusi:** Ditambah satu kolom kosong di tabel transaksi bernama `income_budget_id`.
Kolom ini menyimpan **"uang ini diambil dari budget pemasukan mana"**.
- Transaksi lama → kolomnya kosong (`NULL`), karena memang tidak diketahui sumbernya. Tidak ada data yang rusak.

> ⚠️ Kolom ini perlu ditambahkan ke database secara manual. Lihat bagian **Cara Migrasi** di bawah.

---

## 2. Perhitungan di Belakang (Backend)

### a) Menghitung "berapa yang sudah terpakai" (`spent`)
Untuk tiap budget pengeluaran (mis. Bensin), sistem otomatis **menjumlahkan semua transaksi Bensin pada bulan itu**.
Angka ini dipakai untuk menghitung **persen terpakai**.

### b) Menghitung "berapa yang sudah diambil" (`drawn`)
Untuk tiap budget pemasukan (mis. Uang Jajan), sistem **menjumlahkan semua transaksi yang menunjuk ke budget ini** (yang `income_budget_id`-nya = Uang Jajan).
Angka ini dipakai untuk menghitung **persen sisa**.

### c) Menghitung persentase (`progress`)
| Kartu | Rumus | Contoh |
|-------|-------|--------|
| **Pengeluaran (Bensin)** — % Terpakai | `jumlah transaksi ÷ budget × 100` | Transaksi 50rb dari 500rb → **10%** (naik saat belanja) |
| **Pemasukan (Uang Jajan)** — % Sisa | `(budget − yang diambil) ÷ budget × 100` | Diambil 50rb dari 1jt → **95%** (turun saat diambil) |

---

## 3. Validasi — "Memastikan uang diambil dari kantong yang benar"

Ditambah **penjaga** saat user memilih "diambil dari Uang Jajan", yang memastikan:
- Kantong tersebut memang berjenis **pemasukan**.
- Budget itu **milik user** yang sedang login.
- Periode (bulan/tahun) budget **cocok dengan tanggal transaksi** (tidak bisa ambil jatah Januari untuk transaksi Maret).

Jika tidak cocok, sistem menolak dengan pesan yang jelas.

---

## 4. Tampilan Depan (Frontend)

### a) Halaman Transaksi — Dropdown "Diambil dari Pemasukan"
Saat menambah transaksi **pengeluaran**, muncul pilihan **"Diambil dari Pemasukan (opsional)"**.
Pilihannya adalah kantong-kantong pemasukan pada bulan/tahun transaksi, lengkap dengan **sisa uangnya**.
- Boleh dikosongkan (artinya tidak mengurangi kantong mana pun).
- Kolom otomatis hilang saat tipe bukan pengeluaran.
- Ada **badge kecil "dari Uang Jajan"** pada baris transaksi agar sumbernya terlihat.

### b) Halaman Budget — Progress Bar + Persen
Di bawah jumlah tiap kartu budget kini ada:
- **Garis progress** yang terisi sesuai persentase
  - **Pengeluaran** → merah, teks **"Terpakai 10%"** + "Rp 50.000 / Rp 500.000"
  - **Pemasukan** → hijau, teks **"Sisa 95%"** + "Rp 950.000 / Rp 1.000.000"

Jadi sekilas terlihat: kartu merah bocor banyak, kartu hijau masih aman.

---

## 5. Contoh Alur Nyata

1. Budget **Bensin = 500.000**, budget **Uang Jajan = 1.000.000**.
2. Catat transaksi: *Pengeluaran Bensin 50.000*, pilih sumber **Uang Jajan**.
3. Halaman Budget menampilkan:
   - **Bensin:** Terpakai **10%** (bar merah)
   - **Uang Jajan:** Sisa **95%** (bar hijau)

---

## 6. Cara Migrasi Database (WAJIB Dilakukan Manual)

Karena kolom `income_budget_id` perlu ada di database, jalankan di **pgAdmin > Query Tool**:

```sql
ALTER TABLE tb_transactions ADD COLUMN IF NOT EXISTS
    income_budget_id INTEGER REFERENCES tb_budgets(id) ON DELETE SET NULL;
```

Tanpa ini, fitur akan error karena sistem tidak menemukan kolom tersebut.

---

## 7. File yang Diubah

**Backend:**
| File | Perubahan |
|------|-----------|
| `backend/db/schema.sql` | Tambah kolom `income_budget_id` (untuk setup DB dari nol) |
| `backend/src/models/budgetModel.js` | Tambah `spent`, `drawn`, helper `findIncomeSource` |
| `backend/src/services/budgetService.js` | Hitung `progress` per budget |
| `backend/src/validations/transactionValidation.js` | Tambah `income_budget_id` (nullable) |
| `backend/src/models/transactionModel.js` | Simpan `income_budget_id` saat create/update |
| `backend/src/services/transactionService.js` | Validasi sumber pemasukan |

**Frontend:**
| File | Perubahan |
|------|-----------|
| `frontend/src/views/Transactions.vue` | Dropdown "Diambil dari Pemasukan" + badge sumber |
| `frontend/src/views/Budgets.vue` | Progress bar + label "Terpakai/Sisa X%" |

---

## 8. Ringkasan Logika

- **Pengeluaran** → persen naik (artinya budget makin terpakai).
- **Pemasukan** → persen turun (artinya sisa makin berkurang saat diambil sebagai sumber).
- **Relasi** keduanya lewat pilihan **"Diambil dari Pemasukan"** saat mencatat transaksi pengeluaran.
