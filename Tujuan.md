🎯 TUJUAN UTAMA PROYEK
Membangun Sistem Aplikasi Catatan Keuangan Pribadi Multi-Platform (Full-Stack).

Target Akhir: Pengguna dapat mencatat pemasukan & pengeluaran, melihat ringkasan saldo, serta mengelola anggaran, baik melalui Web (Vue.js) maupun Mobile (Flutter) dengan data yang tersinkronisasi secara real-time melalui REST API (Express.js) dan Database (PostgreSQL).

🗺️ RANGKUMAN ROADMAP: TAHAP 2 HINGGA TAHAP 4
Plaintext
[ ✅ TAHAP 1: DATABASE ] ---> [ 🟡 TAHAP 2: BACKEND API ] ---> [ ⚪ TAHAP 3: FRONTEND WEB ] ---> [ ⚪ TAHAP 4: MOBILE APP ]
  (PostgreSQL)                   (Express.js & Node)             (Vue.js 3 & Pinia)             (Flutter & Dart)
  Status: SELESAI                Status: BERJALAN                Status: AKAN DATANG            Status: AKAN DATANG
🟢 TAHAP 2: Backend & REST API (Express.js + Node.js)
Ibarat Rumah: Tahap ini adalah membuat Pipa, Otak, dan Sistem Keamanan rumah.

📌 Tujuan Utama:
Menyediakan layanan server (API) yang aman dan siap diakses oleh frontend Web maupun Mobile untuk memproses data dari/ke database PostgreSQL.

🎯 Hasil Akhir Tahap 2 (Deliverables):
Sistem Autentikasi (JWT & Bcrypt):

Endpoint Login & Register.

Mengamankan password dengan enkripsi (hashing).

Menghasilkan token rahasia (JWT) untuk memverifikasi hak akses pengguna.

Endpoint Management (CRUD):

Transaksi: Tambah, Lihat, Edit, Hapus catatan keuangan.

Kategori: Mengambil daftar kategori bawaan/kustom.

Endpoint Analitik Keuangan:

Menghitung kalkulasi total saldo, total pemasukan, dan total pengeluaran bulanan menggunakan query database.

🟢 TAHAP 3: Web Frontend (Vue.js 3 + Pinia + Axios)
Ibarat Rumah: Tahap ini adalah membangun Tampilan Rumah Versi Desktop/Laptop.

📌 Tujuan Utama:
Membangun antarmuka web yang cepat, responsif, dan interaktif agar pengguna bisa mengelola keuangan mereka lewat browser PC/Laptop.

🎯 Hasil Akhir Tahap 3 (Deliverables):
Sistem Login & State Management:

Halaman Login & Register terintegrasi dengan backend.

Menyimpan token JWT secara aman di browser dan mengelola state data global dengan Pinia.

Dashboard Keuangan Web:

Tampilan visual ringkasan saldo dan grafik pengeluaran (misal: Pie Chart kategori).

Manajemen Transaksi:

Tabel daftar riwayat transaksi lengkap dengan fitur pencarian/filter.

Form modal/dialog untuk tambah dan edit transaksi.

🟢 TAHAP 4: Mobile App (Flutter + Provider/Bloc)
Ibarat Rumah: Tahap ini adalah membuat Tampilan Rumah Versi Portabel (HP).

📌 Tujuan Utama:
Membuat aplikasi Android/iOS menggunakan Flutter yang mengonsumsi REST API yang sama dengan Web, sehingga pengguna bisa mencatat keuangan secara praktis di ponsel.

🎯 Hasil Akhir Tahap 4 (Deliverables):
Penguasaan Struktur Flutter:

Memahami penggunaan Widget layout (Column, Row, ListView.builder, Card).

Menguasai State Management dan HTTP Request (menggunakan paket http atau dio).

Penyimpanan Token & Keamanan Mobile:

Menyimpan JWT Token di penyimpanan lokal HP (flutter_secure_storage).

UI Mobile Keuangan:

Halaman Splash Screen / Login.

Dashboard ringkasan saldo berbasis kartu.

Bottom sheet / Form input transaksi yang nyaman digunakan di layar HP.

💡 MENGAPA URUTAN INI DIPILIH?
Efisiensi Kerja: Kamu cukup membuat logika bisnis dan database 1 KALI di backend (Tahap 2).

Mudah Diuji: Backend bisa diuji independen terlebih dahulu (menggunakan Postman/Thunder Client) tanpa harus menunggu UI selesai.

Konsistensi Data: Web (Tahap 3) dan Mobile (Tahap 4) hanya bertugas menampilkan data (presentation layer), sehingga tidak ada duplikasi logika di sisi frontend.

Apakah rangkuman struktur ini sudah cukup jelas? Jika sudah paham, kita bisa langsung eksekusi Tahap 2 (Langkah 2.1: Autentikasi User)!