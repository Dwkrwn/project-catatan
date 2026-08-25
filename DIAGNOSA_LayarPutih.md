# Diagnosa: Layar Putih Saat Menjalankan Frontend

> **Dokumen ini hanya panduan. Tidak ada kode yang diubah secara otomatis.
> Silakan ikuti langkah-langkah di bawah dan perbaiki kode Anda sendiri.**

---

## Ringkasan Masalah

Saat `npm run dev` dijalankan, browser hanya menampilkan **layar putih**.
Ini terjadi karena aplikasi Vue **gagal melakukan mount** akibat beberapa error
pada kode. Ditemukan **3 penyebab fatal** dan **3 bug tambahan**.

| No | File | Masalah | Tingkat |
|----|------|---------|---------|
| 1 | `src/main.js` | `router` dipakai tanpa di-import | 🔴 Fatal |
| 2 | `src/App.vue` | Typo `<router-viuw>` | 🔴 Fatal |
| 3 | `src/stores/auth.js` | Import kode backend ke frontend | 🔴 Fatal |
| 4 | `src/router/index.js` | Route `/login` memakai komponen `Register` | 🟡 Bug |
| 5 | `src/router/index.js` | `Budgets` di-import dari `Categories.vue` | 🟡 Bug |
| 6 | `src/router/index.js` | Logika navigation guard terbalik | 🟡 Bug |

---

## Langkah 1 — Perbaiki `src/main.js` (Penyebab Utama)

### Masalah

File saat ini:

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import './assets/styles.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)        // ❌ ERROR: "router is not defined"

app.mount('#app')
```

`router` dipanggil di baris 10, tetapi **tidak pernah di-import**.
JavaScript langsung berhenti dengan error `ReferenceError`, sehingga
`app.mount('#app')` tidak pernah dieksekusi → `div#app` tetap kosong →
**layar putih**.

### Cara Memperbaiki

Tambahkan import router di bagian atas file:

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import './assets/styles.css'
import router from './router'      // ✅ tambahkan baris ini

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

### Verifikasi

Buka DevTools browser (F12) → tab Console.
Sebelum diperbaiki akan muncul: `Uncaught ReferenceError: router is not defined`.

---

## Langkah 2 — Perbaiki `src/App.vue`

### Masalah

```html
<template>
  <div id="app"><router-viuw></router-viuw></div>
</template>
```

Ada typo: `router-viuw`. Vue tidak mengenal komponen bernama itu, jadi
**tidak ada apa pun yang dirender** walaupun aplikasi berhasil mount.

### Cara Memperbaiki

Ganti dengan komponen bawaan vue-router:

```html
<template>
  <div id="app">
    <RouterView />
  </div>
</template>
```

> Catatan: `<div id="app">` di dalam template sebenarnya redundan karena
> `index.html` sudah punya `<div id="app">` sebagai titik mount.
> Boleh disederhanakan menjadi hanya `<RouterView />`.

---

## Langkah 3 — Hapus Import Backend di `src/stores/auth.js`

### Masalah

Baris paling atas file:

```js
import { register } from "../../../backend/controllers/authController"; // ❌ hapus
```

Kode backend (Node.js/Express) tidak bisa dijalankan di browser.
Vite akan mencoba mem-bundle `authController.js` beserta dependensinya
(`express`, modul database, dll) → gagal resolve → halaman putih/error.

Import ini juga **tidak terpakai**, karena action `register` sudah
menggunakan `api.post("/api/auth/register", ...)`.

### Cara Memperbaiki

Hapus baris tersebut. Bagian atas file menjadi:

```js
import { defineStore } from "pinia";
import api from "../services/api";

export const userAuthStore = defineStore("Auth", {
  // ... sisanya tetap sama
});
```

---

## Langkah 4 — Perbaiki Komponen pada Route (`src/router/index.js`)

### Masalah A — Route `/login` memakai komponen yang salah

```js
{
  path: "/login",
  name: "Login",
  component: Register,   // ❌ harusnya Login
  ...
}
```

Halaman login akan menampilkan form registrasi.

**Perbaikan:** ganti `component: Register` menjadi `component: Login`.

### Masalah B — `Budgets` di-import dari file yang salah

```js
import Budgets from "../views/Categories.vue"; // ❌ salah file
```

**Perbaikan:**

```js
import Budgets from "../views/Budgets.vue";    // ✅
```

Bagian import yang benar setelah diperbaiki:

```js
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Dashboard from "../views/Dashboard.vue";
import Transactions from "../views/Transactions.vue";
import Categories from "../views/Categories.vue";
import Budgets from "../views/Budgets.vue";
```

---

## Langkah 5 — Perbaiki Navigation Guard (`src/router/index.js`)

### Masalah

Guard saat ini:

```js
router.beforeEach((to, from, next) => {
  const authStore = userAuthStore();

  if (to.meta.requiresGuest && !authStore.isLoggedIn) {
    next("/login");   // ❌ logika terbalik
  } else if (to.meta.requiresGuest && authStore.isLoggedIn) {
    next("/");
  } else {
    next();
  }
})
```

Dua masalah:

1. **Logika terbalik / infinite loop** — user *belum* login yang membuka
   `/login` justru di-redirect ke `/login` lagi → redirect terus-menerus →
   Vue Router membatalkan navigasi dengan error
   *"Detected an infinite redirection in a navigation guard"*.
2. **`requiresAuth` tidak pernah dicek** — user yang belum login tetap bisa
   membuka Dashboard, Transactions, dll.

### Cara Memperbaiki

```js
router.beforeEach((to, from, next) => {
  const authStore = userAuthStore();

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next("/login");            // belum login → paksa ke login
  } else if (to.meta.requiresGuest && authStore.isLoggedIn) {
    next("/");                 // sudah login → tak perlu lihat login/register
  } else {
    next();                    // selain itu, izinkan
  }
});
```

---

## Langkah 6 — Jalankan dan Uji

1. Pastikan tidak ada proses dev server lama, lalu jalankan:

   ```bash
   cd frontend
   npm run dev
   ```

2. Buka URL yang muncul (misal `http://localhost:5173`).

3. Checklist pengujian:
   - [ ] Tidak ada error merah di tab Console DevTools (F12)
   - [ ] Membuka `/` saat belum login → diarahkan ke `/login`
   - [ ] Halaman `/login` menampilkan **form login** (bukan register)
   - [ ] Halaman `/register` menampilkan form registrasi
   - [ ] Setelah login, diarahkan ke Dashboard
   - [ ] Menu `/budgets` menampilkan halaman Budgets

---

# PERBAIKAN TAHAP 2 — Error Setelah Layar Putih Beres

> Setelah langkah 1–6 diterapkan, muncul error baru saat `npm run dev`.
> Dua perbaikan berikut sudah **diterapkan otomatis** dan diverifikasi
> dengan `npm run build` (hasil: ✓ built sukses).

## Langkah 7 — Typo Nama File Store Transactions ✅ (sudah diterapkan)

### Error yang Muncul

```
[plugin:vite:import-analysis] Failed to resolve import "../stores/transactions"
from "src/views/Dashboard.vue". Does the file exist?
```

### Penyebab

Nama file store salah ketik: **`src/stores/trasnsactions.js`**
(seharusnya `transactions.js`). Akibatnya:

| File | Import | Hasil |
|------|--------|-------|
| `Dashboard.vue` | `"../stores/transactions"` (ejaan benar) | ❌ File tidak ada → error |
| `Transactions.vue` | `'../stores/trasnsactions'` (ikut typo) | ✅ Ketemu, tapi typo |

### Perbaikan yang Dilakukan

1. Rename file:
   - Sebelum: `src/stores/trasnsactions.js`
   - Sesudah: `src/stores/transactions.js`

2. Import di `src/views/Transactions.vue` disamakan menjadi
   `'../stores/transactions'` (di sesi ini ternyata sudah benar).

3. `Dashboard.vue` tidak diubah karena import-nya sudah benar.

> Pelajaran: nama export (`useTransactionStore`) boleh apa pun, tetapi
> **path import harus sama persis dengan nama file** — termasuk huruf.

---

## Langkah 8 — Typo Nama Export Store Auth ✅ (sudah diterapkan)

### Error yang Muncul

Setelah Langkah 7, build menyingkap error berikutnya:

```
[MISSING_EXPORT] "useAuthStore" is not exported by "src/stores/auth.js".
  → src/views/Login.vue:18
  → src/views/Register.vue:19
  → src/components/Sidebar.vue:10
  → src/components/Navbar.vue:12
```

### Penyebab

Di `src/stores/auth.js`, store di-export dengan nama yang typo:

```js
export const userAuthStore = defineStore("Auth", { ... }); // ❌ "user"
```

Sedangkan konvensi Pinia adalah `use<Nama>Store`, dan 4 komponen/view
meng-import `useAuthStore`. Hanya `router/index.js` yang ikut menulis
typo `userAuthStore`.

### Perbaikan yang Dilakukan

1. `src/stores/auth.js` — ubah nama export:

   ```js
   // Sebelum
   export const userAuthStore = defineStore("Auth", {
   // Sesudah
   export const useAuthStore = defineStore("Auth", {
   ```

2. `src/router/index.js` — samakan di 2 tempat:

   ```js
   // Baris 2
   import { useAuthStore } from "../stores/auth";

   // Dalam navigation guard (baris 57)
   const authStore = useAuthStore();
   ```

3. `Login.vue`, `Register.vue`, `Sidebar.vue`, `Navbar.vue` tidak diubah —
   penulisan mereka (`useAuthStore`) memang sudah benar sejak awal.

---

## Hasil Verifikasi Akhir

```
npm run build

✓ 1835 modules transformed.
dist/index.html                  0.74 kB
dist/assets/index-X5lAJhyk.css  25.99 kB │ gzip:  4.66 kB
dist/assets/index-C-65fuav.js  189.07 kB │ gzip: 67.57 kB
✓ built in 297ms
```

Semua modul berhasil di-resolve tanpa error. Silakan jalankan kembali
`npm run dev` dan uji dengan checklist pada Langkah 6.

---

## Tips Membaca Error Layar Putih di Masa Depan

Layar putih hampir selalu berarti **error JavaScript saat startup**.
Langkah pertama yang harus dilakukan:

1. Tekan **F12** → buka tab **Console**
2. Baca pesan error paling atas, misalnya:
   - `ReferenceError: X is not defined` → lupa import / variabel typo
   - `Failed to resolve import "..."` → path file salah
   - `Unexpected token` → syntax error
3. Perbaiki sesuai petunjuk error, lalu refresh

---

*Langkah 1–6 diterapkan manual oleh pemilik proyek; Langkah 7–8 (Tahap 2) diterapkan otomatis dan sudah diverifikasi dengan `npm run build`.*
