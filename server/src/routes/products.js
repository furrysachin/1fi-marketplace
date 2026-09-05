import { Router } from 'express';
import { listProducts, getProduct } from '../repositories/productRepository.js';
import { openDb } from '../db.js';

const router = Router();

/**
 * GET /api/products
 * List all products with summary pricing + cheapest EMI.
 */
router.get('/', (req, res) => {
  const products = listProducts(openDb());
  res.json({ data: products });
});

/**
 * GET /api/products/:id
 * Full product detail (by numeric id or URL slug) including every
 * variant and its EMI plans.
 */
router.get('/:idOrSlug', (req, res) => {
  const product = getProduct(openDb(), req.params.idOrSlug);
  if (!product) {
    return res.status(404).json({
      error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' },
    });
  }
  res.json({ data: product });
});

export default router;