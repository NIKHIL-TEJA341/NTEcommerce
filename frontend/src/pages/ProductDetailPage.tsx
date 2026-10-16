import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { mockProducts } from '../data/mockCatalog';
import type { ProductVariant } from '../types';
import { formatPrice } from '../utils/format';
import { useCartStore } from '../store/cartStore';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const product = mockProducts.find((p) => p.id === id || p.slug === id);

  // States
  const [selectedImage, setSelectedImage] = useState<string>(
    product?.imageUrl || ''
  );
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">
          The requested product could not be located in our catalog.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.priceOverride ?? product.price;
  const originalPrice = product.originalPrice;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null;

  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity, selectedVariant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, quantity, selectedVariant);
    navigate('/checkout');
  };

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link to="/products" className="hover:text-white transition-colors">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        {product.categoryName && (
          <>
            <Link
              to={`/products?category=${product.categoryId}`}
              className="hover:text-white transition-colors"
            >
              {product.categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </>
        )}
        <span className="text-slate-200 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Photo */}
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
            <img
              src={selectedImage || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discountPercent && discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all bg-slate-900 shrink-0 ${
                    (selectedImage || product.imageUrl) === img
                      ? 'border-indigo-500 scale-102 ring-2 ring-indigo-500/20'
                      : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Config & Purchase Details */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="space-y-2">
            {product.categoryName && (
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                {product.categoryName}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {product.name}
            </h1>
            
            {/* Rating & Review Counter */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <span className="font-bold text-white">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400">({product.reviewsCount} verified reviews)</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium">In Stock ({currentStock} available)</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {formatPrice(currentPrice, product.currency)}
              </span>
              {originalPrice && originalPrice > currentPrice && (
                <span className="text-sm text-slate-500 line-through">
                  {formatPrice(originalPrice, product.currency)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Inclusive of all taxes • Eligible for FREE Express Delivery in India
            </p>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-200">
                Select Option / Configuration:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const label = Object.values(variant.attributes).join(' / ');
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-xl text-left border text-xs transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold">{label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {variant.priceOverride ? formatPrice(variant.priceOverride) : 'Standard Price'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-700 rounded-xl bg-slate-900 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-slate-400 hover:text-white transition-colors"
                  aria-label="Decrease"
                >
                  -
                </button>
                <span className="px-3 text-xs font-mono font-bold text-white min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock}
                  className="px-2.5 py-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                  aria-label="Increase"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Instant Buy via Razorpay</span>
            </button>
          </div>

          {/* Guarantees Box */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80 text-center">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <Truck className="w-4 h-4 text-indigo-400 mx-auto" />
              <div className="text-[11px] font-semibold text-white">Free Delivery</div>
              <div className="text-[10px] text-slate-500">Above ₹1,999</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto" />
              <div className="text-[11px] font-semibold text-white">1-Year Warranty</div>
              <div className="text-[10px] text-slate-500">Official support</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <RotateCcw className="w-4 h-4 text-amber-400 mx-auto" />
              <div className="text-[11px] font-semibold text-white">7-Day Replacement</div>
              <div className="text-[10px] text-slate-500">No questions asked</div>
            </div>
          </div>

        </div>

      </div>

      {/* Feature Highlights & Specifications Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-800">
        
        {/* Features Checklist */}
        {product.features && product.features.length > 0 && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">Key Features & Engineering</h3>
            <ul className="space-y-3">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                  <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Technical Specs Table */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">Technical Specifications</h3>
            <div className="divide-y divide-slate-800/80">
              {Object.entries(product.specs).map(([label, val], idx) => (
                <div key={idx} className="py-2.5 flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-semibold text-white text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Verified Reviews Section Preview */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Customer Reviews</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Based on {product.reviewsCount} verified purchases in India
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
            <div className="flex items-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-base font-bold text-white">{product.rating.toFixed(1)} out of 5</div>
              <div className="text-[10px] text-slate-400">98% recommendation rate</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Arjun M. (Bengaluru)</span>
              <span className="text-[11px] text-emerald-400">Verified Buyer</span>
            </div>
            <div className="flex items-center text-amber-400 text-xs">
              {'★'.repeat(5)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "The build quality is astonishing. Arrived in Bengaluru in 36 hours. Seamless sound stage and ANC."
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Pooja S. (Mumbai)</span>
              <span className="text-[11px] text-emerald-400">Verified Buyer</span>
            </div>
            <div className="flex items-center text-amber-400 text-xs">
              {'★'.repeat(5)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Paid via Razorpay UPI in seconds. Premium packaging and finish. Exactly as pictured!"
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
