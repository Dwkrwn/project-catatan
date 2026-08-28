const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ApiError(401, 'Akses ditolak, token tidak ditemukan'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        next(new ApiError(401, 'Token tidak valid'));
    }
};

module.exports = authMiddleware;
