import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Award, Sparkles } from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryNav } from '../components/CategoryNav';
import { ProductCard } from '../components/ProductCard';
import { mockProducts } from '../data/mockCatalog';

export const HomePage: React.FC = () => {
  const featuredProducts = mockProducts.filter((p) => p.isFeatured);
  const bestSellers = mockProducts.slice(0, 4);

  return (
    <div className="space-y-12 sm:space-y-16">
      
      {/* Hero Section */}
      <HeroBanner />

      {/* Category Navigation Showcase */}
      <CategoryNav />

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Gear</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Featured Innovations
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group transition-colors"
          >
            <span>Browse All {mockProducts.length} Items</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Studio Banner / Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-8 sm:p-12 lg:p-16">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-md">
              Acoustic Mastery
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Pure Sound. Zero Distraction.
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Experience the clarity of custom titanium drivers tuned for spatial balance. Connect simultaneously to your workstation and smartphone with zero latency.
            </p>
            <div className="pt-2">
              <Link
                to="/products?category=audio-acoustics"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs sm:text-sm transition-all shadow-lg"
              >
                <span>Shop Audio Systems</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 lg:opacity-30 pointer-events-none hidden sm:block">
            <img
              src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
              alt="Headphones ambient"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Best Sellers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Trending in India</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Top Customer Favorites
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group transition-colors"
          >
            <span>View Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Engineering Philosophy & Trust Badges */}
      <section className="border-t border-slate-800/80 bg-slate-950/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              The NEXUS Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Built for Those Who Build
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every product in our catalog passes rigorous acoustic, tactile, and material resilience benchmarks before listing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white">Aerospace-Grade Materials</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Grade 5 titanium bezels, 6063 CNC milled aluminum plates, and GOTS-certified organic cotton.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white">100% Authentic & Verified</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every unit comes with an encrypted serial verification code and full domestic manufacturer warranty.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white">Razorpay Direct Processing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless checkout with instant UPI QR, all credit/debit cards, net banking, and no-cost EMI options.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
