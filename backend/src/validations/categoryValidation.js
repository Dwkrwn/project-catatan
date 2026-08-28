const Joi = require('joi');

const addCategorySchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    type: Joi.string().valid('income', 'expense').required(),
    icon: Joi.string().allow('', null).optional(),
});

module.exports = {
    addCategorySchema,
};
