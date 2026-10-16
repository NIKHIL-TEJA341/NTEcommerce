import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ShieldCheck, User } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const cartCount = useCartStore((state) => state.getCartCount());
  const toggleCart = useCartStore((state) => state.toggleCart);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      {/* Top micro-announcement bar */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 py-1.5 px-4 text-xs text-slate-300 flex items-center justify-center gap-2 border-b border-indigo-900/30">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
        <span>Free Express Delivery Across India on orders above ₹1,999 • Razorpay Verified Test Gateway</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl text-white tracking-wider">N</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center">
                NEXUS<span className="text-indigo-400 ml-0.5">.</span>
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 font-medium uppercase -mt-1">
                Studio Gear
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <Link to="/products" className="hover:text-indigo-400 transition-colors">
              All Products
            </Link>
            <Link to="/products?category=audio-acoustics" className="hover:text-indigo-400 transition-colors">
              Audio
            </Link>
            <Link to="/products?category=smart-wearables" className="hover:text-indigo-400 transition-colors">
              Wearables
            </Link>
            <Link to="/products?category=computing-studio" className="hover:text-indigo-400 transition-colors">
              Studio & Gear
            </Link>
          </nav>

          {/* Search Form (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-xs mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search studio headphones, titanium..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Orders link */}
            <Link
              to="/orders"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Orders</span>
            </Link>

            {/* Admin portal link */}
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/30 transition-colors"
            >
              <span>Admin</span>
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white transition-all flex items-center justify-center group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-4 pb-6 space-y-4 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>

          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-indigo-400 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-indigo-400 transition-colors"
            >
              All Products
            </Link>
            <Link
              to="/products?category=audio-acoustics"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-indigo-400 transition-colors"
            >
              Audio & Acoustics
            </Link>
            <Link
              to="/products?category=smart-wearables"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-indigo-400 transition-colors"
            >
              Smart Wearables
            </Link>
            <Link
              to="/products?category=computing-studio"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-indigo-400 transition-colors"
            >
              Computing & Studio
            </Link>
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-indigo-400 transition-colors"
            >
              My Orders
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
