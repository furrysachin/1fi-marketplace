# 1Fi Marketplace

A full-stack implementation of the **1Fi Marketplace** — the fully-built section inside the Shop
page of the 1Fi app experience. Users browse smartphones, pick a variant (colour / storage /
finish), choose from multiple **EMI plans backed by mutual funds** (0% and interest-bearing),
and proceed with the selected plan.

```
Shop
├── Top Brands        → blank (as per assignment)
├── Nearby Stores     → blank (as per assignment)
└── 1Fi Marketplace   → fully implemented ✅
    └── /product/:slug  → product detail + EMI plan selection + proceed
```

> **Note on the codebase:** the real 1Fi app isn't available in this workspace, so the app is
> built as a self-contained project that reproduces the Shop → 1Fi Marketplace experience
> (mobile-first layout, bottom nav, 1Fi brand palette) with the 1Fi design language.

---

## ✨ Features

- **Product listing** with image, name, pricing, discount badge, "EMI from" pill and variant count
- **Product detail** with unique URLs (`/product/apple-iphone-17-pro`, `/product/samsung-galaxy-s24-ultra`, …)
- **Variant selector** (colour · storage · finish) — price, image and EMI plans update on switch
- **Selectable EMI plans** showing monthly amount, tenure, interest rate (0% / 10.5% / 11.5%),
  cashback (where applicable) and the mutual fund backing each plan
- **Proceed CTA** → checkout summary modal → **real order placement** (`POST /api/orders`)
  with loading / failure / confirmation states and a server-generated order ID
- **All data dynamic**: served from a database via REST APIs — nothing hardcoded in the UI
- **Loading skeletons, error states with retry, 404 page, error boundary**, responsive grid
  (2/3/4 columns), client-side **search + sorting**, mobile bottom navigation
- **Shareable variant state**: the selected variant is synced to the URL
  (`/product/apple-iphone-17-pro?variant=Cosmic+Orange+%C2%B7+1+TB`) and restored on reload

## 🛠 Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, Vite 5, React Router 6, Tailwind CSS 3, lucide-react icons |
| Backend    | Node.js, Express 4 |
| Database   | SQLite via Node's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html) module |
| Dev tooling| npm workspaces-style monorepo, `concurrently` for one-command dev |

**Why `node:sqlite`?** The database is a real SQL database with a proper schema
(`products` → `variants` → `emi_plans` with foreign keys), but requires **zero external setup** —
no MongoDB/Postgres server, no Docker, no native compilation. It runs anywhere Node runs
(including Render/Vercel) and the server auto-seeds on first boot. The schema maps 1:1 to
PostgreSQL or MongoDB if you want to swap engines (see [Swapping the database](#swapping-the-database)).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js ≥ 22.5** (uses the built-in `node:sqlite`; tested on Node 26)
- npm (bundled with Node)

No database server, Docker, or environment variables required.

### 1. Install

```bash
npm run setup        # installs root, server and client dependencies
```

### 2. Run in development (hot reload)

```bash
npm run dev
```

- Frontend: **http://localhost:5173** (Vite, proxies `/api` → :5000)
- Backend API: **http://localhost:5000/api**

The database is created and seeded automatically on first boot. To reseed from scratch:

```bash
npm run seed
```

### 3. Run in production (single server)

```bash
npm run build        # builds the React client into client/dist
npm start            # Express serves the API + built client at http://localhost:5000
```

---

## 🗄 Database

### Schema

Defined in [`server/src/schema.sql`](server/src/schema.sql) (applied automatically on boot).

```sql
CREATE TABLE products (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT    NOT NULL UNIQUE,        -- e.g. "apple-iphone-17-pro"
  name           TEXT    NOT NULL,
  brand          TEXT    NOT NULL,
  category       TEXT    NOT NULL,
  description    TEXT    NOT NULL,
  highlights     TEXT    NOT NULL DEFAULT '[]',  -- JSON array of strings
  specs          TEXT    NOT NULL DEFAULT '[]',  -- JSON array of {label, value}
  featured_image TEXT    NOT NULL,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE variants (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,                   -- "Silver · 256 GB"
  color      TEXT    NOT NULL,
  finish     TEXT,
  storage    TEXT    NOT NULL,
  swatch     TEXT,                               -- hex colour for UI chips
  mrp        INTEGER NOT NULL,                   -- ₹
  price      INTEGER NOT NULL,                   -- ₹
  image      TEXT    NOT NULL,
  UNIQUE (product_id, name)
);

CREATE TABLE emi_plans (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id        INTEGER NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  tenure_months     INTEGER NOT NULL,
  interest_rate_pct REAL    NOT NULL,            -- 0 = no-cost EMI
  monthly_amount    INTEGER NOT NULL,            -- computed (standard EMI formula)
  total_amount      INTEGER NOT NULL,
  cashback_type     TEXT,                        -- 'flat' | 'percent' | NULL
  cashback_value    REAL,
  fund_name         TEXT    NOT NULL,            -- backing mutual fund
  is_featured       INTEGER NOT NULL DEFAULT 0,  -- pre-selected "popular" plan
  UNIQUE (variant_id, tenure_months, interest_rate_pct)
);

CREATE TABLE orders (
  id              TEXT    PRIMARY KEY,           -- server-generated, e.g. "1FI-3ZGJM8"
  variant_id      INTEGER NOT NULL REFERENCES variants(id),
  emi_plan_id     INTEGER NOT NULL REFERENCES emi_plans(id),
  product_name    TEXT    NOT NULL,              -- snapshot at order time
  variant_name    TEXT    NOT NULL,
  product_price   INTEGER NOT NULL,
  monthly_amount  INTEGER NOT NULL,
  tenure_months   INTEGER NOT NULL,
  interest_rate   REAL    NOT NULL,
  total_amount    INTEGER NOT NULL,
  cashback_amount INTEGER NOT NULL DEFAULT 0,
  fund_name       TEXT    NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'confirmed',
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

### Seed data

[`server/src/seed/seedData.js`](server/src/seed/seedData.js) defines **4 products, 12 variants,
48 EMI plans**:

| Product | Variants | Example EMI plans (per variant) |
|---|---|---|
| Apple iPhone 17 Pro | Silver · Lavender (256 GB) · Black Titanium (512 GB) · Cosmic Orange (1 TB) | 3mo 0% · 6mo 0% + ₹1,500 cashback · 9mo 10.5% · 12mo 10.5% + ₹2,500 cashback |
| Samsung Galaxy S24 Ultra | Titanium Gray 256 GB · Titanium Violet 512 GB · Titanium Black 1 TB | 3mo 0% · 6mo 0% + ₹2,000 · 12mo 10.5% · 18mo 11.5% + ₹3,000 |
| Google Pixel 9 Pro | Obsidian 128 GB · Flowy Emerald 256 GB · Silky Black 512 GB | 3mo 0% · 6mo 0% + ₹1,500 · 9mo 10.5% · 12mo 10.5% + ₹2,500 |
| OnePlus 12 | Cool Blue 256 GB · Silky Black 512 GB | 3mo 0% · 6mo 0% + ₹1,000 · 9mo 10.5% · 12mo 10.5% + ₹1,500 |

**EMI is computed, not hardcoded** — `server/src/utils/emi.js` implements the standard
reducing-balance formula:

```
monthly = P · r · (1 + r)ⁿ / ((1 + r)ⁿ − 1)      (r = annual rate / 12 / 100, 0% → P / n)
```

### Swapping the database

All SQL lives in [`server/src/repositories/productRepository.js`](server/src/repositories/productRepository.js).
To use **PostgreSQL** (same tables, `BIGSERIAL`/`UUID` keys) or **MongoDB** (collections
`products` → `variants` → `emiPlans`), rewrite that one file to your driver — the REST API
contract stays identical.

---

## 🔌 API

Base URL: `http://localhost:5000/api` (proxied as `/api` in dev)

### `GET /api/health`
Health + DB status.

```json
{
  "status": "ok",
  "database": "connected",
  "products": 4,
  "timestamp": "2026-09-03T15:04:28.110Z"
}
```

### `GET /api/products`
List all products with computed summary fields (cheapest price, discount, cheapest monthly EMI).

```json
{
  "data": [
    {
      "id": 1,
      "slug": "apple-iphone-17-pro",
      "name": "Apple iPhone 17 Pro",
      "brand": "Apple",
      "category": "Smartphones",
      "featuredImage": "/images/iphone-17-pro-silver.png",
      "priceFrom": 124999,
      "mrpFrom": 139900,
      "discountPct": 11,
      "emiFrom": 11019,
      "variantCount": 4
    }
  ]
}
```

### `GET /api/products/:id`
Full detail (accepts numeric id **or** URL slug) with every variant and its EMI plans.

```json
{
  "data": {
    "id": 1,
    "slug": "apple-iphone-17-pro",
    "name": "Apple iPhone 17 Pro",
    "description": "…",
    "highlights": ["A19 Pro chip with 6-core GPU — desktop-class performance"],
    "specs": [{ "label": "Display", "value": "6.3-inch Super Retina XDR, 120Hz ProMotion" }],
    "variants": [
      {
        "id": 1,
        "name": "Silver · 256 GB",
        "color": "Silver",
        "storage": "256 GB",
        "swatch": "#E3E4E5",
        "mrp": 139900,
        "price": 124999,
        "image": "/images/iphone-17-pro-silver.png",
        "emiPlans": [
          {
            "id": 1,
            "tenureMonths": 3,
            "interestRatePct": 0,
            "monthlyAmount": 41667,
            "totalAmount": 124999,
            "cashback": null,
            "fundName": "1Fi Liquid Fund",
            "isFeatured": false
          }
        ]
      }
    ]
  }
}
```

### `POST /api/orders`
Places an order. The body carries **only identifiers** — every monetary value is recomputed
server-side from the database, so pricing can never be tampered with from the client.

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"variantId": 1, "planId": 2}'
```

```json
{
  "data": {
    "id": "1FI-3ZGJM8",
    "status": "confirmed",
    "createdAt": "2026-09-05 19:50:33",
    "product": { "name": "Apple iPhone 17 Pro", "variant": "Silver · 256 GB", "price": 124999 },
    "emi": {
      "monthlyAmount": 20834,
      "tenureMonths": 6,
      "interestRatePct": 0,
      "totalAmount": 124999,
      "cashbackAmount": 1500,
      "fundName": "1Fi Nifty 50 Index Fund"
    }
  }
}
```

### `GET /api/orders/:id`
Fetch a placed order by its ID (used for confirmation lookup).

### `GET /api/orders?limit=20`
List recent orders (max 100) — handy for demoing that orders really persist in SQLite.

### Errors
All errors use a consistent envelope with an HTTP status:

```json
{ "error": { "code": "PRODUCT_NOT_FOUND", "message": "Product not found." } }
```

| Status | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Order body missing/invalid `variantId` or `planId` |
| 404 | `PRODUCT_NOT_FOUND` | Unknown product id/slug |
| 404 | `ORDER_NOT_FOUND` | Unknown order id |
| 409 | `PLAN_MISMATCH` | The plan belongs to a different variant |
| 404 | `NOT_FOUND` | Unknown `/api/*` route |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## 📁 Project Structure

```
├── server/                    # Express + SQLite backend
│   ├── src/
│   │   ├── index.js           # app entry: API, static serving, error handling
│   │   ├── db.js              # node:sqlite connection + schema migration
│   │   ├── schema.sql         # database schema (DDL)
│   │   ├── routes/products.js # REST endpoints
│   │   ├── routes/orders.js   # POST/GET orders (server-computed pricing)
│   │   ├── repositories/      # data-access layer (all SQL lives here)
│   │   ├── utils/emi.js       # EMI formula + cashback helpers
│   │   └── seed/              # seed dataset + seeding script
│   └── .env.example
├── client/                    # React + Vite + Tailwind frontend
│   └── src/
│       ├── api/               # fetch wrapper + product endpoints
│       ├── hooks/useAsync.js  # loading / error / data / retry
│       ├── components/        # header, bottom nav, product card, variant
│       │                      # selector, EMI plan card, checkout modal, …
│       └── pages/             # ShopPage, MarketplacePage, ProductPage, …
└── package.json               # root scripts (setup / dev / seed / build / start)
```

**Frontend data flow** — no product data is hardcoded in the UI:

```
MarketplacePage / ProductPage
  └─ useAsync(fetchProducts | fetchProduct(slug))     ← custom hook: { data, loading, error, reload }
       └─ api/products.js  →  api/client.js           ← unwraps { data }, throws ApiError
            └─ GET /api/products | /api/products/:slug
                 └─ Express route → productRepository → SQLite (auto-seeded)
```

---

## ☁️ Deployment

The app is a single Node service once built — deploy anywhere Node runs (Render, Railway,
Fly.io, a VPS). Suggested Render setup:

1. **Build command:** `npm run setup && npm run build`
2. **Start command:** `npm start`
3. Set env var `NODE_ENV=production` (optional — static serving is auto-detected from
   `client/dist`).

Product renders are shipped with the repo in `client/public/images/` (Vite copies them into
`dist` on build), so they work in dev and production without hotlinking: all iPhone 17 Pro
colourways, the Pixel 9 Pro colourways, the OnePlus 12 colourways and the Galaxy S24 Ultra
titanium violet shot. The remaining Galaxy colourways use remote demo photos with a graceful
fallback — swap them by adding a render to `client/public/images/` and pointing the variant at
`/images/<file>.png` in `server/src/seed/seedData.js`, then `npm run seed`.

No external database is needed: the SQLite file is created and auto-seeded on first boot.
Note that most free tiers use ephemeral disks, so the DB resets on redeploy — the app
auto-seeds itself again, which is fine for a demo. For persistent data, point `DB_PATH` at a
mounted volume or swap to Postgres/Atlas per the [Swapping the database](#swapping-the-database) section.

---

## 📋 Assignment Mapping

| 1Fi assignment requirement | Where it's implemented |
|---|---|
| Shop page with Top Brands / Nearby Stores / 1Fi Marketplace | [`ShopPage.jsx`](client/src/pages/ShopPage.jsx) — tabs + routes |
| Top Brands & Nearby Stores left blank | [`ComingSoonPage.jsx`](client/src/pages/ComingSoonPage.jsx) |
| Product listing, image, name, pricing | [`MarketplacePage.jsx`](client/src/pages/MarketplacePage.jsx) + [`ProductCard.jsx`](client/src/components/ProductCard.jsx) |
| Product variants | [`VariantSelector.jsx`](client/src/components/VariantSelector.jsx) |
| EMI options/plans + selection | [`EmiPlanCard.jsx`](client/src/components/EmiPlanCard.jsx) |
| Product details (highlights/specs) | [`ProductPage.jsx`](client/src/pages/ProductPage.jsx) |
| CTA to proceed with selected plan | Proceed button → [`CheckoutModal.jsx`](client/src/components/CheckoutModal.jsx) → `POST /api/orders` |
| No hardcoded data — retrieved dynamically | Express + SQLite API (`server/src/routes`, `server/src/repositories`) |
| Loading & error states | `useAsync` hook, skeletons, `ErrorState`, `ErrorBoundary`, 404 page |

---

## 🧪 Possible Next Steps

- Filtering by brand / category chips (search is already in)
- Order history page backed by `GET /api/orders`
- Unit tests for `emi.js` and the API routes (Vitest + supertest)
- Swap SQLite → PostgreSQL/MongoDB via the repository layer