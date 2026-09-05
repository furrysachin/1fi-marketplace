/**
 * Vercel serverless entry — catches everything under /api/*.
 *
 * Compiled as CommonJS (root package.json has no "type": "module"),
 * so the ESM Express app is lazily dynamic-imported on first request
 * and cached per lambda instance. SQLite lives at /tmp on Vercel
 * (writable but ephemeral) and auto-seeds on cold start.
 */

let cached = null;

async function getHandler() {
  if (!cached) {
    // Point the DB at a writable location before the app opens it.
    process.env.DB_PATH = process.env.DB_PATH ?? '/tmp/marketplace.db';
    const [{ default: app }, { openDb }] = await Promise.all([
      import('../server/src/app.js'),
      import('../server/src/db.js'),
    ]);
    openDb(); // init + auto-seed during cold start
    cached = app;
  }
  return cached;
}

module.exports = async function handler(req, res) {
  try {
    const app = await getHandler();
    return app(req, res);
  } catch (err) {
    console.error('[api] failed to initialize:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: { code: 'INTERNAL_ERROR', message: 'Server failed to initialize.' },
      }),
    );
  }
};
