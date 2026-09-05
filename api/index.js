/**
 * Vercel serverless entry — catches everything under /api/*.
 *
 * The whole Express app (app.js) is reused here, so the exact same
 * routes/repos/DB power both local dev and production serverless.
 * SQLite lives at /tmp on Vercel (ephemeral) and auto-seeds per boot.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Point the DB at a writable location before the app opens it.
process.env.DB_PATH = process.env.DB_PATH ?? '/tmp/marketplace.db';

const [{ default: app }, { openDb }] = await Promise.all([
  import('../server/src/app.js'),
  import('../server/src/db.js'),
]);

// Initialize DB + auto-seed during cold start (app.js also does this, but
// warming it here keeps the first request snappy and surfaces errors early).
openDb();

export default app;
