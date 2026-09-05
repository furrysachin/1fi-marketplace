import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  CircleDollarSign,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { fetchProduct } from '../api/products.js';
import { useAsync } from '../hooks/useAsync.js';
import usePageTitle from '../hooks/usePageTitle.js';
import { formatINR, formatRate, plural } from '../utils/format.js';

import ProductImage from '../components/ProductImage.jsx';
import VariantSelector from '../components/VariantSelector.jsx';
import EmiPlanCard from '../components/EmiPlanCard.jsx';
import CheckoutModal from '../components/CheckoutModal.jsx';
import ErrorState from '../components/ErrorState.jsx';

function PageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-56 rounded bg-ink-100" />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="aspect-square rounded-2xl bg-ink-100" />
        <div className="space-y-4">
          <div className="h-4 w-20 rounded bg-ink-100" />
          <div className="h-7 w-3/4 rounded bg-ink-100" />
          <div className="h-6 w-1/2 rounded bg-ink-100" />
          <div className="h-24 rounded-xl bg-ink-100" />
          <div className="h-40 rounded-2xl bg-ink-100" />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const loadProduct = useCallback(() => fetchProduct(slug), [slug]);
  const { data: product, loading, error, reload } = useAsync(loadProduct, [slug]);

  const [planId, setPlanId] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Selected variant lives in the URL (?variant=Silver · 256 GB) so product
  // links are shareable and survive reloads. Falls back to the first variant.
  const variant = useMemo(() => {
    if (!product?.variants?.length) return null;
    const requested = searchParams.get('variant');
    return (
      product.variants.find(
        (v) => v.name === requested || String(v.id) === requested,
      ) ?? product.variants[0]
    );
  }, [product, searchParams]);

  const variantId = variant?.id ?? null;

  // Reset the plan to the variant's featured option whenever the variant changes
  useEffect(() => {
    if (!variant) return;
    const featured = variant.emiPlans.find((p) => p.isFeatured) ?? variant.emiPlans[0];
    setPlanId(featured?.id ?? null);
  }, [variantId]); // eslint-disable-line react-hooks/exhaustive-deps

  const plan = useMemo(() => {
    if (!variant) return null;
    return (
      variant.emiPlans.find((p) => p.id === planId) ??
      variant.emiPlans.find((p) => p.isFeatured) ??
      variant.emiPlans[0] ??
      null
    );
  }, [variant, planId]);

  const handleVariantChange = (nextId) => {
    const next = product.variants.find((v) => v.id === nextId);
    if (!next) return;
    setSearchParams({ variant: next.name }, { replace: true });
  };

  // Per-product browser title + meta description (must run on every render)
  usePageTitle(product ? `${product.name} · 1Fi Marketplace` : null);
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    if (product && meta) meta.setAttribute('content', product.description.slice(0, 155));
  }, [product]);

  if (loading) {
    return (
      <div>
        <div className="h-4 w-56 rounded bg-ink-100" />
        <div className="mt-6">
          <PageSkeleton />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Link
          to="/shop/marketplace"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
        >
          <ArrowLeft size={16} />
          Back to 1Fi Marketplace
        </Link>
        <ErrorState
          title="Couldn't load this product"
          message={error?.message ?? 'The product may no longer be available.'}
          onRetry={reload}
        />
      </div>
    );
  }

  const discount = variant && variant.mrp > variant.price
    ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)
    : 0;

  // Cheapest monthly payment across the variant's plans ("EMI from" semantics)
  const emiFrom = variant
    ? Math.min(...variant.emiPlans.map((p) => p.monthlyAmount))
    : null;

  return (
    <div>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-500">
        <Link to="/shop/marketplace" className="transition hover:text-ink-900">
          1Fi Marketplace
        </Link>
        <ChevronRight size={13} />
        <span className="truncate font-semibold text-ink-900">{product.name}</span>
      </nav>

      <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="card overflow-hidden bg-white p-4 sm:p-6">
          <ProductImage
            src={variant?.image}
            alt={`${product.name} — ${variant?.name ?? ''}`}
            className="aspect-square w-full rounded-2xl"
          />
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-500">
            <BadgeCheck size={14} className="text-emerald-600" />
            In stock · Ships in 2–3 days · 1-year brand warranty
          </p>
        </div>

        {/* Details */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
            {product.brand}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-ink-900 sm:text-3xl">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-extrabold text-ink-900">
              {formatINR(variant.price)}
            </span>
            {variant.mrp > variant.price && (
              <span className="text-lg text-ink-500 line-through">{formatINR(variant.mrp)}</span>
            )}
            {discount > 0 && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                {discount}% off
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-500">
            MRP inclusive of all taxes · EMI from {formatINR(emiFrom)}/mo
          </p>

          {/* Variants */}
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-bold text-ink-900">
              Variant <span className="font-normal text-ink-500">— {variant.name}</span>
            </h2>
            <VariantSelector
              variants={product.variants}
              selectedId={variant.id}
              onSelect={handleVariantChange}
            />
          </div>

          {/* EMI plans */}
          <section className="mt-7" aria-labelledby="emi-heading">
            <div className="flex items-center justify-between gap-2">
              <h2 id="emi-heading" className="text-sm font-bold text-ink-900">
                EMI plans
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                <CircleDollarSign size={13} />
                Backed by mutual funds
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {variant.emiPlans.map((p) => (
                <EmiPlanCard
                  key={p.id}
                  plan={p}
                  selected={p.id === plan?.id}
                  onSelect={() => setPlanId(p.id)}
                />
              ))}
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-500">
              <Sparkles size={13} className="mt-0.5 shrink-0 text-brand-600" />
              With 1Fi EMI, your instalments are backed by {plan?.fundName ?? 'a mutual fund'} — your
              money stays invested and keeps growing while you pay.
            </p>
          </section>

          {/* CTA */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              disabled={!plan}
              className="btn-primary w-full py-4 text-base"
            >
              {plan
                ? `Proceed with ${plural(plan.tenureMonths, 'month')} plan · ${formatINR(plan.monthlyAmount)}/mo`
                : 'Select an EMI plan to continue'}
            </button>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-ink-500">
              <ShieldCheck size={13} className="text-emerald-600" />
              No-cost EMI available · No hidden charges
            </p>
          </div>
        </div>
      </div>

      {/* Highlights + specs */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-sm font-bold text-ink-900">Highlights</h2>
          <ul className="mt-3 space-y-2.5">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2 text-sm text-ink-700">
                <BadgeCheck size={16} className="mt-0.5 shrink-0 text-brand-500" />
                {highlight}
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-bold text-ink-900">Specifications</h2>
          <dl className="mt-3 divide-y divide-ink-100">
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-4 py-2.5 text-sm">
                <dt className="text-ink-500">{spec.label}</dt>
                <dd className="text-right font-semibold text-ink-900">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {checkoutOpen && plan && (
        <CheckoutModal
          product={product}
          variant={variant}
          plan={plan}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  );
}