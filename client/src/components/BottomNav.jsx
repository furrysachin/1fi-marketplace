import { Home, TrendingUp, ShoppingBag, Wallet, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { label: 'Home', icon: Home },
  { label: 'Invest', icon: TrendingUp },
  { label: 'Shop', icon: ShoppingBag, to: '/shop/marketplace' },
  { label: 'Portfolio', icon: Wallet },
  { label: 'Profile', icon: User },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 backdrop-blur"
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch justify-around">
        {items.map(({ label, icon: Icon, to }) =>
          to ? (
            <li key={label} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition ${
                    isActive ? 'text-brand-600' : 'text-ink-500 hover:text-ink-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ) : (
            <li key={label} className="flex-1">
              <button
                type="button"
                title="Coming soon in this demo"
                disabled
                className="flex w-full cursor-not-allowed flex-col items-center gap-1 py-2.5 text-[10px] font-semibold text-ink-200"
              >
                <Icon size={20} />
                {label}
              </button>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}