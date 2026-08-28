const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

router.use(auth);

router.get('/', categoryController.getCategories);
router.post('/', categoryController.addCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;