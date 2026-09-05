import app from './app.js';

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`1Fi Marketplace API running at http://localhost:${PORT}`);
});
