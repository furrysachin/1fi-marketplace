import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, X } from 'lucide-react';
import { formatINR, formatRate, plural } from '../utils/format.js';
import { placeOrder } from '../api/orders.js';
import ProductImage from './ProductImage.jsx';

export default function CheckoutModal({ product, variant, plan, onClose }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);

  // idle → placing → placed | failed
  const [status, setStatus] = useState('idle');
  const [order, setOrder] = useState(null);
  const [orderError, setOrderError] = useState(null);

  // Move focus into the dialog when it opens
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Close on Escape + lock body scroll while open
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && status !== 'placing') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, status]);

  const rows = [
    { label: 'Tenure', value: plural(plan.tenureMonths, 'month') },
    { label: 'Monthly payment', value: `${formatINR(plan.monthlyAmount)}/mo` },
    { label: 'Interest rate', value: formatRate(plan.interestRatePct) },
    { label: 'Total payable', value: formatINR(plan.totalAmount) },
    plan.cashback && {
      label: 'Cashback',
      value: `${formatINR(plan.cashback.value)} to 1Fi wallet`,
      highlight: true,
    },
    { label: 'Backed by', value: plan.fundName },
  ].filter(Boolean);

  const handleConfirm = async () => {
    setStatus('placing');
    setOrderError(null);
    try {
      const placed = await placeOrder({ variantId: variant.id, planId: plan.id });
      setOrder(placed);
      setStatus('placed');
    } catch (err) {
      setOrderError(err.message || 'Could not place the order. Please try again.');
      setStatus('failed');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => status !== 'placing' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={status === 'placed' ? 'Order confirmed' : 'Confirm EMI plan'}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h2 className="text-base font-bold text-ink-900">
            {status === 'placed' ? 'Order confirmed' : 'Confirm your EMI plan'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={status === 'placing'}
            aria-label="Close"
            className="rounded-full p-1.5 text-ink-500 transition hover:bg-ink-50 hover:text-ink-900 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {status === 'placed' && order ? (
          <div className="px-6 py-8 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={34} />
              </span>
            <h3 className="mt-4 text-xl font-extrabold text-ink-900">You&apos;re all set!</h3>
            <p className="mt-1 text-sm text-ink-500">
              Order <span className="font-mono font-semibold text-ink-700">{order.id}</span> placed
              for the {order.product.variant} {order.product.name}.
            </p>

            <div className="mt-6 rounded-2xl bg-ink-50 p-4 text-left text-sm">
              <p className="font-semibold text-ink-900">
                Pay {formatINR(order.emi.monthlyAmount)}/mo for{' '}
                {plural(order.emi.tenureMonths, 'month')}
              </p>
              {order.emi.cashbackAmount > 0 && (
                <p className="mt-1 text-emerald-700">
                  {formatINR(order.emi.cashbackAmount)} cashback will be credited to your 1Fi
                  wallet.
                </p>
              )}
              <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
                <ShieldCheck size={14} className="text-brand-600" />
                Order saved to the database — no real payment was made.
              </p>
              <p className="mt-1 text-[11px] text-ink-400">
                Created {new Date(`${order.createdAt.replace(' ', 'T')}Z`).toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/shop/marketplace');
              }}
              className="btn-primary mt-6 w-full"
            >
              Back to Marketplace
            </button>
          </div>
        ) : (
          <div className="px-6 py-5">
            {/* Product summary */}
            <div className="flex items-center gap-3 rounded-2xl border border-ink-100 p-3">
              <ProductImage
                src={variant.image}
                alt={product.name}
                className="h-16 w-16 shrink-0 rounded-xl"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-900">{product.name}</p>
                <p className="text-xs text-ink-500">{variant.name}</p>
                <p className="mt-0.5 text-sm font-bold text-brand-600">
                  {formatINR(variant.price)}{' '}
                  <span className="text-xs font-medium text-ink-500 line-through">
                    {formatINR(variant.mrp)}
                  </span>
                </p>
              </div>
            </div>

            {/* Plan summary */}
            <dl className="mt-4 divide-y divide-ink-100 rounded-2xl border border-ink-100 text-sm">
              {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="text-ink-500">{row.label}</dt>
                  <dd className={`text-right font-semibold ${row.highlight ? 'text-emerald-700' : 'text-ink-900'}`}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            {status === 'failed' && (
              <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {orderError}
              </p>
            )}

            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-500">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-brand-600" />
              Your instalments stay invested in {plan.fundName} while you pay — that&apos;s the 1Fi
              way. This is a demo, no real payment will be made.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={status === 'placing'}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={status === 'placing'}
                className="btn-primary flex-1 disabled:opacity-70"
              >
                {status === 'placing' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Placing…
                  </span>
                ) : (
                  'Confirm plan'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
