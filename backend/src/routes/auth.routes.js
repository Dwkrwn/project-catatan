/**
 * Auth Routes
 * Endpoint untuk authentication (register, login)
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authValidations = require('../validations/auth.validation');
const { validateRequest } = require('../middlewares/validation.middleware');

// POST /api/auth/register
router.post('/register', (req, res, next) => {
  try {
    authValidations.validateRegister(req.body);
    next();
  } catch (error) {
    next(error);
  }
}, authController.register);

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  try {
    authValidations.validateLogin(req.body);
    next();
  } catch (error) {
    next(error);
  }
}, authController.login);

module.exports = router;
