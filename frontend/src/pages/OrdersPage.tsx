import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShieldCheck,
  ArrowRight,
  Truck,
  Lock,
  RefreshCw,
} from 'lucide-react';
import type { Order } from '../types';
import { formatPrice } from '../utils/format';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

export const OrdersPage: React.FC = () => {
  const { user, isAuthenticated, token, loginWithGoogle, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showGuestOrders, setShowGuestOrders] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setIsLoading(true);

      // 1. Read locally stored orders
      const raw = localStorage.getItem('nexus_orders');
      let localOrders: Order[] = [];
      if (raw) {
        try {
          localOrders = JSON.parse(raw);
        } catch {
          localOrders = [];
        }
      }

      // If user is authenticated, query orders for this customer
      if (isAuthenticated && user) {
        let serverOrders: any[] = [];
        try {
          serverOrders = await api.getOrders({
            token,
            email: user.email,
            userId: user.id,
          });
        } catch (e) {
          console.warn('Could not fetch server orders:', e);
        }

        // Filter local orders to only those belonging to this customer
        const filteredLocal = localOrders.filter(
          (o) =>
            o.userId === user.id ||
            o.customerEmail?.toLowerCase() === user.email.toLowerCase() ||
            o.shippingAddressSnapshot?.email?.toLowerCase() === user.email.toLowerCase()
        );

        // Merge & deduplicate by orderNumber
        const mergedMap = new Map<string, Order>();
        for (const o of serverOrders) {
          if (o.order_number) {
            mergedMap.set(o.order_number, {
              id: o.id,
              orderNumber: o.order_number,
              userId: o.user_id,
              customerEmail: o.shipping_address_snapshot?.email || user.email,
              status: o.status || 'paid',
              currency: o.currency || 'INR',
              subtotal: Number(o.subtotal || 0),
              shippingAmount: Number(o.shipping_amount || 0),
              discountAmount: Number(o.discount_amount || 0),
              totalAmount: Number(o.total_amount || 0),
              shippingAddressSnapshot: o.shipping_address_snapshot || {},
              items: (o.order_items || []).map((it: any) => ({
                id: it.id,
                orderId: it.order_id,
                productId: it.product_id,
                productNameSnapshot: it.product_name_snapshot,
                skuSnapshot: it.sku_snapshot,
                unitPrice: Number(it.unit_price || 0),
                quantity: it.quantity,
                lineTotal: Number(it.line_total || 0),
                imageUrl: it.image_url,
              })),
              createdAt: o.created_at || new Date().toISOString(),
            });
          }
        }
        for (const o of filteredLocal) {
          if (!mergedMap.has(o.orderNumber)) {
            mergedMap.set(o.orderNumber, o);
          }
        }

        if (isMounted) {
          setOrders(Array.from(mergedMap.values()));
          setIsLoading(false);
        }
      } else {
        // Not authenticated
        if (isMounted) {
          if (showGuestOrders) {
            setOrders(localOrders);
          } else {
            setOrders([]);
          }
          setIsLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, token, showGuestOrders]);

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
      <div className="border-b border-slate-800/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Customer Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track and view your studio equipment orders, invoices, and dispatch statuses.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Authenticated Customer Banner */}
      {isAuthenticated && user && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">{user.fullName}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Google Account</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Total Account Orders</span>
              <span className="text-white font-extrabold text-sm">{orders.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Unauthenticated State: Sign In with Google Prompt */}
      {!isAuthenticated && !showGuestOrders && (
        <div className="glass-panel rounded-3xl border border-slate-800 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Sign In to View Your Orders</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              To protect customer privacy and manage your personal equipment dispatches, each customer has their own dedicated account.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={() => loginWithGoogle('/orders')}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-lg transition-all active:scale-[0.99] cursor-pointer"
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
              <span className="text-sm">Continue with Google</span>
            </button>

            <p className="text-[11px] text-slate-500">
              Only verified Google accounts (<strong className="text-slate-400">@gmail.com</strong>) are permitted.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setShowGuestOrders(true)}
              className="text-xs text-slate-400 hover:text-indigo-400 transition-colors underline cursor-pointer"
            >
              Or view guest orders saved in this browser
            </button>
          </div>
        </div>
      )}

      {/* Orders List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading customer order records...</span>
        </div>
      ) : (isAuthenticated || showGuestOrders) && orders.length === 0 ? (
        <div className="glass-panel rounded-3xl border border-slate-800 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No orders found for this account</h3>
            <p className="text-xs text-slate-400">
              When you complete checkout via Razorpay, your order summaries and tracking will appear here.
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
              key={order.id || order.orderNumber}
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
                {order.items?.map((item, idx) => (
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
