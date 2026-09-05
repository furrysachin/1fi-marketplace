import { Check, Gift, LineChart, TrendingDown } from 'lucide-react';
import { formatINR, formatRate, plural } from '../utils/format.js';

export default function EmiPlanCard({ plan, selected, onSelect }) {
  const zeroInterest = plan.interestRatePct === 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500'
          : 'border-ink-100 bg-white hover:border-brand-200'
      }`}
    >
      {plan.isFeatured && (
        <span className="absolute right-3 top-3 rounded-full bg-ink-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Popular
        </span>
      )}

      <div className="flex items-center gap-4">
        {/* Tenure */}
        <div className="w-24 shrink-0">
          <p className="text-lg font-extrabold leading-none text-ink-900">
            {plan.tenureMonths}
            <span className="text-xs font-semibold text-ink-500"> months</span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-ink-500">
            {zeroInterest ? (
              <>
                <TrendingDown size={12} className="text-emerald-600" />
                <span className="text-emerald-700">0% interest</span>
              </>
            ) : (
              formatRate(plan.interestRatePct)
            )}
          </p>
        </div>

        {/* Amounts */}
        <div className="min-w-0 flex-1">
          <p className="text-xl font-extrabold text-brand-600">
            {formatINR(plan.monthlyAmount)}
            <span className="text-xs font-semibold text-ink-500">/mo</span>
          </p>
          <p className="mt-0.5 text-[11px] text-ink-500">
            Total {formatINR(plan.totalAmount)} · {plural(plan.tenureMonths, 'payment')}
          </p>
          {plan.cashback && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <Gift size={12} />
              Get {formatINR(plan.cashback.value)} cashback
            </p>
          )}
        </div>

        {/* Radio */}
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
            selected ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-200 bg-white'
          }`}
        >
          {selected && <Check size={12} strokeWidth={3.5} />}
        </span>
      </div>

      {/* Fund backing */}
      <p className="mt-3 flex items-center gap-1.5 border-t border-ink-100 pt-2.5 text-[11px] text-ink-500">
        <LineChart size={12} className="text-brand-600" />
        Instalments backed by <span className="font-semibold text-ink-700">{plan.fundName}</span>
      </p>
    </button>
  );
}