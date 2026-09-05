/** Formats a rupee amount using Indian digit grouping, e.g. ₹1,24,999. */
export function formatINR(value) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`;
}

/** Formats a rate, e.g. 0 → "0% p.a.", 10.5 → "10.5% p.a.". */
export function formatRate(rate) {
  return `${rate}% p.a.`;
}

/** Pluralisation helper, e.g. plural(3, 'month') → "3 months". */
export function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}