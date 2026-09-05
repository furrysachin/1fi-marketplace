import { Router } from 'express';
import { createOrder, getOrder, listOrders } from '../repositories/orderRepository.js';
import { openDb } from '../db.js';

const router = Router();

/**
 * POST /api/orders
 * Body: { "variantId": 5, "planId": 23 }
 * All pricing is recomputed server-side from the DB — the client never
 * sends monetary values.
 */
router.post('/', (req, res) => {
  const { variantId, planId } = req.body ?? {};

  const vId = Number.parseInt(variantId, 10);
  const pId = Number.parseInt(planId, 10);
  if (!Number.isInteger(vId) || vId <= 0 || !Number.isInteger(pId) || pId <= 0) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Body must include a positive integer "variantId" and "planId".',
      },
    });
  }

  try {
    const order = createOrder(openDb(), { variantId: vId, planId: pId });
    if (!order) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Variant or plan not found.' },
      });
    }
    return res.status(201).json({ data: order });
  } catch (err) {
    if (err.code === 'PLAN_MISMATCH') {
      return res.status(409).json({
        error: { code: 'PLAN_MISMATCH', message: err.message },
      });
    }
    throw err;
  }
});

/**
 * GET /api/orders/:id — order confirmation lookup.
 */
router.get('/:id', (req, res) => {
  const order = getOrder(openDb(), req.params.id);
  if (!order) {
    return res.status(404).json({
      error: { code: 'ORDER_NOT_FOUND', message: 'Order not found.' },
    });
  }
  res.json({ data: order });
});

/**
 * GET /api/orders — recent orders (max 100, for demo/verification).
 */
router.get('/', (req, res) => {
  res.json({ data: listOrders(openDb(), { limit: req.query.limit }) });
});

export default router;
