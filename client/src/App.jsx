import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import AppHeader from './components/AppHeader.jsx';
import BottomNav from './components/BottomNav.jsx';
import ShopPage from './pages/ShopPage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import ComingSoonPage from './pages/ComingSoonPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/shop/marketplace" replace />} />
          <Route path="/shop" element={<ShopPage />}>
            <Route index element={<Navigate to="/shop/marketplace" replace />} />
            <Route path="top-brands" element={<ComingSoonPage />} />
            <Route path="nearby-stores" element={<ComingSoonPage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
          </Route>
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}