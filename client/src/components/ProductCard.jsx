import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { formatINR } from '../utils/format.js';
import ProductImage from './ProductImage.jsx';

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative overflow-hidden bg-white">
        <ProductImage
          src={product.featuredImage}
          alt={product.name}
          className="aspect-square w-full transition duration-300 group-hover:scale-[1.03]"
        />
        {product.discountPct > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            {product.discountPct}% off
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
          {product.brand}
        </p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink-900">
          {product.name}
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-ink-900">{formatINR(product.priceFrom)}</span>
          <span className="text-sm text-ink-500 line-through">{formatINR(product.mrpFrom)}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
            EMI from {formatINR(product.emiFrom)}/mo
          </span>
          <span className="flex items-center gap-1 text-[11px] text-ink-500">
            <Layers size={12} />
            {product.variantCount} variants
          </span>
        </div>
      </div>
    </Link>
  );
}