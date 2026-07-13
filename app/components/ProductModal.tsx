import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingCart, ShieldAlert, Award, RefreshCw } from 'lucide-react';
import type { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (productId: string, quantity: number) => void;
  isAuthenticated: boolean;
}

export function ProductModal({
  product,
  onClose,
  onAddToCart,
  isAuthenticated
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    try {
      onAddToCart(product.id, quantity);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-800 bg-gray-950 p-6 md:p-8 shadow-2xl shadow-black animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900/50 text-gray-400 hover:border-gray-700 hover:bg-gray-900 hover:text-white transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Image Pane */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-900">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 to-transparent" />
          </div>

          {/* Details Pane */}
          <div className="flex flex-col h-full">
            <span className="text-[10px] w-fit rounded-lg bg-indigo-500/10 px-2.5 py-1 font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/20 mb-3">
              {product.category}
            </span>

            <h2 className="text-xl font-extrabold text-white mb-2 leading-tight">
              {product.name}
            </h2>

            {/* Ratings info */}
            <div className="flex items-center gap-1 text-amber-400 mb-4">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-semibold">{product.rating.rate.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({product.rating.count} reviews)</span>
            </div>

            {/* Price section */}
            <div className="mb-6 rounded-2xl bg-gray-900/40 border border-gray-900 p-4">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Standard Retail Price</span>
              <span className="text-2xl font-black text-white">${product.price.toFixed(2)}</span>
            </div>

            {/* Product description */}
            <p className="text-xs text-gray-400 leading-relaxed mb-6 flex-1">
              {product.description}
            </p>

            {/* Microservice Stock status indicator */}
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl border border-gray-900 bg-gray-900/10">
              <div className="flex-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Inventory Microservice</span>
                <span className="text-xs font-semibold text-gray-300">
                  Current Stock: <span className={isOutOfStock ? 'text-red-400' : 'text-emerald-400 font-bold'}>{product.stock} units</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-gray-950 border border-gray-800 px-2 py-1 text-xs">
                {isOutOfStock ? (
                  <span className="text-red-400 flex items-center gap-1 font-bold">
                    <ShieldAlert className="h-3 w-3" /> Out
                  </span>
                ) : isLowStock ? (
                  <span className="text-amber-400 flex items-center gap-1 font-bold animate-pulse">
                    <ShieldAlert className="h-3 w-3" /> Low
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <Award className="h-3 w-3" /> Healthy
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {!isOutOfStock ? (
              <div className="space-y-4">
                {/* Quantity adjuster */}
                <div className="flex items-center justify-between border border-gray-900 rounded-xl bg-gray-950 p-2">
                  <span className="text-xs font-bold text-gray-400 pl-2">Quantity</span>
                  <div className="flex items-center gap-3 bg-gray-900 rounded-lg p-1">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded bg-gray-850 hover:bg-gray-800 text-sm font-bold text-white transition-all"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="flex h-7 w-7 items-center justify-center rounded bg-gray-850 hover:bg-gray-800 text-sm font-bold text-white transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to cart trigger button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-xs font-bold text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/25 active:scale-[0.98] transition-all"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart • ${(product.price * quantity).toFixed(2)}
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 text-center">
                <p className="text-xs font-semibold text-red-400">
                  This item is currently out of stock. Stock replenishment can be triggered in the Admin panel.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
