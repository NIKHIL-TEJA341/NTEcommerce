import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import type { Order } from '../types';
import { formatPrice } from '../utils/format';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('nexus_orders');
    if (raw) {
      try {
        setOrders(JSON.parse(raw));
      } catch {
        setOrders([]);
      }
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-[11px] border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            <span>Paid (Razorpay)</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full text-[11px] border border-indigo-500/20">
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full text-[11px] border border-blue-500/20">
            <span>Delivered</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full text-[11px] border border-amber-500/20">
            <span>Processing</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Order History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track and view your recent studio equipment orders and delivery status.
          </p>
        </div>
        <Link
          to="/products"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-slate-800 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No orders placed yet</h3>
            <p className="text-xs text-slate-400">
              When you complete checkout via Razorpay, your order summary and tracking will appear here.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl"
            >
              {/* Order Meta Header */}
              <div className="p-4 sm:p-6 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Order Number</span>
                  <div className="font-mono font-bold text-white text-sm mt-0.5">
                    {order.orderNumber}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Date Placed</span>
                  <div className="font-medium text-slate-200 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Recipient</span>
                  <div className="font-medium text-slate-200 mt-0.5">
                    {order.shippingAddressSnapshot?.recipientName || 'Customer'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Total Paid</span>
                  <div className="font-extrabold text-indigo-400 text-sm mt-0.5">
                    {formatPrice(order.totalAmount, order.currency)}
                  </div>
                </div>

                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Order Items */}
              <div className="p-4 sm:p-6 divide-y divide-slate-800/80">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs gap-4">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productNameSnapshot}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-800 shrink-0"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          {item.productNameSnapshot}
                        </h4>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          Qty: {item.quantity} • {formatPrice(item.unitPrice, order.currency)} each
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-bold text-white text-sm">
                      {formatPrice(item.lineTotal, order.currency)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery snapshot footer */}
              {order.shippingAddressSnapshot && (
                <div className="px-4 sm:px-6 py-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px]">
                  <span>
                    Delivering to:{' '}
                    <strong className="text-slate-300">
                      {order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.state}
                    </strong>
                  </span>
                  <span className="text-emerald-400 font-medium">Standard Dispatch (2-3 Business Days)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
