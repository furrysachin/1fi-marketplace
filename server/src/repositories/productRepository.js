/**
 * Data-access layer for products.
 *
 * All SQL lives here; routes/controllers only deal with plain JS
 * objects. Swapping SQLite for PostgreSQL/MongoDB means rewriting
 * just this file (the API contract stays the same).
 */

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

const productRow = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  brand: row.brand,
  category: row.category,
  description: row.description,
  highlights: parseJson(row.highlights, []),
  specs: parseJson(row.specs, []),
  featuredImage: row.featured_image,
});

const variantRow = (row) => ({
  id: row.id,
  name: row.name,
  color: row.color,
  finish: row.finish,
  storage: row.storage,
  swatch: row.swatch,
  mrp: row.mrp,
  price: row.price,
  image: row.image,
});

const planRow = (row) => ({
  id: row.id,
  tenureMonths: row.tenure_months,
  interestRatePct: row.interest_rate_pct,
  monthlyAmount: row.monthly_amount,
  totalAmount: row.total_amount,
  cashback: row.cashback_value
    ? { type: row.cashback_type, value: row.cashback_value }
    : null,
  fundName: row.fund_name,
  isFeatured: Boolean(row.is_featured),
});

/** List products with computed summary fields (for the marketplace grid). */
export function listProducts(db) {
  const products = db
    .prepare('SELECT * FROM products ORDER BY sort_order ASC, id ASC')
    .all();

  const priceStats = db
    .prepare(`
      SELECT product_id,
             MIN(price)  AS price_from,
             MIN(mrp)    AS mrp_from,
             COUNT(*)    AS variant_count
      FROM variants GROUP BY product_id
    `)
    .all();

  const emiStats = db
    .prepare(`
      SELECT v.product_id, MIN(e.monthly_amount) AS emi_from
      FROM emi_plans e
      JOIN variants v ON v.id = e.variant_id
      GROUP BY v.product_id
    `)
    .all();

  const priceByProduct = new Map(priceStats.map((r) => [r.product_id, r]));
  const emiByProduct = new Map(emiStats.map((r) => [r.product_id, r.emi_from]));

  return products.map((row) => {
    const stats = priceByProduct.get(row.id);
    const priceFrom = stats?.price_from ?? 0;
    const mrpFrom = stats?.mrp_from ?? priceFrom;
    return {
      ...productRow(row),
      priceFrom,
      mrpFrom,
      discountPct: mrpFrom > priceFrom ? Math.round(((mrpFrom - priceFrom) / mrpFrom) * 100) : 0,
      emiFrom: emiByProduct.get(row.id) ?? null,
      variantCount: stats?.variant_count ?? 0,
    };
  });
}

/** Full product detail: variants, each with its EMI plans. */
export function getProduct(db, idOrSlug) {
  const isNumeric = /^\d+$/.test(String(idOrSlug));
  const row = isNumeric
    ? db.prepare('SELECT * FROM products WHERE id = ?').get(Number(idOrSlug))
    : db.prepare('SELECT * FROM products WHERE slug = ?').get(String(idOrSlug));

  if (!row) return null;

  const variants = db
    .prepare('SELECT * FROM variants WHERE product_id = ? ORDER BY id ASC')
    .all(row.id)
    .map((variant) => {
      const plans = db
        .prepare('SELECT * FROM emi_plans WHERE variant_id = ? ORDER BY tenure_months ASC')
        .all(variant.id)
        .map(planRow);
      return { ...variantRow(variant), emiPlans: plans };
    });

  return { ...productRow(row), variants };
}

export function countProducts(db) {
  return db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
}