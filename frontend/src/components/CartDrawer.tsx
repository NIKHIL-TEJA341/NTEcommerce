import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/format';

const FREE_SHIPPING_THRESHOLD = 1999;

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    isOpen,
    closeCart,
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
  } = useCartStore();

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Your Cart</h2>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          <div className="bg-slate-950/60 p-3 sm:px-6 border-b border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Truck className="w-3.5 h-3.5 text-indigo-400" />
                {freeShippingRemaining === 0 ? (
                  <span className="text-emerald-400 font-semibold">Free Express Shipping Unlocked!</span>
                ) : (
                  <span>
                    Add <strong className="text-indigo-300">{formatPrice(freeShippingRemaining)}</strong> for Free Delivery
                  </span>
                )}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  freeShippingRemaining === 0 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                }`}
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white font-semibold text-base">Your cart is empty</h3>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Discover studio-grade acoustics, titanium wearables, and high-performance gear.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/products');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              items.map((item) => {
                const unitPrice = item.selectedVariant?.priceOverride ?? item.product.price;
                const maxStock = item.selectedVariant
                  ? item.selectedVariant.stockQuantity
                  : item.product.stockQuantity;

                return (
                  <div
                    key={item.id}
                    className="flex gap-3.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 relative group"
                  >
                    {/* Image */}
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-lg object-cover bg-slate-800 shrink-0"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="space-y-0.5 pr-6">
                        <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                          {item.product.name}
                        </h4>
                        {item.selectedVariant && (
                          <p className="text-[11px] text-indigo-400">
                            {Object.entries(item.selectedVariant.attributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' • ')}
                          </p>
                        )}
                        <p className="text-xs font-bold text-white">
                          {formatPrice(unitPrice, item.product.currency)}
                        </p>
                      </div>

                      {/* Quantity Controls & Remove */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-medium text-white min-w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= maxStock}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-semibold text-slate-300">
                          {formatPrice(unitPrice * item.quantity, item.product.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2.5 right-2.5 p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/80 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-slate-300">
                    {freeShippingRemaining === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      formatPrice(149)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-800/80 font-bold text-white">
                  <span>Total Payable</span>
                  <span className="text-indigo-400 text-base">
                    {formatPrice(subtotal + (freeShippingRemaining === 0 ? 0 : 149))}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group transition-all"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-[11px] text-center text-slate-500">
                Protected by 256-bit SSL encryption & Razorpay
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
