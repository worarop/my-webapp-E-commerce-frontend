import React from 'react';
import { ShoppingCart, Star, Box, AlertTriangle } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
  onSelectProduct: (product: Product) => void;
  isAuthenticated: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onSelectProduct,
  isAuthenticated
}: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please select or log in to a user account first (top right button).');
      return;
    }
    try {
      onAddToCart(product.id);
    } catch (err: any) {
      alert(err.message || 'Failed to add to cart');
    }
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/20 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/50 hover:bg-gray-900/40 hover:shadow-2xl hover:shadow-indigo-500/5"
    >
      {/* Product Image Panel */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-950">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-80" />
        
        {/* Category Badge */}
        <span className="absolute top-3 left-3 rounded-lg bg-gray-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/20">
          {product.category}
        </span>
        
        {/* Stock Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-gray-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold border">
          {isOutOfStock ? (
            <span className="text-red-400 border-red-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="text-amber-400 border-amber-500/20 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Low stock ({product.stock})
            </span>
          ) : (
            <span className="text-emerald-400 border-emerald-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {product.stock} in stock
            </span>
          )}
        </div>
      </div>

      {/* Product Metadata Info */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-1 text-amber-400">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span className="text-xs font-semibold">{product.rating.rate.toFixed(1)}</span>
          <span className="text-[10px] text-gray-500 font-medium">({product.rating.count})</span>
        </div>

        <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
          {product.name}
        </h3>

        <p className="mt-2 text-xs text-gray-400 line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Pricing and Cart Buttons */}
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-900">
          <div>
            <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Price</span>
            <span className="text-base font-black text-white">${product.price.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCartClick}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
              isOutOfStock
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-900'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Quick Add
          </button>
        </div>
      </div>
    </div>
  );
}
