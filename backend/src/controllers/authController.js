const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService');

exports.register = asyncHandler(async (req, res) => {
    const result = await userService.register(req.body);
    res.status(201).json({
        message: 'Registrasi berhasil',
        token: result.token,
        user: result.user,
    });
});

exports.login = asyncHandler(async (req, res) => {
    const result = await userService.login(req.body);
    res.json({
        message: 'Login berhasil',
        token: result.token,
        user: result.user,
    });
});
