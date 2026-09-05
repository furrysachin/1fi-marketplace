import { apiPost } from './client.js';

/**
 * POST /api/orders — place an order for a variant + EMI plan.
 * The server recomputes all pricing from the database; the client
 * sends only identifiers.
 */
export function placeOrder({ variantId, planId }) {
  return apiPost('/orders', { variantId, planId });
}
