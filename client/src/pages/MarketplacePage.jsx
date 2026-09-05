import { useMemo, useState } from 'react';
import { BadgePercent, Search, SearchX, TrendingUp, X } from 'lucide-react';
import { fetchProducts } from '../api/products.js';
import { useAsync } from '../hooks/useAsync.js';
import usePageTitle from '../hooks/usePageTitle.js';
import ProductCard from '../components/ProductCard.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';

const sortOptions = [
  { value: 'featured', label: 'Sort: Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Discount: High to Low' },
];

function compareBy(sort, a, b) {
  switch (sort) {
    case 'price-asc':
      return a.priceFrom - b.priceFrom;
    case 'price-desc':
      return b.priceFrom - a.priceFrom;
    case 'discount':
      return b.discountPct - a.discountPct;
    default:
      return a.id - b.id;
  }
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="aspect-square animate-pulse bg-ink-100" />
          <div className="space-y-2 p-3.5">
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-ink-100" />
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-ink-100" />
            <div className="h-3.5 w-2/5 animate-pulse rounded bg-ink-100" />
            <div className="h-6 w-1/2 animate-pulse rounded-full bg-ink-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MarketplacePage() {
  usePageTitle('1Fi Marketplace — Smartphones on EMI');
  const { data: products, loading, error, reload } = useAsync(fetchProducts, []);
  const [sort, setSort] = useState('featured');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    if (!products) return [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q),
        )
      : products;
    return [...filtered].sort((a, b) => compareBy(sort, a, b));
  }, [products, sort, query]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-ink-900">1Fi Marketplace</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
            <TrendingUp size={14} className="text-brand-600" />
            Smartphones on EMI — 0% interest plans available
          </p>
        </div>
        {products && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search brand or model…"
                aria-label="Search products"
                className="w-44 rounded-xl border border-ink-100 bg-white py-2 pl-9 pr-8 text-sm font-medium text-ink-700 shadow-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none sm:w-56"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink-400 transition hover:bg-ink-50 hover:text-ink-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
              className="rounded-xl border border-ink-100 bg-white px-3 py-2 text-sm font-medium text-ink-700 shadow-sm focus:border-brand-500 focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
        <BadgePercent size={13} className="text-emerald-600" />
        Plans backed by 1Fi mutual funds — your money keeps earning while you pay.
      </p>

      <div className="mt-5">
        {loading && <SkeletonGrid />}

        {error && (
          <ErrorState
            title="Couldn't load products"
            message={error.message}
            onRetry={reload}
          />
        )}

        {!loading && !error && visible.length === 0 && (
          products && query ? (
            <EmptyState
              icon={SearchX}
              title={`No matches for “${query.trim()}”`}
              subtitle="Try a different brand or model name — e.g. “iPhone” or “Samsung”."
              action={
                <button type="button" onClick={() => setQuery('')} className="btn-secondary mt-1">
                  Clear search
                </button>
              }
            />
          ) : (
            <ErrorState title="No products found" message="Try again in a little while." onRetry={reload} />
          )
        )}

        {!loading && !error && visible.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}