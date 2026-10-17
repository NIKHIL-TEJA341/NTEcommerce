import React from 'react';
import {
  ShieldCheck,
  Lock,
  Package,
  Zap,
  ArrowRight,
  Headphones,
  Sparkles,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/format';

export const LandingGatePage: React.FC = () => {
  const { loginWithGoogle, isLoading, error, clearError } = useAuthStore();

  const handleContinueWithGoogle = async () => {
    try {
      await loginWithGoogle('/');
    } catch (err) {
      console.error('Google Sign-In failed:', err);
    }
  };

  const previewItems = [
    {
      title: 'Aura Studio ANC Headphones',
      category: 'Audio & Acoustics',
      price: 1,
      originalPrice: 2,
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      badge: 'Bestseller',
      spec: '40mm Titanium Drivers • 45h Playback',
    },
    {
      title: 'Apex Chrono Titanium Watch',
      category: 'Smart Wearables',
      price: 2,
      originalPrice: 3,
      image:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      badge: 'Grade 5 Titanium',
      spec: 'Sapphire Crystal • 100m Water Resistant',
    },
    {
      title: 'Vortex 75 Custom Keyboard',
      category: 'Computing & Studio',
      price: 3,
      originalPrice: 4,
      image:
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      badge: 'Gasket Mount',
      spec: 'Hot-Swappable • Sound Damping Foam',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/15 via-violet-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 -right-48 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
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
          </div>

          {/* Top Trust Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Google Portal</span>
            </div>

            <button
              onClick={handleContinueWithGoogle}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold shadow-md shadow-white/5 active:scale-95 transition-all cursor-pointer"
            >
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
              <span>Continue with Google</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section with Google Auth Card */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        
        {/* Error Alert */}
        {error && (
          <div className="max-w-xl mx-auto p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Authentication Notice</span>
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-rose-400 hover:text-rose-200 text-[11px] font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Centerpiece */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exclusive Studio Equipment & Creator Acoustics</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Engineered For Sound.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200">
              Built For Masters.
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to NEXUS. Sign in with your Google account to enter the store, access member-only equipment drops, and manage your personalized orders and delivery tracking across India.
          </p>

          {/* The Focal Google Auth Card */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/15 relative overflow-hidden space-y-5">
              
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold block">
                  Customer Gateway
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  Continue with Google to Enter
                </h3>
                <p className="text-xs text-slate-400">
                  New customers are automatically registered. Existing orders link instantly.
                </p>
              </div>

              {/* Big Primary Google Button */}
              <button
                onClick={handleContinueWithGoogle}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3.5 py-4 px-6 bg-white hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl shadow-xl shadow-white/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span className="text-sm font-bold tracking-tight">
                  {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Verified Identity Badge Footnote */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Verified Accounts</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Supabase OAuth 2.0</span>
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Isolated Customer Accounts</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every customer gets a dedicated personal dashboard. Order summaries, tracking IDs, and invoices sync directly to your Google identity.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Razorpay Test Checkout</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experience seamless payments powered by Razorpay's official gateway with support for UPI, Cards, and NetBanking simulation in ₹ INR.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Zero Password Friction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No forms, no password resets, no dummy accounts. One authentic Google authorization verifies your email and grants immediate entry.
            </p>
          </div>
        </div>

        {/* Visual Hardware Preview Showcase ("Home Page Like Design") */}
        <div className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                Catalog Preview
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Studio Gear Waiting Inside
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Sign in with Google to explore full technical specifications, audio benchmarks, and customize variants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {previewItems.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel rounded-3xl border border-slate-800 overflow-hidden flex flex-col group hover:border-indigo-500/40 transition-all shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-indigo-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                    {item.badge}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-white text-base leading-snug group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400">{item.spec}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs line-through text-slate-500 mr-2">
                        {formatPrice(item.originalPrice)}
                      </span>
                      <span className="text-base font-extrabold text-white">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    <button
                      onClick={handleContinueWithGoogle}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Unlock Access</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/20 text-center space-y-6 shadow-2xl">
          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to Upgrade Your Studio?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              One click with your Google account opens the entire NEXUS catalog with immediate checkout access.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleContinueWithGoogle}
              disabled={isLoading}
              className="inline-flex items-center gap-3 py-3.5 px-6 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-xl transition-all cursor-pointer"
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
              <span className="text-sm">Continue with Google</span>
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">NEXUS.</span>
            <span>All Indian studio orders dispatched from Bangalore, Karnataka</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Razorpay Verified Gateway</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
