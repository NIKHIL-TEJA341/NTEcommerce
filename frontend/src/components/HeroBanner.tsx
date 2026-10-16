import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { mockProducts } from '../data/mockCatalog';
import { formatPrice } from '../utils/format';

export const HeroBanner: React.FC = () => {
  const addItem = useCartStore((state) => state.addItem);
  const flagshipProduct = mockProducts[0]; // Aura ANC Studio

  return (
    <div className="relative overflow-hidden pt-6 pb-12 sm:pb-20 lg:pt-10">
      {/* Background ambient glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>2026 Studio Collection — Live in India</span>
            </div>

            {/* Main title */}
            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Crafted For Focus.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-200">
                Engineered For Sound.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Discover audiophile-grade active noise cancellation, aerospace titanium timepieces, and CNC mechanical workstations designed for creators who demand perfection.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link
                to="/products"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all group"
              >
                <span>Explore Full Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/products?category=audio-acoustics"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-sm border border-slate-700/80 flex items-center justify-center transition-colors"
              >
                Shop Audio & Acoustics
              </Link>
            </div>

            {/* Key trust bullets */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Genuine Studio Hardware</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Razorpay Secured Checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pan-India 2-Day Dispatch</span>
              </div>
            </div>

          </div>

          {/* Right Column: Featured Hero Product Spotlight */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none glass-panel p-4 sm:p-6 rounded-3xl border border-indigo-500/20 shadow-2xl">
              
              {/* Product Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-indigo-400 tracking-wider uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                  Flagship Spotlight
                </span>
                <span className="text-xs text-emerald-400 font-medium">In Stock • 28 units</span>
              </div>

              {/* Main Image with Glow */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900/90 mb-5 group">
                <img
                  src={flagshipProduct.imageUrl}
                  alt={flagshipProduct.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                  <span className="bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md font-mono text-[11px]">
                    45H Playback • 40mm Titanium
                  </span>
                  <span className="text-amber-400 font-bold">★ 4.9</span>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                      {flagshipProduct.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      Titanium transducers with hybrid noise canceling.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-white">
                      {formatPrice(flagshipProduct.price)}
                    </span>
                    <span className="block text-xs text-slate-500 line-through">
                      {formatPrice(flagshipProduct.originalPrice!)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => addItem(flagshipProduct, 1)}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Quick Add to Cart</span>
                  </button>

                  <Link
                    to={`/products/${flagshipProduct.id}`}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
