/**
 * Auth Validation Schemas
 * Validasi untuk authentication endpoints
 */

const validationRules = require('../constants/validationRules');
const { ValidationError } = require('../utils/errorClasses');
const messages = require('../constants/messages');

const authValidations = {
  validateRegister: (data) => {
    const { username, email, password } = data;

    // Validate required fields
    if (!username || !email || !password) {
      throw new ValidationError(messages.AUTH.MISSING_REGISTRATION_FIELDS);
    }

    // Validate username
    if (!validationRules.validateUsername(username)) {
      throw new ValidationError('Username harus 3-50 karakter');
    }

    // Validate email
    if (!validationRules.validateEmail(email)) {
      throw new ValidationError('Email tidak valid');
    }

    // Validate password
    if (!validationRules.validatePassword(password)) {
      throw new ValidationError('Password minimal 6 karakter');
    }

    return { username, email, password };
  },

  validateLogin: (data) => {
    const { email, password } = data;

    // Validate required fields
    if (!email || !password) {
      throw new ValidationError(messages.AUTH.MISSING_EMAIL_PASSWORD);
    }

    // Validate email
    if (!validationRules.validateEmail(email)) {
      throw new ValidationError('Email tidak valid');
    }

    return { email, password };
  }
};

module.exports = authValidations;
