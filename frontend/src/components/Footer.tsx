import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Headphones, CreditCard } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm mt-20">
      {/* Value propositions banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-200 font-semibold text-xs tracking-wide">All-India Fast Shipping</h4>
                <p className="text-slate-400 text-xs">Free shipping on orders above ₹1,999</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-200 font-semibold text-xs tracking-wide">Razorpay Protected</h4>
                <p className="text-slate-400 text-xs">UPI, Cards, EMI & Net Banking secure</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-200 font-semibold text-xs tracking-wide">7-Day Replacement</h4>
                <p className="text-slate-400 text-xs">Hassle-free guarantee for verified orders</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-slate-200 font-semibold text-xs tracking-wide">Direct Studio Support</h4>
                <p className="text-slate-400 text-xs">Dedicated technical & warranty assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white text-base">
                N
              </div>
              <span className="text-lg font-bold text-white tracking-tight">NEXUS</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Engineered hardware, audiophile acoustics, and elevated workspace gear designed for creators, developers, and tech enthusiasts.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Razorpay Test Mode Active • ₹ INR Supported</span>
            </div>
          </div>

          <div>
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Shop Categories</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products?category=audio-acoustics" className="hover:text-indigo-400 transition-colors">Audio & Acoustics</Link></li>
              <li><Link to="/products?category=smart-wearables" className="hover:text-indigo-400 transition-colors">Smart Wearables</Link></li>
              <li><Link to="/products?category=computing-studio" className="hover:text-indigo-400 transition-colors">Computing & Studio</Link></li>
              <li><Link to="/products?category=minimalist-apparel" className="hover:text-indigo-400 transition-colors">Minimalist Apparel</Link></li>
              <li><Link to="/products?category=workspace-living" className="hover:text-indigo-400 transition-colors">Workspace Living</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Customer Service</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/orders" className="hover:text-indigo-400 transition-colors">Track Order</Link></li>
              <li><Link to="/products" className="hover:text-indigo-400 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/products" className="hover:text-indigo-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/products" className="hover:text-indigo-400 transition-colors">Warranty & Service</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">System & Tech</h5>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Full-stack architecture with React 19, TypeScript, Flask REST API, Supabase PostgreSQL, and Razorpay.
            </p>
            <div className="inline-block px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-indigo-400 font-mono">
              v1.0.0-MVP
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NEXUS Gear India. Portfolio Implementation.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Audited</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
