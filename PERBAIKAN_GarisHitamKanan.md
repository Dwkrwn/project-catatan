# Perbaikan Garis Hitam di Samping Kanan Layar

> Dokumen ini menjelaskan diagnosa dan perubahan yang dilakukan untuk
> memperbaiki keluhan **garis hitam vertikal di sisi kanan layar** pada
> aplikasi **Catatan Keuangan Pribadi** (folder `frontend`).
>
> Dokumen terkait: [`RIWAYAT_Perbaikan.md`](./RIWAYAT_Perbaikan.md),
> [`DIAGNOSA_LayarPutih.md`](./DIAGNOSA_LayarPutih.md)

---

## 1. Informasi Sesi

| Item | Keterangan |
|------|------------|
| Tanggal | Senin, 24 Agustus 2026 |
| Keluhan | Garis/strip hitam vertikal di samping kanan layar |
| Status | ✅ Diperbaiki otomatis & diverifikasi dengan `npm run build` |

---

## 2. Akar Masalah

Penyebab utamanya adalah **sisa CSS template bawaan Vite** yang masih ada di
`src/style.css` dan tetap dimuat oleh `src/main.js`. Ada tiga rule yang
bertabrakan dengan desain aplikasi:

### 2.1 Pembatasan lebar `#app` + garis tepi (`style.css` lama, baris 159–169)

```css
#app {
  width: 1126px;                           /* ← app "dikurung" selebar 1126px */
  max-width: 100%;
  margin: 0 auto;                          /* ← lalu dicenter di tengah layar */
  text-align: center;
  border-inline: 1px solid var(--border);  /* ← garis 1px di tepi kiri & kanan */
  ...
}
```

Aplikasi sebenarnya didesain full-width (sidebar + konten), tetapi rule ini
memaksa container `#app` hanya selebar **1126px** dan menggambar **garis 1px
di kedua sisinya**.

### 2.2 Mode gelap dari template (`style.css` lama, baris 33–51)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #16171d;        /* ← background body jadi hampir hitam */
    --border: #2e303a;
  }
}
```

Jika OS/browser dalam mode gelap, variabel `--bg` berubah menjadi
`#16171d` (hampir hitam). Warna ini dipakai sebagai background `<body>`.

### 2.3 Mengapa garisnya muncul di kanan saja?

- Di sisi **kiri**: sidebar putih (`position: fixed`, lebar 250px,
  tinggi 100vh) menutupi area kosong tersebut.
- Di sisi **kanan**: area di luar batas 1126px tidak tertutup apa pun,
  sehingga background `<body>` yang gelap (#16171d) terlihat → tampak
  sebagai **strip/garis hitam vertikal di kanan**.
- `App.vue` hanya menimpa `background` milik `#app`; properti `width`,
  `margin: 0 auto`, dan `border-inline` dari template tetap aktif.

---

## 3. Perubahan yang Dilakukan

### 3.1 `frontend/src/style.css` — ditulis ulang ✏️

Seluruh isi (296 baris CSS template Vite: variabel dark mode, `.hero`,
`.counter`, `#next-steps`, `#docs`, `#spacer`, dll.) diganti dengan style
global minimal:

```css
/* Style global minimal.
   Reset lengkap, font Inter, dan styling scrollbar ada di src/assets/styles.css */

:root {
  color-scheme: light;
}

html,
body {
  margin: 0;
  width: 100%;
}
```

Alasan per baris:

| Baris baru | Fungsi |
|------------|--------|
| `color-scheme: light` | Memaksa UI browser (scrollbar, dsb.) selalu mode terang, sesuai desain aplikasi yang light-only. Mencegah scrollbar/garis samping berubah gelap saat OS dark mode. |
| `html, body { margin: 0 }` | Pengaman ganda agar tidak ada margin default (reset utama sudah ada di `assets/styles.css`). |
| `width: 100%` | Memastikan halaman selalu memenuhi lebar viewport. |

Styling aplikasi yang asli **tidak hilang**, karena semua kebutuhan visual
sudah ditangani oleh `assets/styles.css` (font Inter, reset, scrollbar hijau)
dan style scoped di masing-masing komponen Vue.

### 3.2 `frontend/index.html` — perbaikan typo domain font ✏️

```diff
- <link rel="preconnect" href="https://fonts.googlepis.com" />
+ <link rel="preconnect" href="https://fonts.googleapis.com" />
```

Domain `fonts.googlepis.com` salah ketik (kurang huruf "a"), sehingga
*preconnect* menuju Google Fonts gagal diam-diam dan font Inter termuat
lebih lambat. Link stylesheet utama (baris 10) sudah benar sejak awal,
jadi ini perbaikan performa pelengkap.

### 3.3 Penghapusan dead code 🗑️

Empat file demo bawaan template Vite yang **tidak pernah di-import**
(dieverifikasi dengan pencarian referensi di seluruh `src/`):

| File dihapus | Alasan |
|--------------|--------|
| `src/components/HelloWorld.vue` | Komponen demo template; satu-satunya pemakai class `hero`/`counter`/`ticks`. Tidak dirujuk siapa pun. |
| `src/assets/vue.svg` | Hanya direferensikan oleh `HelloWorld.vue` |
| `src/assets/vite.svg` | Hanya direferensikan oleh `HelloWorld.vue` (favicon memakai `/vite.svg` dari folder `public/`, bukan file ini) |
| `src/assets/hero.png` | Hanya direferensikan oleh `HelloWorld.vue` |

---

## 4. Verifikasi

Hasil `npm run build` setelah perubahan:

```
✓ 1835 modules transformed.
dist/index.html                   0.74 kB │ gzip:  0.40 kB
dist/assets/index-DOQkS_Oe.css   21.99 kB │ gzip:  3.52 kB
dist/assets/index-CJSSxqez.js   189.07 kB │ gzip: 67.57 kB
✓ built in 23.83s
```

- Build **sukses tanpa error** — memastikan tidak ada modul yang kehilangan
  dependensi setelah penghapusan file.
- Ukuran CSS bundle turun **25.99 kB → 21.99 kB** (~15% lebih kecil) karena
  CSS template yang tak terpakai ikut terbuang.

## 5. Checklist Uji Manual (untuk pemilik proyek)

Jalankan `npm run dev`, lalu pastikan:

- [ ] Tidak ada lagi garis/strip hitam di sisi kanan layar
- [ ] Aplikasi memenuhi lebar layar penuh (tidak "mengambang" di tengah)
- [ ] Tampilan tetap normal meskipun OS/browser di-set dark mode
- [ ] Sidebar, navbar, dan konten tidak bergeser dari posisinya
- [ ] Halaman Login/Register/Dashboard/Transaksi/Kategori/Budget tampil baik

---

*Dokumen dibuat otomatis dari hasil sesi perbaikan — diterapkan otomatis dan diverifikasi dengan build.*
