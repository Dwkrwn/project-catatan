# Riwayat Perbaikan — Frontend Aplikasi Catatan Keuangan

> Dokumen ini adalah catatan lengkap sesi diagnosa & perbaikan yang telah
> dilakukan pada proyek **pencatatan** (folder `frontend`).
> Detail teknis kode sebelum/sesudah dapat dilihat di `DIAGNOSA_LayarPutih.md`.

---

## 1. Informasi Proyek

| Item | Keterangan |
|------|------------|
| Nama proyek | Catatan Keuangan Pribadi |
| Folder | `E:\Learning_project\pencatatan` |
| Frontend | Vue 3 + Vite + Pinia + Vue Router + Axios + lucide-vue-next |
| Backend | Node.js / Express (folder `backend`) |
| Tanggal sesi | Senin, 24 Agustus 2026 |

---

## 2. Masalah Awal

**Keluhan:** Saat program frontend dijalankan dengan `npm run dev`,
browser hanya menampilkan **layar putih** tanpa konten apa pun.

**Proses diagnosa:**
1. Memeriksa struktur folder `frontend/src`
2. Membaca berkas inti: `main.js`, `App.vue`, `router/index.js`,
   `stores/auth.js`, `services/api.js`, dan `index.html`
3. Menelusuri error melalui pesan Vite dan verifikasi dengan `npm run build`

---

## 3. Tahap 1 — Bug Penyebab Layar Putih

Ditemukan **6 bug**: 3 penyebab fatal layar putih + 3 bug perilaku.

| # | Lokasi | Masalah | Tingkat |
|---|--------|---------|---------|
| 1 | `src/main.js:10` | `app.use(router)` dipanggil tanpa pernah meng-import `router` → `ReferenceError` sebelum `app.mount()` | 🔴 Fatal |
| 2 | `src/App.vue:5` | Typo `<router-viuw>` (seharusnya `<RouterView />`) sehingga komponen route tidak dirender | 🔴 Fatal |
| 3 | `src/stores/auth.js:3` | Mengimpor kode backend (`authController.js`) ke bundle frontend — mustahil di-resolve Vite, dan import-nya tidak terpakai | 🔴 Fatal |
| 4 | `src/router/index.js:15` | Route `/login` memakai komponen `Register`, bukan `Login` | 🟡 Perilaku |
| 5 | `src/router/index.js:9` | `Budgets` di-import dari `../views/Categories.vue` | 🟡 Perilaku |
| 6 | `src/router/index.js:56-66` | Navigation guard terbalik: user belum login yang membuka `/login` di-redirect ke `/login` lagi (**infinite loop**), dan meta `requiresAuth` tidak pernah dicek | 🟡 Perilaku |

**Status:** ✅ Semua diperbaiki **manual oleh pemilik proyek**, mengikuti
panduan Langkah 1–6 pada dokumen `DIAGNOSA_LayarPutih.md`.

---

## 4. Tahap 2 — Error Lanjutan Setelah Layar Putih Beres

Setelah Tahap 1 selesai, muncul error baru saat menjalankan dev server.

### 4.1 Error: Gagal Resolve Import Store Transactions

```
[plugin:vite:import-analysis] Failed to resolve import "../stores/transactions"
from "src/views/Dashboard.vue". Does the file exist?
```

- **Penyebab:** nama file store salah ketik —
  `src/stores/trasnsactions.js` (seharusnya `transactions.js`).
  `Dashboard.vue` menulis import dengan ejaan benar sehingga filenya
  "tidak ada", sementara `Transactions.vue` ikut menyalin typo.
- **Perbaikan (otomatis):**
  - Rename `src/stores/trasnsactions.js` → `src/stores/transactions.js`
  - Import di `Transactions.vue` ternyata sudah benar → tidak diubah
  - `Dashboard.vue` sudah benar → tidak diubah

### 4.2 Error: Export Store Auth Tidak Ditemukan

Tersingkap saat verifikasi `npm run build` setelah perbaikan 4.1:

```
[MISSING_EXPORT] "useAuthStore" is not exported by "src/stores/auth.js".
  → src/views/Login.vue:18
  → src/views/Register.vue:19
  → src/components/Sidebar.vue:10
  → src/components/Navbar.vue:12
```

- **Penyebab:** store auth di-export sebagai `userAuthStore` (typo),
  padahal konvensi Pinia adalah `use<Nama>Store`. Empat file memakai
  `useAuthStore` (benar); hanya `router/index.js` yang ikut typo.
- **Perbaikan (otomatis):**
  - `src/stores/auth.js`: `export const userAuthStore` → `export const useAuthStore`
  - `src/router/index.js` baris 2 & 57: `userAuthStore` → `useAuthStore`
  - `Login.vue`, `Register.vue`, `Sidebar.vue`, `Navbar.vue`: tidak diubah
    karena penulisannya sudah benar

---

## 5. Verifikasi Akhir

```
$ npm run build

✓ 1835 modules transformed.
dist/index.html                  0.74 kB │ gzip:  0.40 kB
dist/assets/index-X5lAJhyk.css  25.99 kB │ gzip:  4.66 kB
dist/assets/index-C-65fuav.js  189.07 kB │ gzip: 67.57 kB
✓ built in 297ms
```

Semua modul berhasil di-resolve **tanpa error**.

### Checklist Uji Manual (untuk pemilik proyek)

Jalankan `npm run dev`, lalu pastikan:

- [ ] Tidak ada error merah di Console DevTools (F12)
- [ ] Membuka `/` saat belum login → diarahkan ke `/login`
- [ ] `/login` menampilkan **form login** (bukan register)
- [ ] `/register` menampilkan form registrasi
- [ ] Setelah login → masuk Dashboard
- [ ] Halaman `/budgets` menampilkan halaman Budgets (bukan Categories)

> Jika halaman terbuka tetapi data kosong/error jaringan, pastikan server
> Express di folder `backend` juga sedang berjalan.

---

## 6. Pelajaran & Tips

1. **Layar putih ≈ error JavaScript saat startup.** Langkah pertama:
   tekan F12 → tab Console → baca pesan error paling atas.
   - `ReferenceError: X is not defined` → lupa import / variabel typo
   - `Failed to resolve import "..."` → path/nama file salah
   - `Unexpected token` → syntax error
2. **Path import harus sama persis dengan nama file**, termasuk huruf.
   (`trasnsactions.js` ≠ `transactions.js`)
3. **Ikuti konvensi penamaan Pinia:** composable store selalu
   `use<Nama>Store` agar konsisten di seluruh aplikasi.
4. **Jangan pernah mengimpor kode backend ke kode frontend** —
   keduanya berjalan di lingkungan berbeda (Node.js vs browser).
5. **Verifikasi cepat semua import:** jalankan `npm run build`;
   build akan menampakkan semua error modul sekaligus, bukan satu per satu.

---

## 7. Referensi

- Panduan teknis langkah demi langkah (kode sebelum/sesudah):
  [`DIAGNOSA_LayarPutih.md`](./DIAGNOSA_LayarPutih.md)

---

*Dokumen dibuat otomatis dari hasil sesi diagnosa — Tahap 1 dikerjakan manual oleh pemilik proyek, Tahap 2 diterapkan otomatis dan diverifikasi dengan build.*
