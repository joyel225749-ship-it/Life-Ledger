import { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar  from './components/Topbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import LoginPage        from './pages/LoginPage.jsx';
import RegisterPage     from './pages/RegisterPage.jsx';
import DashboardPage    from './pages/DashboardPage.jsx';
import ProductsPage     from './pages/ProductsPage.jsx';
import ProductFormPage  from './pages/ProductFormPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import DeadlinesPage    from './pages/DeadlinesPage.jsx';
import ReceiptsPage     from './pages/ReceiptsPage.jsx';
import SecondLifePage   from './pages/SecondLifePage.jsx';

const PAGE_LABELS = {
  '/': 'Overview',
  '/products': 'My products',
  '/products/new': 'Add product',
  '/deadlines': 'Deadlines',
  '/receipts': 'Receipts',
  '/second-life': 'Second-life guide',
};

function AppShell() {
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch]       = useState('');

  const label = Object.entries(PAGE_LABELS).find(([path]) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path)
  )?.[1] || 'LifeLedger';

  return (
    <div className="app-shell">
      {mobileNav && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileNav(false)}
          aria-hidden="true"
        />
      )}
      <Sidebar onClose={() => setMobileNav(false)} mobileOpen={mobileNav} />
      <main className="main">
        <Topbar
          activeLabel={label}
          search={search}
          setSearch={setSearch}
          onMenuClick={() => setMobileNav(v => !v)}
        />
        <Routes>
          <Route path="/"                   element={<DashboardPage />} />
          <Route path="/products"           element={<ProductsPage search={search} />} />
          <Route path="/products/new"       element={<ProductFormPage />} />
          <Route path="/products/:id"       element={<ProductDetailPage />} />
          <Route path="/products/:id/edit"  element={<ProductFormPage />} />
          <Route path="/deadlines"          element={<DeadlinesPage />} />
          <Route path="/receipts"           element={<ReceiptsPage />} />
          <Route path="/second-life"        element={<SecondLifePage />} />
          <Route path="*"                   element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/login"    element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={isLoggedIn ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
