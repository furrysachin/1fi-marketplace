-- ============================================================
-- 1Fi Marketplace — database schema (SQLite)
-- Implemented with Node's built-in `node:sqlite` module so the
-- app runs with zero external database setup.
--
-- The same structure maps 1:1 to PostgreSQL / MongoDB if you
-- want to swap the storage engine (see README).
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT    NOT NULL UNIQUE,        -- URL slug, e.g. "apple-iphone-17-pro"
  name           TEXT    NOT NULL,
  brand          TEXT    NOT NULL,
  category       TEXT    NOT NULL,
  description    TEXT    NOT NULL,
  highlights     TEXT    NOT NULL DEFAULT '[]',  -- JSON array of strings
  specs          TEXT    NOT NULL DEFAULT '[]',  -- JSON array of { "label", "value" }
  featured_image TEXT    NOT NULL,               -- image of the featured variant
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS variants (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,                   -- e.g. "Silver · 256 GB"
  color      TEXT    NOT NULL,
  finish     TEXT,
  storage    TEXT    NOT NULL,
  swatch     TEXT,                               -- hex colour for UI chips
  mrp        INTEGER NOT NULL,                   -- maximum retail price (₹)
  price      INTEGER NOT NULL,                   -- selling price (₹)
  image      TEXT    NOT NULL,
  UNIQUE (product_id, name)
);

CREATE TABLE IF NOT EXISTS emi_plans (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id        INTEGER NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  tenure_months     INTEGER NOT NULL,
  interest_rate_pct REAL    NOT NULL,            -- 0 for 0% plans, else annual p.a.
  monthly_amount    INTEGER NOT NULL,            -- computed via standard EMI formula
  total_amount      INTEGER NOT NULL,            -- monthly_amount × tenure
  cashback_type     TEXT,                        -- 'flat' | 'percent' | NULL
  cashback_value    REAL,
  fund_name         TEXT    NOT NULL,            -- mutual fund backing the plan
  is_featured       INTEGER NOT NULL DEFAULT 0,  -- pre-selected "popular" plan
  UNIQUE (variant_id, tenure_months, interest_rate_pct)
);

CREATE TABLE IF NOT EXISTS orders (
  id             TEXT    PRIMARY KEY,           -- human-readable, e.g. "1FI-7G2K9Q"
  variant_id     INTEGER NOT NULL REFERENCES variants(id),
  emi_plan_id    INTEGER NOT NULL REFERENCES emi_plans(id),
  product_name   TEXT    NOT NULL,              -- snapshot at order time
  variant_name   TEXT    NOT NULL,
  product_price  INTEGER NOT NULL,              -- ₹ at order time
  monthly_amount INTEGER NOT NULL,
  tenure_months  INTEGER NOT NULL,
  interest_rate  REAL    NOT NULL,
  total_amount   INTEGER NOT NULL,
  cashback_amount INTEGER NOT NULL DEFAULT 0,
  fund_name      TEXT    NOT NULL,
  status         TEXT    NOT NULL DEFAULT 'confirmed',
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON variants(product_id);
CREATE INDEX IF NOT EXISTS idx_emi_variant     ON emi_plans(variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_created  ON orders(created_at);