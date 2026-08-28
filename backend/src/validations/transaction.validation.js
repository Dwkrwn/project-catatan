/**
 * Transaction Validation Schemas
 * Validasi untuk transaction endpoints
 */

const validationRules = require('../constants/validationRules');
const { ValidationError } = require('../utils/errorClasses');
const messages = require('../constants/messages');

const transactionValidations = {
  validateAddTransaction: (data) => {
    const { category_id, type, amount, description, date } = data;

    // Validate required fields
    if (!type || amount === undefined) {
      throw new ValidationError(
        'Type dan amount wajib diisi'
      );
    }

    // Validate type
    if (!validationRules.validateTransactionType(type)) {
      throw new ValidationError(messages.TRANSACTION.INVALID_TYPE);
    }

    // Validate amount
    if (isNaN(amount) || !validationRules.validateAmount(amount)) {
      throw new ValidationError('Amount harus positif');
    }

    // Validate date if provided
    if (date && isNaN(new Date(date).getTime())) {
      throw new ValidationError(messages.TRANSACTION.INVALID_DATE);
    }

    return {
      category_id: category_id ? parseInt(category_id) : null,
      type,
      amount: parseFloat(amount),
      description: description || null,
      date: date || new Date()
    };
  },

  validateUpdateTransaction: (data) => {
    const { category_id, type, amount, description, date } = data;

    // All fields are optional, but if provided must be valid
    if (type !== undefined) {
      if (!validationRules.validateTransactionType(type)) {
        throw new ValidationError(messages.TRANSACTION.INVALID_TYPE);
      }
    }

    if (amount !== undefined) {
      if (isNaN(amount) || !validationRules.validateAmount(amount)) {
        throw new ValidationError('Amount harus positif');
      }
    }

    if (date !== undefined) {
      if (isNaN(new Date(date).getTime())) {
        throw new ValidationError(messages.TRANSACTION.INVALID_DATE);
      }
    }

    return {
      ...(category_id && { category_id: parseInt(category_id) }),
      ...(type && { type }),
      ...(amount && { amount: parseFloat(amount) }),
      ...(description && { description }),
      ...(date && { date })
    };
  },

  validateQuery: (query) => {
    const { month, year } = query;

    if (month !== undefined) {
      if (!validationRules.validateMonth(month)) {
        throw new ValidationError(
          'Month harus antara 1 dan 12'
        );
      }
    }

    if (year !== undefined) {
      if (!validationRules.validateYear(year)) {
        throw new ValidationError('Year tidak valid');
      }
    }

    return {
      ...(month && { month: parseInt(month) }),
      ...(year && { year: parseInt(year) })
    };
  }
};

module.exports = transactionValidations;
