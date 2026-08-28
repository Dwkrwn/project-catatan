/**
 * Custom Error Classes
 * Untuk categorization error yang lebih baik
 */

class AppError extends Error {
  constructor(statusCode, message, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date();
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(400, message, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthError extends AppError {
  constructor(message, code = 'AUTH_ERROR') {
    super(401, message, code);
  }
}

class NotFoundError extends AppError {
  constructor(message, code = 'NOT_FOUND') {
    super(404, message, code);
  }
}

class ConflictError extends AppError {
  constructor(message, code = 'CONFLICT') {
    super(409, message, code);
  }
}

class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(500, message, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

class ServiceError extends AppError {
  constructor(message, originalError = null) {
    super(500, message, 'SERVICE_ERROR');
    this.originalError = originalError;
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ServiceError
};
