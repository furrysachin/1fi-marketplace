import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { openDb } from './db.js';
import { countProducts } from './repositories/productRepository.js';
import { seedDatabase } from './seed/seed.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');
const clientDist = path.resolve(serverRoot, '..', 'client', 'dist');

const app = express();
app.use(cors());
app.use(express.json());

// ---- Database (auto-seeds on first boot so fresh deployments work) ----
const db = openDb();
if (countProducts(db) === 0) {
  const counts = seedDatabase(db);
  console.log(`[db] empty database — auto-seeded ${counts.products} products, ${counts.variants} variants, ${counts.plans} plans.`);
}

// ---- API ----
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'connected',
    products: countProducts(db),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

// Unknown API routes → JSON 404 (never the SPA fallback)
app.use('/api', (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API endpoint not found.' } });
});

// ---- Static client (production) ----
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log(`[app] serving built client from ${clientDist}`);
} else {
  console.log('[app] client/dist not found — run `npm run build` to serve the UI from this server.');
}

// ---- Error handling ----
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on our side.' } });
});

export default app;
