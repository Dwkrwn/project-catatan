# Backend Project Structure

Dokumentasi struktur folder backend setelah refactor dengan layer separation.

## Struktur Folder

```
backend/
├── src/
│   ├── app.js                      # Express app setup (exportable untuk test)
│   │
│   ├── config/                     # Konfigurasi aplikasi
│   │   ├── database.js             # PostgreSQL pool configuration
│   │   └── env.js                  # Environment variables validation
│   │
│   ├── constants/                  # Centralized constants
│   │   ├── messages.js             # Error & success messages
│   │   └── validationRules.js      # Centralized validation rules
│   │
│   ├── controllers/                # HTTP request handlers (thin layer)
│   │   ├── auth.controller.js      # Auth endpoints (register, login)
│   │   ├── budget.controller.js    # Budget endpoints
│   │   ├── category.controller.js  # Category endpoints
│   │   └── transaction.controller.js # Transaction endpoints
│   │
│   ├── services/                   # Business logic layer
│   │   ├── auth.service.js         # Auth logic (bcrypt, JWT)
│   │   ├── budget.service.js       # Budget business logic
│   │   ├── category.service.js     # Category business logic
│   │   └── transaction.service.js  # Transaction business logic (complex)
│   │
│   ├── repositories/               # Data access layer (database queries)
│   │   ├── user.repository.js      # User queries
│   │   ├── budget.repository.js    # Budget queries
│   │   ├── category.repository.js  # Category queries
│   │   └── transaction.repository.js # Transaction queries
│   │
│   ├── middlewares/                # Express middlewares
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── error.middleware.js     # Global error handler
│   │   ├── validation.middleware.js # Input validation
│   │   └── requestLogger.middleware.js # Request logging
│   │
│   ├── routes/                     # API routes
│   │   ├── index.js                # Routes registration (centralized)
│   │   ├── auth.routes.js          # Auth routes
│   │   ├── budget.routes.js        # Budget routes
│   │   ├── category.routes.js      # Category routes
│   │   └── transaction.routes.js   # Transaction routes
│   │
│   ├── utils/                      # Utility functions
│   │   ├── errorClasses.js         # Custom error classes
│   │   ├── logger.js               # Structured logging
│   │   └── response.js             # Consistent response formatter
│   │
│   └── validations/                # Input validation schemas
│       ├── auth.validation.js      # Auth input validation
│       ├── budget.validation.js    # Budget input validation
│       ├── category.validation.js  # Category input validation
│       └── transaction.validation.js # Transaction input validation
│
├── server.js                       # Entry point (start server)
├── .env                            # Environment variables
├── package.json
└── STRUCTURE.md                    # This file
```

## Layer Explanation

### 1. Controllers (Thin Layer)
- **Tanggung jawab:** Handle HTTP request/response
- **Logic:** Minimal - hanya validasi, call service, format response
- **Contoh:** 5-15 baris per method
- **Error:** Delegasi ke error middleware

```javascript
// Contoh controller method
async getTransactions(req, res, next) {
  try {
    const userId = req.user.id;
    const transactions = await transactionService.getTransactions(userId, month, year);
    res.json(response.success(transactions));
  } catch (error) {
    next(error); // Error middleware handle ini
  }
}
```

### 2. Services (Business Logic)
- **Tanggung jawab:** Business logic, orchestration, validation
- **Logic:** Kompleks - algorithm, calculations, workflows
- **Contoh:** Calling multiple repositories, calculations, error categorization
- **Error:** Throw custom error classes

```javascript
// Contoh service method
async getSummary(userId, month, year) {
  const income = await transactionRepository.sumByType(userId, 'income', month, year);
  const expense = await transactionRepository.sumByType(userId, 'expense', month, year);
  const balance = await transactionRepository.calculateBalance(userId);
  return { income, expense, balance, netIncome: income - expense };
}
```

### 3. Repositories (Data Access)
- **Tanggung jawab:** Database queries only
- **Logic:** Pure SQL/queries - no business logic
- **Contoh:** SELECT, INSERT, UPDATE, DELETE queries
- **Error:** Throw DatabaseError

```javascript
// Contoh repository method
async findByUserAndMonth(userId, month, year) {
  const result = await pool.query(
    'SELECT * FROM tb_transactions WHERE user_id = $1 AND month = $2 AND year = $3',
    [userId, month, year]
  );
  return result.rows;
}
```

### 4. Validations
- **Tanggung jawab:** Input validation schemas
- **Logic:** Field checking, type validation, range validation
- **Contoh:** Validate required fields, email format, month 1-12
- **Error:** Throw ValidationError

```javascript
// Contoh validation
validateAddBudget(data) {
  if (!data.category_id || !data.amount || !data.month || !data.year) {
    throw new ValidationError('Required fields missing');
  }
  if (data.month < 1 || data.month > 12) {
    throw new ValidationError('Month must be 1-12');
  }
  return { category_id: parseInt(data.category_id), ... };
}
```

### 5. Middlewares
- **auth.middleware:** JWT verification & user extraction
- **error.middleware:** Global error handler (catch semua error)
- **validation.middleware:** Input validation factory
- **requestLogger.middleware:** Log all requests

### 6. Utils
- **errorClasses.js:** Custom error types (ValidationError, AuthError, NotFoundError, etc.)
- **logger.js:** Structured logging dengan levels (info, error, warn, debug)
- **response.js:** Consistent response format (success, error, paginated)

### 7. Constants
- **messages.js:** Centralized error & success messages
- **validationRules.js:** Reusable validation functions

## Request Flow

```
Client Request
    ↓
app.js (Express setup)
    ↓
routes/index.js (Route matching)
    ↓
middleware chain
  ├─ requestLogger.middleware (log request)
  ├─ authMiddleware (for protected routes)
  └─ validation (inline di route)
    ↓
controller.js (HTTP handler)
    ├─ Validate input (validation.js)
    ├─ Call service (service.js)
    ├─ Format response (response.js)
    └─ Error → next(error)
    ↓
service.js (Business logic)
    ├─ Validation logic
    ├─ Call repository (repository.js)
    ├─ Calculations
    └─ Error → throw CustomError
    ↓
repository.js (Data access)
    ├─ Execute query
    ├─ Return data
    └─ Error → throw DatabaseError
    ↓
middleware chain (error.middleware)
    ├─ Log error
    ├─ Format error response
    └─ Send to client
    ↓
Client Response
```

## Key Improvements

### 1. Error Handling
- **Before:** Generic "Server error" di semua tempat
- **After:** Categorized errors (ValidationError, AuthError, NotFoundError, etc.) dengan structured logging

### 2. Code Organization
- **Before:** Business logic tercampur di controller
- **After:** Clear separation - controller (HTTP), service (logic), repository (data)

### 3. Validation
- **Before:** Manual validation di controller, diulang 20+ kali
- **After:** Centralized validation schemas, reusable

### 4. Logging
- **Before:** console.error() tanpa context
- **After:** Structured logging dengan context (userId, endpoint, error code, timestamp)

### 5. Debugging
- **Before:** Sulit trace: error bisa dari validasi, query, atau logic?
- **After:** Clear flow - error code memberi tahu dari layer mana

## Running the App

```bash
# Install dependencies
npm install

# Setup .env file
# Edit .env dengan database credentials

# Development mode (with nodemon)
npm run dev

# Production mode
npm start

# Test (jika sudah setup testing)
npm test
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Transaksi berhasil diambil",
  "data": { ... },
  "timestamp": "2026-08-27T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount harus positif",
    "details": null
  },
  "timestamp": "2026-08-27T10:30:00Z"
}
```

## Debugging Guide

### Ketika ada error:

1. **Lihat error response code** (VALIDATION_ERROR, TRANSACTION_NOT_FOUND, etc.)
2. **Check logs** di console untuk full context
3. **Trace error flow:**
   - ValidationError → di validation.js atau middleware
   - NotFoundError → di service.js atau repository.js
   - DatabaseError → di repository.js query
   - AuthError → di auth.middleware.js atau service.js

4. **Dengan structured logging, kamu bisa lihat:**
   - userId yang request
   - endpoint mana
   - parameter apa
   - error code dan message
   - stack trace

### Example error trace:
```
[ERROR] User login attempt - email not found
endpoint: /api/auth/login
email: user@example.com
error: AuthError - INVALID_CREDENTIALS
userId: null (belum login)
timestamp: 2026-08-27T10:30:00Z
```

## Future Improvements

1. **Testing:** Setup Jest untuk unit tests dan integration tests
2. **Database Migrations:** Setup migration system (db-migrate, sequelize-cli, etc.)
3. **API Documentation:** Add Swagger/OpenAPI documentation
4. **Monitoring:** Add monitoring tools (NewRelic, Datadog, etc.)
5. **Rate Limiting:** Add rate limiting middleware
6. **Caching:** Add Redis caching layer
7. **Request Validation:** Add request schema validation library (Joi, Zod, etc.)
