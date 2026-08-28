const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Ambil token dari header Authorzation
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });
        }

        const token = authHeader.split(' ')[1];

        // Verifikasi token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        res.status(401).json({ message: 'Token tidak valid' });

    }
};