/**
 * Category Validation Schemas
 * Validasi untuk category endpoints
 */

const validationRules = require('../constants/validationRules');
const { ValidationError } = require('../utils/errorClasses');
const messages = require('../constants/messages');

const categoryValidations = {
  validateAddCategory: (data) => {
    const { name, type, icon } = data;

    // Validate required fields
    if (!name || !type) {
      throw new ValidationError('Name dan type wajib diisi');
    }

    // Validate type
    if (!validationRules.validateCategoryType(type)) {
      throw new ValidationError(messages.CATEGORY.INVALID_TYPE);
    }

    // Validate name length
    if (name.length < 1 || name.length > 100) {
      throw new ValidationError('Name harus 1-100 karakter');
    }

    return {
      name: name.trim(),
      type,
      icon: icon || null
    };
  }
};

module.exports = categoryValidations;
