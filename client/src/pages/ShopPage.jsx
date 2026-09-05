import { NavLink, Outlet } from 'react-router-dom';
import { Award, MapPin, ShoppingBag } from 'lucide-react';

const tabs = [
  { to: '/shop/top-brands', label: 'Top Brands', icon: Award },
  { to: '/shop/nearby-stores', label: 'Nearby Stores', icon: MapPin },
  { to: '/shop/marketplace', label: '1Fi Marketplace', icon: ShoppingBag },
];

export default function ShopPage() {
  return (
    <div>
      {/* Shop hero */}
      <div className="rounded-2xl bg-ink-900 px-5 py-6 text-white">
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400">Shop</p>
        <h1 className="mt-1 text-xl font-extrabold sm:text-2xl">
          Everything you love, on EMI backed by mutual funds
        </h1>
        <p className="mt-1.5 text-sm text-ink-100">
          Keep your money invested while you pay in easy instalments.
        </p>
      </div>

      {/* Segmented tabs */}
      <nav
        aria-label="Shop sections"
        className="sticky top-16 z-30 -mx-4 mt-4 border-b border-ink-100 bg-ink-50/95 px-4 backdrop-blur sm:-mx-6 sm:px-6"
      >
        <div className="flex gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-ink-900 text-white shadow-sm'
                    : 'bg-white text-ink-700 hover:bg-ink-100'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Active tab content */}
      <div className="mt-5">
        <Outlet />
      </div>
    </div>
  );
}