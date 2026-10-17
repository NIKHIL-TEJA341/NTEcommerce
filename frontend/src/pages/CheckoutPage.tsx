import React, { useState, useEffect } from 'react';
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
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/format';
import type { Address, Order } from '../types';
import { api } from '../services/api';

const SHIPPING_THRESHOLD = 0;
const STANDARD_SHIPPING_FEE = 0;

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user, token, isAuthenticated, openAuthModal } = useAuthStore();

  const [address, setAddress] = useState<Address>({
    recipientName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        recipientName: prev.recipientName || user.fullName,
        email: user.email,
      }));
    }
  }, [user]);


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
    const customerEmail = user?.email || address.email;

    const saveOrderAndRedirect = (orderNum: string, paymentId: string) => {
      const newOrder: Order = {
        id: `ord_${Date.now()}`,
        orderNumber: orderNum,
        userId: user?.id,
        customerEmail,
        status: 'paid',
        currency: 'INR',
        subtotal,
        shippingAmount,
        discountAmount,
        totalAmount,
        shippingAddressSnapshot: {
          ...address,
          email: customerEmail,
        },
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

      // 1. Create server-side order on backend via Razorpay Orders API
      let checkoutSession: any = null;
      try {
        checkoutSession = await api.createCheckout(
          {
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            shippingAddress: {
              ...address,
              email: customerEmail,
            },
            userId: user?.id,
            customerEmail,
          },
          token
        );
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to initialize secure checkout with server. Please ensure backend is active.');
        setIsProcessing(false);
        return;
      }

      if (!checkoutSession || !checkoutSession.razorpayOrderId) {
        setErrorMessage('Server failed to initialize Razorpay order. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Use verified server order details and keys
      const activeOrderNumber = checkoutSession.orderNumber;
      const razorpayOrderId = checkoutSession.razorpayOrderId;
      const razorpayKey = checkoutSession.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TofFz9UTVgKv8F';

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

      if (loaded && (window as any).Razorpay) {
        const options: any = {
          key: razorpayKey,
          amount: Math.round(checkoutSession.totalAmount * 100),
          currency: checkoutSession.currency || 'INR',
          name: 'NEXUS Studio Gear',
          description: `Checkout Order ${activeOrderNumber}`,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
          prefill: {
            name: address.recipientName,
            contact: address.phone,
            email: customerEmail,
          },
          theme: {
            color: '#6366f1',
          },
          order_id: razorpayOrderId,
          handler: async (response: any) => {
            setIsProcessing(true);
            try {
              const verifyRes = await api.verifyPayment({
                orderNumber: activeOrderNumber,
                razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature || '',
              });

              if (verifyRes && verifyRes.success) {
                saveOrderAndRedirect(activeOrderNumber, response.razorpay_payment_id);
              } else {
                setErrorMessage(verifyRes?.error || 'Payment verification failed server-side. Please check your transaction.');
                setIsProcessing(false);
              }
            } catch (verErr: any) {
              setErrorMessage(verErr?.message || 'Network error verifying payment with server.');
              setIsProcessing(false);
            }
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
        setErrorMessage('Failed to load Razorpay payment SDK. Please check your connection and retry.');
        setIsProcessing(false);
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

      {/* Google Account Status Banner */}
      {isAuthenticated && user ? (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{user.fullName}</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Google Account Linked</span>
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">{user.email}</span>
            </div>
          </div>
          <span className="text-xs text-indigo-300 font-medium bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
            This order will be saved to your Google account
          </span>
        </div>
      ) : (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Have a Google Account?</span>
              <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-medium">
                Faster Checkout
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Continue with Google to auto-sync your order, track live dispatch, and access your invoice.
            </p>
          </div>
          <button
            type="button"
            onClick={openAuthModal}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
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

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-slate-300 font-medium">
                  Customer Email (For Tracking & Invoice) *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  readOnly={Boolean(user?.email)}
                  placeholder="e.g. nikhil@gmail.com"
                  value={user?.email || address.email || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-80 font-mono"
                />
                {user?.email && (
                  <p className="text-[10px] text-emerald-400">
                    Verified Google email linked to your account.
                  </p>
                )}
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
