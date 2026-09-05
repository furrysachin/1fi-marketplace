import { formatINR } from '../utils/format.js';

export default function VariantSelector({ variants, selectedId, onSelect }) {
  const minPrice = Math.min(...variants.map((v) => v.price));

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="radiogroup" aria-label="Choose a variant">
      {variants.map((variant) => {
        const selected = variant.id === selectedId;
        const priceDiff = variant.price - minPrice;
        return (
          <button
            key={variant.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(variant.id)}
            className={`chip shrink-0 border ${
              selected
                ? 'border-brand-500 bg-brand-50 text-ink-900 ring-1 ring-brand-500'
                : 'border-ink-100 bg-white text-ink-700 hover:border-ink-200'
            }`}
          >
            <span
              className="h-4 w-4 shrink-0 rounded-full border border-ink-200"
              style={{ backgroundColor: variant.swatch }}
              aria-hidden="true"
            />
            <span className="flex flex-col items-start leading-tight">
              <span className="text-xs font-semibold">{variant.name}</span>
              <span className={`text-[11px] ${selected ? 'text-brand-700' : 'text-ink-500'}`}>
                {priceDiff > 0 ? `+${formatINR(priceDiff)}` : formatINR(variant.price)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}