/**
 * Budget Validation Schemas
 * Validasi untuk budget endpoints
 */

const validationRules = require('../constants/validationRules');
const { ValidationError } = require('../utils/errorClasses');
const messages = require('../constants/messages');

const budgetValidations = {
  validateAddBudget: (data) => {
    const { category_id, amount, month, year } = data;

    // Validate required fields
    if (!category_id || !amount || month === undefined || !year) {
      throw new ValidationError(
        'Category_id, amount, month, dan year wajib diisi'
      );
    }

    // Validate types
    if (isNaN(category_id) || isNaN(amount) || isNaN(month) || isNaN(year)) {
      throw new ValidationError('Data type tidak sesuai');
    }

    // Validate amount
    if (!validationRules.validateAmount(amount)) {
      throw new ValidationError('Amount harus positif');
    }

    // Validate month
    if (!validationRules.validateMonth(month)) {
      throw new ValidationError(messages.BUDGET.INVALID_MONTH);
    }

    // Validate year
    if (!validationRules.validateYear(year)) {
      throw new ValidationError(messages.BUDGET.INVALID_YEAR);
    }

    return { 
      category_id: parseInt(category_id),
      amount: parseFloat(amount),
      month: parseInt(month),
      year: parseInt(year)
    };
  },

  validateUpdateBudget: (data) => {
    const { category_id, amount, month, year } = data;

    // All fields are optional, but if provided must be valid
    if (category_id !== undefined && isNaN(category_id)) {
      throw new ValidationError('category_id harus number');
    }

    if (amount !== undefined) {
      if (isNaN(amount) || !validationRules.validateAmount(amount)) {
        throw new ValidationError('Amount harus positif');
      }
    }

    if (month !== undefined) {
      if (!validationRules.validateMonth(month)) {
        throw new ValidationError(messages.BUDGET.INVALID_MONTH);
      }
    }

    if (year !== undefined) {
      if (!validationRules.validateYear(year)) {
        throw new ValidationError(messages.BUDGET.INVALID_YEAR);
      }
    }

    return {
      ...(category_id && { category_id: parseInt(category_id) }),
      ...(amount && { amount: parseFloat(amount) }),
      ...(month !== undefined && { month: parseInt(month) }),
      ...(year && { year: parseInt(year) })
    };
  },

  validateQuery: (query) => {
    const { month, year } = query;

    if (month !== undefined) {
      if (!validationRules.validateMonth(month)) {
        throw new ValidationError(messages.BUDGET.INVALID_MONTH);
      }
    }

    if (year !== undefined) {
      if (!validationRules.validateYear(year)) {
        throw new ValidationError(messages.BUDGET.INVALID_YEAR);
      }
    }

    return {
      ...(month && { month: parseInt(month) }),
      ...(year && { year: parseInt(year) })
    };
  }
};

module.exports = budgetValidations;
