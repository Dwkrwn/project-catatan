/**
 * Application Messages
 * Centralized error dan success messages
 */

const messages = {
  // Auth Messages
  AUTH: {
    REGISTER_SUCCESS: 'Registrasi berhasil',
    LOGIN_SUCCESS: 'Login berhasil',
    INVALID_CREDENTIALS: 'Email atau password salah',
    USER_ALREADY_EXISTS: 'Email atau Username sudah terdaftar',
    TOKEN_NOT_FOUND: 'Akses ditolak, token tidak ditemukan',
    INVALID_TOKEN: 'Token tidak valid',
    TOKEN_EXPIRED: 'Token sudah expired',
    MISSING_EMAIL_PASSWORD: 'Email dan Password wajib diisi',
    MISSING_REGISTRATION_FIELDS: 'Semua field wajib diisi (username, email, password)'
  },

  // Transaction Messages
  TRANSACTION: {
    FETCHED: 'Transaksi berhasil diambil',
    CREATED: 'Transaksi berhasil ditambahkan',
    UPDATED: 'Transaksi berhasil diupdate',
    DELETED: 'Transaksi berhasil dihapus',
    NOT_FOUND: 'Transaksi tidak ditemukan',
    INVALID_TYPE: 'Type harus income atau expense',
    INVALID_DATE: 'Format tanggal tidak valid',
    SUMMARY_FETCHED: 'Summary transaksi berhasil diambil',
    CATEGORY_EXPENSE_FETCHED: 'Pengeluaran per kategori berhasil diambil'
  },

  // Category Messages
  CATEGORY: {
    FETCHED: 'Kategori berhasil diambil',
    CREATED: 'Kategori berhasil ditambahkan',
    DELETED: 'Kategori berhasil dihapus',
    NOT_FOUND: 'Category tidak ditemukan',
    INVALID_TYPE: 'Type kategori tidak valid'
  },

  // Budget Messages
  BUDGET: {
    FETCHED: 'Budget berhasil diambil',
    CREATED: 'Budget berhasil ditambahkan',
    UPDATED: 'Budget berhasil diupdate',
    DELETED: 'Budget berhasil dihapus',
    NOT_FOUND: 'Budget tidak ditemukan',
    ALREADY_EXISTS: 'Budget untuk kategori ini di bulan tersebut sudah ada',
    INVALID_MONTH: 'Month harus antara 1 dan 12',
    INVALID_YEAR: 'Year tidak valid'
  },

  // Generic Messages
  COMMON: {
    SERVER_ERROR: 'Server error',
    INVALID_INPUT: 'Input tidak valid',
    MISSING_REQUIRED_FIELDS: 'Field required tidak lengkap',
    DATABASE_ERROR: 'Terjadi error pada database',
    UNAUTHORIZED: 'Anda tidak memiliki akses'
  }
};

module.exports = messages;
