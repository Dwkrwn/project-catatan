const Joi = require('joi');

const addTransactionSchema = Joi.object({
    category_id:Joi.number().integer().allow(null).optional(),
    type: Joi.string().valid('income', 'expense').required(),
    amount: Joi.number().positive().required(),
    description: Joi.string().allow('', null).optional(),
    date: Joi.date().optional(),
});

const updateTransactionSchema = Joi.object({
    category_id: Joi.number().integer().allow(null).optional(),
    type: Joi.string().valid('income', 'expense').optional(),
    amount: Joi.number().positive().optional(),
    description: Joi.string().allow('', null).optional(),
    date: Joi.date().optional(),
});

module.exports = {
    addTransactionSchema,
    updateTransactionSchema,
};
