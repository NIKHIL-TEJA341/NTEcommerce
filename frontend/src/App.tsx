import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrdersPage } from './pages/OrdersPage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { LandingGatePage } from './pages/LandingGatePage';
import { Compass, RefreshCw } from 'lucide-react';
import { useAuthStore } from './store/authStore';

const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 mx-auto">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">404 - Page Not Found</h1>
      <p className="text-xs sm:text-sm text-slate-400">
        The destination you are looking for has been moved or doesn't exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
      >
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export const App: React.FC = () => {
  const initAuth = useAuthStore((state) => state.initAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Loading state while verifying existing Supabase session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-pulse">
          <span className="font-extrabold text-2xl text-white tracking-wider">N</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Verifying secure Google session...</span>
        </div>
      </div>
    );
  }

  // If not signed in with Google: show the Gateway landing page with Continue with Google
  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <LandingGatePage />
        <AuthModal />
      </BrowserRouter>
    );
  }

  // Once authenticated with Google, unlock full storefront application
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
        <ScrollToTop />
        <Navbar />
        <CartDrawer />
        <AuthModal />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<CatalogPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;

