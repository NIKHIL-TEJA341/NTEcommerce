import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package, Truck, ShieldCheck, MapPin } from 'lucide-react';
import type { Order } from '../types';
import { formatPrice } from '../utils/format';

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'NX-2026-001';
  const orderId = searchParams.get('orderId');

  // Retrieve stored order
  let order: Order | null = null;
  const existingOrdersRaw = localStorage.getItem('nexus_orders');
  if (existingOrdersRaw) {
    const list: Order[] = JSON.parse(existingOrdersRaw);
    order = list.find((o) => o.id === orderId || o.orderNumber === orderNumber) || list[0] || null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      
      {/* Success Hero Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="inline-block text-xs font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Payment Verified • Razorpay Test Mode
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          We've received your order <strong className="text-white font-mono">{orderNumber}</strong>. We're getting your gear ready for dispatch.
        </p>
      </div>

      {/* Order Receipt Card */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        
        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 text-xs">
          <div>
            <div className="text-slate-400">Order Reference</div>
            <div className="text-sm font-bold font-mono text-white mt-0.5">{orderNumber}</div>
          </div>
          <div>
            <div className="text-slate-400">Payment Status</div>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-[11px] border border-emerald-500/20 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PAID</span>
            </span>
          </div>
          <div>
            <div className="text-slate-400">Estimated Dispatch</div>
            <div className="text-slate-200 font-semibold mt-0.5 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Within 24 Hours</span>
            </div>
          </div>
        </div>

        {/* Address & Delivery snapshot */}
        {order?.shippingAddressSnapshot && (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold uppercase tracking-wider text-[11px]">
              <MapPin className="w-3.5 h-3.5" />
              <span>Shipping Destination</span>
            </div>
            <div className="text-white font-semibold">{order.shippingAddressSnapshot.recipientName}</div>
            <div className="text-slate-400">
              {order.shippingAddressSnapshot.addressLine1}
              {order.shippingAddressSnapshot.addressLine2 ? `, ${order.shippingAddressSnapshot.addressLine2}` : ''}
            </div>
            <div className="text-slate-400">
              {order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.state} — {order.shippingAddressSnapshot.postalCode}
            </div>
            <div className="text-slate-500 font-mono">Mobile: +91 {order.shippingAddressSnapshot.phone}</div>
          </div>
        )}

        {/* Purchased Items List */}
        {order && order.items.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Items In This Order
            </h4>
            <div className="divide-y divide-slate-800/80">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productNameSnapshot}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-white">{item.productNameSnapshot}</div>
                      <div className="text-slate-400 text-[11px]">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="text-right font-bold text-white">
                    {formatPrice(item.lineTotal)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-slate-800 flex justify-between text-sm font-extrabold text-white">
              <span>Amount Paid</span>
              <span className="text-indigo-400 text-base">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/orders"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-colors"
        >
          <Package className="w-4 h-4 text-indigo-400" />
          <span>View All Orders</span>
        </Link>

        <Link
          to="/products"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all group"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

    </div>
  );
};
