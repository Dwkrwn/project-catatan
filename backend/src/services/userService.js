const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const userModel = require('../models/userModel');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const register = async ({ username, email, password }) => {
    if (!username || !email || !password) {
        throw new ApiError(400, 'Semua field wajib diisi');
    }

    const existingUser = await userModel.findByEmailOrUsername(email, username);
    if (existingUser) {
        throw new ApiError(409, 'Email atau Username sudah terdaftar');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.create(username, email, hashedPassword);
    const token = generateToken(newUser);

    return { token, user: newUser };
};

const login = async ({ email, password }) => {
    if (!email || !password) {
        throw new ApiError(400, 'Email dan Password wajib diisi');
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
        throw new ApiError(401, 'Email atau password salah');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new ApiError(401, 'Email atau Password salah');
    }

    const token = generateToken(user);

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
    };
};

module.exports = {
    register,
    login,
};
