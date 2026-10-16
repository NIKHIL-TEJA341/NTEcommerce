import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShoppingBag,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/format';
import type { Address, Order } from '../types';

const SHIPPING_THRESHOLD = 1999;
const STANDARD_SHIPPING_FEE = 149;

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCartStore();

  const [address, setAddress] = useState<Address>({
    recipientName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const subtotal = getSubtotal();
  const shippingAmount = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const discountAmount = 0;
  const totalAmount = subtotal + shippingAmount - discountAmount;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">
          Add studio products to your cart before proceeding to checkout.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Catalog</span>
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic Indian validation
    if (!address.recipientName.trim()) {
      setErrorMessage('Please enter the recipient full name.');
      return;
    }
    if (!/^\d{10}$/.test(address.phone.replace(/\D/g, ''))) {
      setErrorMessage('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    if (!address.addressLine1.trim() || !address.city.trim() || !address.state.trim()) {
      setErrorMessage('Please complete your street address, city, and state.');
      return;
    }
    if (!/^\d{6}$/.test(address.postalCode.replace(/\D/g, ''))) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN / Postal code.');
      return;
    }

    setIsProcessing(true);

    const simulatedOrderNumber = `NX-${Date.now().toString().slice(-6)}`;

    const saveOrderAndRedirect = (orderNum: string, paymentId: string) => {
      const newOrder: Order = {
        id: `ord_${Date.now()}`,
        orderNumber: orderNum,
        status: 'paid',
        currency: 'INR',
        subtotal,
        shippingAmount,
        discountAmount,
        totalAmount,
        shippingAddressSnapshot: address,
        items: items.map((item) => ({
          id: `item_${Math.random()}`,
          orderId: `ord_${Date.now()}`,
          productId: item.productId,
          variantId: item.variantId,
          productNameSnapshot: item.product.name,
          skuSnapshot: item.selectedVariant?.sku,
          unitPrice: item.selectedVariant?.priceOverride ?? item.product.price,
          quantity: item.quantity,
          lineTotal: (item.selectedVariant?.priceOverride ?? item.product.price) * item.quantity,
          imageUrl: item.product.imageUrl,
        })),
        createdAt: new Date().toISOString(),
      };

      const existingOrdersRaw = localStorage.getItem('nexus_orders');
      const existingOrders: Order[] = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
      localStorage.setItem('nexus_orders', JSON.stringify([newOrder, ...existingOrders]));

      clearCart();
      setIsProcessing(false);
      navigate(`/order-success?orderNumber=${orderNum}&orderId=${newOrder.id}&paymentId=${paymentId}`);
    };

    try {
      if (paymentMethod === 'cod') {
        await new Promise((resolve) => setTimeout(resolve, 800));
        saveOrderAndRedirect(simulatedOrderNumber, 'COD_ORDER');
        return;
      }

      // Load Razorpay Checkout.js dynamically
      const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
          if ((window as any).Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const loaded = await loadRazorpayScript();
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TofFz9UTVgKv8F';

      if (loaded && (window as any).Razorpay) {
        const options = {
          key: razorpayKey,
          amount: Math.round(totalAmount * 100), // amount in paise
          currency: 'INR',
          name: 'NEXUS Studio Gear',
          description: `Checkout Order ${simulatedOrderNumber}`,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
          prefill: {
            name: address.recipientName,
            contact: address.phone,
          },
          theme: {
            color: '#6366f1',
          },
          handler: (response: any) => {
            saveOrderAndRedirect(simulatedOrderNumber, response.razorpay_payment_id || 'pay_test_verified');
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          setErrorMessage(resp.error?.description || 'Payment was unsuccessful. Please retry.');
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback simulation if offline
        await new Promise((resolve) => setTimeout(resolve, 1200));
        saveOrderAndRedirect(simulatedOrderNumber, 'pay_test_fallback');
      }
    } catch {
      setErrorMessage('Payment process encountered an error. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Title */}
      <div className="border-b border-slate-800/80 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Checkout & Delivery
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete your delivery details and pay securely via Razorpay.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          <Lock className="w-3.5 h-3.5" />
          <span>256-bit Encrypted Checkout</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Delivery Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Shipping Address Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Truck className="w-5 h-5 text-indigo-400" />
              <h3>1. Shipping Address (India)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-medium">Recipient Full Name *</label>
                <input
                  type="text"
                  name="recipientName"
                  required
                  placeholder="e.g. Nikhil Sharma"
                  value={address.recipientName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Mobile Phone (10 Digits) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">+91</span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={address.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-11 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">PIN / Postal Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  maxLength={6}
                  placeholder="560001"
                  value={address.postalCode}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-medium">Flat / House No. / Building Name *</label>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  placeholder="Flat 402, Apex Tower, Indiranagar"
                  value={address.addressLine1}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-medium">Area / Street / Landmark (Optional)</label>
                <input
                  type="text"
                  name="addressLine2"
                  placeholder="Near Metro Station"
                  value={address.addressLine2}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">City / District *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="Bengaluru"
                  value={address.city}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">State *</label>
                <select
                  name="state"
                  required
                  value={address.state}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select State</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Rajasthan">Rajasthan</option>
                </select>
              </div>

            </div>
          </div>

          {/* Payment Method Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <h3>2. Payment Method</h3>
            </div>

            <div className="space-y-3">
              {/* Razorpay Option */}
              <label className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'razorpay'
                  ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      Razorpay Secure (UPI, GPay, Cards, Netbanking)
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-indigo-500 text-white px-2 py-0.5 rounded">
                      Test Mode
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Supports Google Pay, PhonePe, Paytm, RuPay, Visa, Mastercard, and Net Banking.
                  </p>
                </div>
              </label>

              {/* Cash On Delivery Option */}
              <label className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'cod'
                  ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1 space-y-1">
                  <span className="text-xs sm:text-sm font-bold text-white">
                    Cash on Delivery (Pay upon receipt)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Pay via cash or UPI QR directly to the courier executive on delivery.
                  </p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary Snapshot */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 sticky top-28">
            <h3 className="text-base font-bold text-white tracking-tight">Order Summary</h3>

            {/* Items review */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => {
                const price = item.selectedVariant?.priceOverride ?? item.product.price;
                return (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{item.product.name}</h4>
                      <div className="text-slate-400 text-[11px]">Qty: {item.quantity}</div>
                    </div>
                    <span className="font-bold text-white">
                      {formatPrice(price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Cost breakdown */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-medium text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingAmount === 0 ? (
                    <span className="text-emerald-400 font-semibold">FREE (Above ₹1,999)</span>
                  ) : (
                    formatPrice(shippingAmount)
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-extrabold text-white">
                <span>Total Amount</span>
                <span className="text-indigo-400 text-lg">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Submit Payment Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting Razorpay Gateway...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay {formatPrice(totalAmount)} Securely</span>
                </>
              )}
            </button>

            <div className="space-y-1.5 text-center">
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test mode transaction — No actual money is debited</span>
              </p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
