import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Check } from 'lucide-react';
import type { Product } from '../types';
import { formatPrice } from '../utils/format';
import { useCartStore } from '../store/cartStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="group glass-card rounded-2xl overflow-hidden flex flex-col relative border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300">
      
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {discountPercent && discountPercent > 0 && (
          <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wide">
            Save {discountPercent}%
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-indigo-600/90 backdrop-blur-sm text-indigo-100 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-400/30">
            Featured
          </span>
        )}
      </div>

      {/* Stock warning pill if low stock */}
      {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
        <div className="absolute top-3 right-3 z-10 bg-amber-500/20 backdrop-blur-sm border border-amber-500/40 text-amber-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
          Only {product.stockQuantity} left
        </div>
      )}

      {/* Product Image Link */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-900/80">
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
            isOutOfStock ? 'opacity-40 grayscale' : ''
          }`}
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
            <span className="bg-slate-900 text-rose-400 border border-rose-500/40 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-gradient-to-b from-slate-900/30 to-slate-950/60">
        <div className="space-y-1.5">
          {product.categoryName && (
            <span className="text-[11px] font-medium text-indigo-400 uppercase tracking-wider">
              {product.categoryName}
            </span>
          )}

          <Link to={`/products/${product.id}`} className="block">
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base line-clamp-1 group-hover:text-indigo-300 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="font-medium text-slate-200">{product.rating.toFixed(1)}</span>
            <span className="text-slate-500">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-white tracking-tight">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-500 line-through">
                {formatPrice(product.originalPrice, product.currency)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:scale-102 active:scale-98'
            }`}
            title="Add to Cart"
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
