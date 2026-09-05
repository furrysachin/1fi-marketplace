import { cashbackAmount } from '../utils/emi.js';

/**
 * Data-access layer for orders.
 *
 * Prices are NEVER trusted from the client — every monetary field is
 * recomputed from the database rows for the given variant + plan.
 */

/** Human-readable, collision-resistant order id: 1FI-XXXXXX */
function generateOrderId() {
  const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // no ambiguous 0/O/1/I/L
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `1FI-${suffix}`;
}

/**
 * Creates an order for { variantId, planId }.
 * Throws Error('PLAN_MISMATCH') if the plan does not belong to the variant.
 * Returns null if either id does not exist.
 */
export function createOrder(db, { variantId, planId }) {
  const variant = db
    .prepare(
      `SELECT v.*, p.name AS product_name
       FROM variants v JOIN products p ON p.id = v.product_id
       WHERE v.id = ?`,
    )
    .get(variantId);
  if (!variant) return null;

  const plan = db.prepare('SELECT * FROM emi_plans WHERE id = ?').get(planId);
  if (!plan || plan.variant_id !== variant.id) {
    const err = new Error('The selected EMI plan does not belong to this variant.');
    err.code = 'PLAN_MISMATCH';
    throw err;
  }

  // Retry on the (very unlikely) id collision.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = generateOrderId();
    try {
      db.prepare(
        `INSERT INTO orders (
           id, variant_id, emi_plan_id, product_name, variant_name,
           product_price, monthly_amount, tenure_months, interest_rate,
           total_amount, cashback_amount, fund_name
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        id,
        variant.id,
        plan.id,
        variant.product_name,
        variant.name,
        variant.price,
        plan.monthly_amount,
        plan.tenure_months,
        plan.interest_rate_pct,
        plan.total_amount,
        cashbackAmount(
          plan.cashback_type ? { type: plan.cashback_type, value: plan.cashback_value } : null,
          variant.price,
        ),
        plan.fund_name,
      );

      return getOrder(db, id);
    } catch (err) {
      // SQLite: UNIQUE constraint violation → regenerate and retry
      if (!String(err.message).includes('UNIQUE')) throw err;
    }
  }
  throw new Error('Could not generate a unique order id.');
}

const orderRow = (row) => ({
  id: row.id,
  status: row.status,
  createdAt: row.created_at,
  product: { name: row.product_name, variant: row.variant_name, price: row.product_price },
  emi: {
    monthlyAmount: row.monthly_amount,
    tenureMonths: row.tenure_months,
    interestRatePct: row.interest_rate,
    totalAmount: row.total_amount,
    cashbackAmount: row.cashback_amount,
    fundName: row.fund_name,
  },
});

export function getOrder(db, id) {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(String(id));
  return row ? orderRow(row) : null;
}

export function listOrders(db, { limit = 20 } = {}) {
  const rows = db
    .prepare('SELECT * FROM orders ORDER BY created_at DESC, id DESC LIMIT ?')
    .all(Math.min(Number(limit) || 20, 100));
  return rows.map(orderRow);
}
