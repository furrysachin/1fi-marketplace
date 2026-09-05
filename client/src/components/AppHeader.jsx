import { NavLink, Link } from 'react-router-dom';

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-base font-extrabold text-white">
        1
      </span>
      <span className="text-lg font-extrabold tracking-tight text-white">
        1Fi<span className="text-brand-400">.</span>
      </span>
    </span>
  );
}

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-900">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/shop/marketplace" aria-label="1Fi Marketplace home" className="rounded-lg">
          <Logo />
        </Link>

        <NavLink
          to="/shop/marketplace"
          className={({ isActive }) =>
            `rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              isActive ? 'bg-brand-500 text-white' : 'bg-white/10 text-white hover:bg-white/15'
            }`
          }
        >
          Shop
        </NavLink>
      </div>
    </header>
  );
}