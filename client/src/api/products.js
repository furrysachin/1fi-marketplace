import { apiGet } from './client.js';

/** GET /api/products — marketplace listing with summary pricing. */
export function fetchProducts() {
  return apiGet('/products');
}

/** GET /api/products/:slug — full detail with variants + EMI plans. */
export function fetchProduct(slug) {
  return apiGet(`/products/${encodeURIComponent(slug)}`);
}