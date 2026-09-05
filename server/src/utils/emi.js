/**
 * EMI + cashback helpers.
 *
 * Standard reducing-balance EMI formula:
 *   monthly = P · r · (1 + r)^n / ((1 + r)^n − 1)
 * where P = principal, r = monthly rate, n = tenure in months.
 */

export function emiFor(principal, tenureMonths, annualRatePct) {
  if (!principal || !tenureMonths) return 0;
  if (annualRatePct === 0) return Math.ceil(principal / tenureMonths);

  const r = annualRatePct / 12 / 100;
  const factor = Math.pow(1 + r, tenureMonths);
  return Math.ceil((principal * r * factor) / (factor - 1));
}

/** Flat or percentage cashback in ₹ for a given plan. */
export function cashbackAmount(cashback, price) {
  if (!cashback || !cashback.type) return 0;
  return cashback.type === 'percent'
    ? Math.round((price * cashback.value) / 100)
    : cashback.value;
}

export function discountPercent(mrp, price) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}