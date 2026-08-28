const ApiError = require('../utils/ApiError');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const message = error.details.map((d) => d.message).join(', ');
            return next(new ApiError(400, message));
        }

        req.body = schema.validate(req.body, {
            stripUnknown: true,
        }).value;

        next();
    };
};

module.exports = validate;
