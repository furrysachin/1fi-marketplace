import { openDb, closeDb } from '../db.js';
import { emiFor, cashbackAmount } from '../utils/emi.js';
import { products } from './seedData.js';

/**
 * Wipes and reseeds the database from the dataset in seedData.js.
 * EMI amounts are computed here via the standard EMI formula —
 * nothing is hardcoded.
 *
 * Run standalone:  node src/seed/seed.js
 * The server also auto-seeds on boot if the products table is empty,
 * so fresh deployments work with zero setup.
 */
export function seedDatabase(db = openDb()) {
  db.exec('DELETE FROM emi_plans;');
  db.exec('DELETE FROM variants;');
  db.exec('DELETE FROM products;');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('products','variants','emi_plans');");

  const insertProduct = db.prepare(`
    INSERT INTO products
      (slug, name, brand, category, description, highlights, specs, featured_image, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertVariant = db.prepare(`
    INSERT INTO variants
      (product_id, name, color, finish, storage, swatch, mrp, price, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertPlan = db.prepare(`
    INSERT INTO emi_plans
      (variant_id, tenure_months, interest_rate_pct, monthly_amount,
       total_amount, cashback_type, cashback_value, fund_name, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let productCount = 0;
  let variantCount = 0;
  let planCount = 0;

  for (const [index, product] of products.entries()) {
    const { lastInsertRowid: productId } = insertProduct.run(
      product.slug,
      product.name,
      product.brand,
      product.category,
      product.description,
      JSON.stringify(product.highlights),
      JSON.stringify(product.specs),
      product.variants[0].image,
      index,
    );

    for (const variant of product.variants) {
      const { lastInsertRowid: variantId } = insertVariant.run(
        productId,
        variant.name,
        variant.color,
        variant.finish,
        variant.storage,
        variant.swatch,
        variant.mrp,
        variant.price,
        variant.image,
      );

      for (const plan of product.plans) {
        const monthly = emiFor(variant.price, plan.tenure, plan.rate);
        const cashback = cashbackAmount(plan.cashback, variant.price);
        // No-cost (0%) plans: total payable = exactly the product price, so
        // rounding of equal monthly instalments never looks like a hidden charge.
        const total = plan.rate === 0 ? variant.price : monthly * plan.tenure;
        insertPlan.run(
          variantId,
          plan.tenure,
          plan.rate,
          monthly,
          total,
          plan.cashback?.type ?? null,
          cashback > 0 ? cashback : null,
          plan.fund,
          plan.featured ? 1 : 0,
        );
        planCount += 1;
      }
      variantCount += 1;
    }
    productCount += 1;
  }

  return { products: productCount, variants: variantCount, plans: planCount };
}

// Run directly when invoked as a CLI script
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const db = openDb();
  const counts = seedDatabase(db);
  console.log(`Seeded ${counts.products} products, ${counts.variants} variants, ${counts.plans} EMI plans.`);
  closeDb();
}