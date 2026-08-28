const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const transactionRoutes = require('./transactionRoutes');
const categoryRoutes = require('./categoryRoutes');
const budgetRoutes = require('./budgetRoutes');

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/budgets', budgetRoutes);

module.exports = router;
