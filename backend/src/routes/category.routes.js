/**
 * Category Routes
 * Endpoint untuk category management
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const categoryController = require('../controllers/category.controller');
const categoryValidations = require('../validations/category.validation');

// Apply auth middleware untuk semua routes
router.use(authMiddleware);

// GET /api/categories
router.get('/', categoryController.getCategories);

// POST /api/categories
router.post('/', (req, res, next) => {
  try {
    categoryValidations.validateAddCategory(req.body);
    next();
  } catch (error) {
    next(error);
  }
}, categoryController.addCategory);

// DELETE /api/categories/:id
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
