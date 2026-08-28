const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'API Catatan Keuangan Berjalan!' });
});

// Handler 404 & error terpusat (harus di akhir)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
