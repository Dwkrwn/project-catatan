const Joi = require('joi');

const addBudgetSchema = Joi.object({
    category_id: Joi.number().integer().required(),
    amount: Joi.number().positive().required(),
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().required(),
});

const updateBudgetSchema = Joi.object({
    category_id: Joi.number().integer().optional(),
    amount: Joi.number().positive().optional(),
    month: Joi.number().integer().min(1).max(12).optional(),
    year: Joi.number().integer().optional(),
});

module.exports = {
    addBudgetSchema,
    updateBudgetSchema,
};
