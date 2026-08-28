const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const categoryController = require('../controllers/categoryController');
const { addCategorySchema } = require('../validations/categoryValidation');

router.use(authMiddleware);

router.get('/', categoryController.getCategories);
router.post('/', validate(addCategorySchema), categoryController.addCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
