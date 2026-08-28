const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
    next(new ApiError(404, `Route tidak ditemukan: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Error operasional (dari ApiError) -> log ringan
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    // Kesalahan database / programming error -> log detail untuk debugging
    console.error('SERVER ERROR:', err);

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server error',
    });
};

module.exports = { notFound, errorHandler };
