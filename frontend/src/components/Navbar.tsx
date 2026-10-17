import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  Package,
  ChevronDown,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const cartCount = useCartStore((state) => state.getCartCount());
  const toggleCart = useCartStore((state) => state.toggleCart);

  const { user, isAuthenticated, openAuthModal, logout } = useAuthStore();

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      {/* Top micro-announcement bar */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 py-1.5 px-4 text-xs text-slate-300 flex items-center justify-center gap-2 border-b border-indigo-900/30">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
        <span>Free Express Delivery Across India • Razorpay Verified Test Gateway (₹1 – ₹3 Test Pricing)</span>
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
            
            {/* Orders Link */}
            <Link
              to="/orders"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-indigo-400" />
              <span>Orders</span>
            </Link>

            {/* Admin Portal Link */}
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/30 transition-colors"
            >
              <span>Admin</span>
            </Link>

            {/* Google Authentication Section */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white transition-all cursor-pointer"
                  aria-label="User Account Menu"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`}
                    alt={user.fullName}
                    className="w-6 h-6 rounded-lg object-cover ring-1 ring-indigo-500/50"
                  />
                  <span className="hidden sm:inline text-xs font-semibold max-w-[100px] truncate">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                    {/* Customer Profile Header */}
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 text-[10px] text-emerald-400 font-medium">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Google Verified Account</span>
                      </div>
                    </div>

                    {/* Menu Links */}
                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
                    >
                      <Package className="w-4 h-4 text-indigo-400" />
                      <span>My Order History</span>
                    </Link>

                    <Link
                      to="/products"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
                    >
                      <Search className="w-4 h-4 text-indigo-400" />
                      <span>Browse Catalog</span>
                    </Link>

                    <div className="border-t border-slate-800/80 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold shadow-md shadow-white/5 active:scale-95 transition-all cursor-pointer"
              >
                {/* Google Mini Icon */}
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="hidden sm:inline">Continue with Google</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}

            {/* Cart Trigger */}
            <button
              onClick={toggleCart}
              className="relative p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white transition-all flex items-center justify-center group cursor-pointer"
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
          {/* Mobile Auth Header */}
          {isAuthenticated && user ? (
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-9 h-9 rounded-xl object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-white">{user.fullName}</p>
                  <p className="text-[11px] text-slate-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal();
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-white text-slate-900 font-bold rounded-2xl text-xs shadow-md"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}

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
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-amber-400 hover:text-amber-300 transition-colors"
            >
              Admin Portal
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
