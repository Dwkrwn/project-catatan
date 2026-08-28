/**
 * Routes Index
 * Centralized route registration untuk semua endpoints
 */

const authRoutes = require('./auth.routes');
const transactionRoutes = require('./transaction.routes');
const categoryRoutes = require('./category.routes');
const budgetRoutes = require('./budget.routes');

module.exports = (app) => {
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({ message: 'API Catatan Keuangan Berjalan!' });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/budgets', budgetRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found'
      }
    });
  });
};
