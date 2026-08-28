# Verification Checklist - Backend Refactor

Dokumentasi untuk verifikasi bahwa semua endpoint masih berfungsi dengan logic yang sama setelah refactor.

## Authentication Endpoints

### 1. POST /api/auth/register
**Expected Flow:**
1. Client sends: `{ username, email, password }`
2. authController.register() → validates input
3. authService.register() → checks duplicate user → hash password → create user
4. Response: `{ success: true, data: { id, username, email }, message: 'Registrasi berhasil' }`

**Test Case:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "timestamp": "2026-08-27T10:30:00Z"
}
```

**Error Cases:**
- Missing fields → ValidationError (400)
- User already exists → ConflictError (409)
- Invalid email → ValidationError (400)
- Password too short → ValidationError (400)

---

### 2. POST /api/auth/login
**Expected Flow:**
1. Client sends: `{ email, password }`
2. authController.login() → validates input
3. authService.login() → find user → verify password → generate JWT
4. Response: `{ success: true, data: { token, user: { id, username, email } }, message: 'Login berhasil' }`

**Test Case:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    }
  },
  "timestamp": "2026-08-27T10:30:00Z"
}
```

**Error Cases:**
- Missing fields → ValidationError (400)
- User not found → AuthError (401)
- Wrong password → AuthError (401)
- Invalid email format → ValidationError (400)

---

## Category Endpoints

### 3. GET /api/categories
**Expected Flow:**
1. Client sends request with Authorization header
2. authMiddleware → verify JWT → extract userId
3. categoryController.getCategories() → call service
4. categoryService.getCategories() → fetch from repository
5. categoryRepository.findByUserOrDefault() → query database
6. Response: `{ count, categories }`

**Test Case:**
```bash
GET /api/categories
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Kategori berhasil diambil",
  "data": {
    "count": 5,
    "categories": [
      {
        "id": 1,
        "name": "Salary",
        "type": "income",
        "icon": "💰",
        "user_id": null
      },
      ...
    ]
  },
  "timestamp": "2026-08-27T10:30:00Z"
}
```

**Error Cases:**
- Missing auth header → AuthError (401)
- Invalid token → AuthError (401)
- Token expired → AuthError (401)

---

### 4. POST /api/categories
**Expected Flow:**
1. Client sends: `{ name, type, icon }`
2. Validation middleware → validate schema
3. categoryController.addCategory() → validate
4. categoryService.addCategory() → call repository
5. categoryRepository.create() → insert into database
6. Response: `{ category }`

**Test Case:**
```bash
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Custom Category",
  "type": "expense",
  "icon": "🎁"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Kategori berhasil ditambahkan",
  "data": {
    "category": {
      "id": 10,
      "name": "Custom Category",
      "type": "expense",
      "icon": "🎁",
      "user_id": 1
    }
  },
  "timestamp": "2026-08-27T10:30:00Z"
}
```

**Error Cases:**
- Missing required fields → ValidationError (400)
- Invalid type → ValidationError (400)

---

### 5. DELETE /api/categories/:id
**Expected Flow:**
1. Client sends request to delete category
2. authMiddleware → verify JWT
3. categoryController.deleteCategory() → call service
4. categoryService.deleteCategory() → check ownership → call repository
5. categoryRepository.delete() → delete from database
6. Response: success message

**Test Case:**
```bash
DELETE /api/categories/10
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Kategori berhasil dihapus",
  "data": null,
  "timestamp": "2026-08-27T10:30:00Z"
}
```

**Error Cases:**
- Category not found → NotFoundError (404)
- Wrong user → NotFoundError (404)

---

## Budget Endpoints

### 6. GET /api/budgets
**Expected Flow:**
1. Client sends query parameters: `?month=8&year=2026`
2. queryValidation → validate month and year
3. budgetController.getBudgets() → call service
4. budgetService.getBudgets() → call repository
5. budgetRepository.findByUserAndMonth() → query database
6. Response: `{ count, budgets }`

**Test Case:**
```bash
GET /api/budgets?month=8&year=2026
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Budget berhasil diambil",
  "data": {
    "count": 3,
    "budgets": [
      {
        "id": 1,
        "user_id": 1,
        "category_id": 2,
        "amount": 500000,
        "month": 8,
        "year": 2026,
        "category_name": "Food",
        "category_icon": "🍔"
      },
      ...
    ]
  },
  "timestamp": "2026-08-27T10:30:00Z"
}
```

**Error Cases:**
- Invalid month → ValidationError (400)
- Invalid year → ValidationError (400)
- Missing auth → AuthError (401)

---

### 7. POST /api/budgets
**Expected Flow:**
1. Client sends: `{ category_id, amount, month, year }`
2. Validation → validate all fields
3. budgetController.addBudget() → call service
4. budgetService.addBudget() → check duplicate → call repository
5. budgetRepository.create() → insert to database
6. Response: `{ budget }`

**Test Case:**
```bash
POST /api/budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "category_id": 2,
  "amount": 500000,
  "month": 8,
  "year": 2026
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Budget berhasil ditambahkan",
  "data": {
    "budget": {
      "id": 1,
      "user_id": 1,
      "category_id": 2,
      "amount": 500000,
      "month": 8,
      "year": 2026
    }
  },
  "timestamp": "2026-08-27T10:30:00Z"
}
```

**Error Cases:**
- Missing required fields → ValidationError (400)
- Invalid month/year → ValidationError (400)
- Budget already exists → ConflictError (409)

---

### 8. PUT /api/budgets/:id
**Expected Flow:**
1. Client sends: `{ category_id?, amount?, month?, year? }`
2. Validation → validate fields (optional)
3. budgetController.updateBudget() → call service
4. budgetService.updateBudget() → check ownership → call repository
5. budgetRepository.update() → update database
6. Response: `{ budget }`

**Test Case:**
```bash
PUT /api/budgets/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 600000
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Budget berhasil diupdate",
  "data": {
    "budget": {
      "id": 1,
      "user_id": 1,
      "category_id": 2,
      "amount": 600000,
      "month": 8,
      "year": 2026
    }
  },
  "timestamp": "2026-08-27T10:30:00Z"
}
```

**Error Cases:**
- Budget not found → NotFoundError (404)
- Invalid month → ValidationError (400)

---

### 9. DELETE /api/budgets/:id
**Expected Flow:**
1. Client sends delete request
2. authMiddleware → verify JWT
3. budgetController.deleteBudget() → call service
4. budgetService.deleteBudget() → check ownership → call repository
5. budgetRepository.delete() → delete from database
6. Response: success message

**Test Case:**
```bash
DELETE /api/budgets/1
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Budget berhasil dihapus",
  "data": null,
  "timestamp": "2026-08-27T10:30:00Z"
}
```

---

## Transaction Endpoints

### 10. GET /api/transactions
**Similar to GET /api/budgets - query with month/year filter**

### 11. POST /api/transactions
**Similar to POST /api/budgets - create transaction**

### 12. PUT /api/transactions/:id
**Similar to PUT /api/budgets - update transaction**

### 13. DELETE /api/transactions/:id
**Similar to DELETE /api/budgets - delete transaction**

### 14. GET /api/transactions/summary
**Gets income, expense, balance summary for given month/year**

### 15. GET /api/transactions/summary/category
**Gets expense breakdown by category for given month/year**

---

## Verification Steps

### Step 1: Start Server
```bash
npm run dev
# Server harus berjalan di http://localhost:5000
```

### Step 2: Test Auth Endpoints
- [ ] POST /api/auth/register - berhasil create user
- [ ] POST /api/auth/register - duplicate user error
- [ ] POST /api/auth/login - berhasil login dengan token
- [ ] POST /api/auth/login - user not found error
- [ ] POST /api/auth/login - wrong password error

### Step 3: Test Category Endpoints
- [ ] GET /api/categories - return list (needs valid token)
- [ ] POST /api/categories - create category (needs valid token)
- [ ] DELETE /api/categories/:id - delete category (needs valid token)

### Step 4: Test Budget Endpoints
- [ ] GET /api/budgets - return list with filters
- [ ] GET /api/budgets?month=8&year=2026 - filter by month/year
- [ ] POST /api/budgets - create budget
- [ ] PUT /api/budgets/:id - update budget
- [ ] DELETE /api/budgets/:id - delete budget

### Step 5: Test Transaction Endpoints
- [ ] GET /api/transactions - return list
- [ ] GET /api/transactions?month=8&year=2026 - with filters
- [ ] POST /api/transactions - create transaction
- [ ] PUT /api/transactions/:id - update transaction
- [ ] DELETE /api/transactions/:id - delete transaction
- [ ] GET /api/transactions/summary - get summary
- [ ] GET /api/transactions/summary/category - get expense breakdown

### Step 6: Test Error Handling
- [ ] Missing auth header → 401 Unauthorized
- [ ] Invalid token → 401 Invalid Token
- [ ] Token expired → 401 Token Expired
- [ ] Validation error → 400 Validation Error
- [ ] Resource not found → 404 Not Found
- [ ] Conflict error → 409 Conflict

### Step 7: Verify Logging
- [ ] Check console untuk structured logs
- [ ] Verify logs contain: timestamp, level, message, context (userId, endpoint, etc.)
- [ ] Verify error logs contain: error code, message, stack trace

---

## Comparison: Before vs After

### Before Refactor
```
POST /api/categories
→ categoryController.addCategory()
  ├─ validate input (manual)
  ├─ database query (direct pool.query)
  ├─ error handling (generic "Server error")
  └─ response formatting (manual)
```

**Issues:**
- 50+ lines per controller method
- Error handling di 20+ tempat
- Validation diulang di multiple places
- Logging minimal

### After Refactor
```
POST /api/categories
→ validation middleware (schema based)
→ categoryController.addCategory()
  ├─ call categoryService.addCategory()
  │  ├─ call categoryRepository.create()
  │  │  ├─ database query
  │  │  └─ error → DatabaseError
  │  └─ error → ServiceError
  └─ format response
→ error middleware (centralized)
  ├─ log error with context
  ├─ format error response
  └─ send to client
```

**Improvements:**
- 10-15 lines per controller method
- Centralized error handling
- Reusable validation schemas
- Structured logging dengan context

---

## Sign-off Criteria

✅ **All endpoints respond with correct structure**
- success: true/false
- message: string
- data: object
- timestamp: ISO string

✅ **All business logic maintained**
- Validation rules same
- Query logic same
- Error messages same (via constants)

✅ **Authentication works**
- JWT generation sama
- Token verification sama
- Auth errors properly categorized

✅ **Error handling centralized**
- All errors caught by error middleware
- Consistent error response format
- Structured logging for debugging

✅ **Performance similar or better**
- Same number of database queries
- No N+1 query problems
- Response time comparable

✅ **Code organization improved**
- Clear separation of concerns
- Easy to find code (know which layer)
- Easy to debug (trace error flow)
- Easy to test (services isolated)
