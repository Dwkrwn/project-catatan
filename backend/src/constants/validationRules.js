/**
 * Validation Rules
 * Centralized validation rules untuk semua validasi
 */

const validationRules = {
  // Month validation
  validateMonth: (month) => {
    const m = parseInt(month);
    return !isNaN(m) && m >= 1 && m <= 12;
  },

  // Year validation
  validateYear: (year) => {
    const y = parseInt(year);
    const currentYear = new Date().getFullYear();
    return !isNaN(y) && y >= 2000 && y <= currentYear + 10;
  },

  // Amount validation
  validateAmount: (amount) => {
    const a = parseFloat(amount);
    return !isNaN(a) && a > 0;
  },

  // Email validation
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Transaction type validation
  validateTransactionType: (type) => {
    return ['income', 'expense'].includes(type);
  },

  // Category type validation
  validateCategoryType: (type) => {
    return ['income', 'expense'].includes(type);
  },

  // Username validation
  validateUsername: (username) => {
    return username && username.length >= 3 && username.length <= 50;
  },

  // Password validation
  validatePassword: (password) => {
    return password && password.length >= 6;
  }
};

module.exports = validationRules;
