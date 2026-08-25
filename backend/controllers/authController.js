const bcrypt = require('bcrypt');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validasi untuk Input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Semua field wajib diisi'});
        }

        // Cek jika user sudah ada
        const userExists = await pool.query(
            'SELECT * FROM tb_users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: 'Email atau Username sudah terdaftar'});
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user baru
        const newUser = await pool.query(
            'INSERT INTO tb_users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        res.status(201).json({
            message: 'Registrasi berhasil',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi untuk input
        if(!email || !password) {
            return res.status(400).json({ message: 'Email dan Password wajib diisi' });
        }

        // Cari user berdasarkan email
        const result = await pool.query('SELECT * FROM tb_users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah'});
        }

        const user = result.rows[0];

        // verifikasi password
        const validasiPassword = await bcrypt.compare(password, user.password);

        if (!validasiPassword) {
            return res.status(401).json({ message: 'Email atau Password salah' });
        }

        // Buat JWT token
        const token = jwt.sign(
            {id: user.id, username: user.username}, process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};