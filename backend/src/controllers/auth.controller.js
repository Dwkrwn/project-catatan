/**
 * Auth Controller
 * HTTP request handler untuk authentication endpoints
 * Business logic di-delegate ke authService
 */

const authService = require('../services/auth.service');
const authValidations = require('../validations/auth.validation');
const response = require('../utils/response');
const messages = require('../constants/messages');

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      // Validate input
      const validatedData = authValidations.validateRegister(req.body);

      // Call service
      const newUser = await authService.register(
        validatedData.username,
        validatedData.email,
        validatedData.password
      );

      // Send response
      res.status(201).json(
        response.success(newUser, messages.AUTH.REGISTER_SUCCESS)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      // Validate input
      const validatedData = authValidations.validateLogin(req.body);

      // Call service
      const result = await authService.login(validatedData.email, validatedData.password);

      // Send response
      res.json(response.success(result, messages.AUTH.LOGIN_SUCCESS));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
