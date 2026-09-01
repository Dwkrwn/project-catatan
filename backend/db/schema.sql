-- ============================================================
-- Schema Database "db_pencatatan"
-- Definisi tabel (DDL) untuk setup database dari nol.
-- Eksekusi: psql -U <user> -d db_pencatatan -f db/schema.sql
-- ============================================================

-- Tabel User -------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Kategori ---------------------------------------------
-- user_id NULL = kategori default (milik semua user)
-- user_id berisi = kategori custom milik user tertentu
CREATE TABLE IF NOT EXISTS tb_categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    type        VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    icon        VARCHAR(50),
    user_id     INTEGER REFERENCES tb_users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Transaksi --------------------------------------------
-- type income = pemasukan, expense = pengeluaran
CREATE TABLE IF NOT EXISTS tb_transactions (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES tb_users(id) ON DELETE CASCADE,
    category_id         INTEGER REFERENCES tb_categories(id) ON DELETE SET NULL,
    type                VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount              NUMERIC(12, 2) NOT NULL,
    description         TEXT,
    transaction_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    income_budget_id    INTEGER REFERENCES tb_budgets(id) ON DELETE SET NULL,
    is_auto             BOOLEAN NOT NULL DEFAULT FALSE,
    source_budget_id    INTEGER REFERENCES tb_budgets(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Budget (Anggaran) ------------------------------------
CREATE TABLE IF NOT EXISTS tb_budgets (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES tb_users(id) ON DELETE CASCADE,
    category_id     INTEGER REFERENCES tb_categories(id) ON DELETE CASCADE,
    amount          NUMERIC(12, 2) NOT NULL,
    month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year            INTEGER NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, category_id, month, year)
);

-- Index untuk mempercepat query pencarian --------------------
CREATE INDEX IF NOT EXISTS idx_transactions_user_date
    ON tb_transactions (user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category
    ON tb_transactions (category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user
    ON tb_categories (user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month_year
    ON tb_budgets (user_id, month, year);
