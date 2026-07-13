import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import type { CartItem, Product, User } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  currentUser: User | null;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: (items: { productId: string; quantity: number }[], paymentInfo: any) => void;
  onOpenAuthModal: () => void;
}

export function CartSidebar({
  isOpen,
  onClose,
  cart,
  products,
  currentUser,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  onOpenAuthModal
}: CartSidebarProps) {
  const [cardHolder, setCardHolder] = useState(currentUser?.name || '');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync cardHolder with logged-in user name
  React.useEffect(() => {
    if (currentUser) {
      setCardHolder(currentUser.name);
    } else {
      setCardHolder('');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Resolve Cart Items with actual Product Metadata
  const cartItemsWithDetails = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product
    };
  }).filter(item => item.product !== undefined) as (CartItem & { product: Product })[];

  const subtotal = cartItemsWithDetails.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.07; // 7% VAT
  const shipping = subtotal > 150 ? 0 : 15.00;
  const total = subtotal + tax + shipping;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    if (!currentUser) {
      alert('Please log in to proceed with checkout.');
      onOpenAuthModal();
      return;
    }

    if (currentUser.balance < total) {
      alert(`Insufficient account balance! Your balance: $${currentUser.balance.toFixed(2)}, Order total: $${total.toFixed(2)}. Click the '+ $200' button in the top navbar to deposit funds.`);
      return;
    }

    setIsSubmitting(true);
    try {
      onCheckout(
        cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
        {
          cardHolder,
          cardNumber: cardNumber.replace(/\s/g, ''),
          simulateFailure
        }
      );
      onClose();
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Sidebar Panel */}
      <div className="w-full max-w-md border-l border-gray-800 bg-gray-950 p-6 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-900">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Shopping Cart</h2>
            <span className="rounded-full bg-gray-900 border border-gray-800 px-2 py-0.5 text-xs text-gray-400 font-semibold">
              {cartItemsWithDetails.length} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-900 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cart Contents */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {cartItemsWithDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <ShoppingBag className="h-10 w-10 text-gray-700 mb-2 animate-bounce" />
              <p className="text-xs font-semibold text-gray-400">Your cart is empty</p>
              <p className="text-[10px] text-gray-500 max-w-[200px] mt-1">Browse products and add them to your cart to begin shopping.</p>
            </div>
          ) : (
            cartItemsWithDetails.map((item) => {
              const isOutOfStock = item.product.stock <= 0;
              const isLowStock = item.product.stock > 0 && item.product.stock <= 5;
              
              return (
                <div
                  key={item.productId}
                  className="flex gap-4 rounded-xl border border-gray-900 bg-gray-900/10 p-3 hover:border-gray-850 hover:bg-gray-900/20 transition-all duration-200"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-16 w-16 rounded-lg object-cover bg-gray-950 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                    <p className="text-[10px] text-gray-500 mb-2">${item.product.price.toFixed(2)} each</p>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-gray-950 border border-gray-900 rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                          className="flex h-5 w-5 items-center justify-center rounded text-xs font-black text-gray-400 hover:bg-gray-900 hover:text-white"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-semibold text-white">{item.quantity}</span>
                        <button
                          onClick={() => {
                            try {
                              onUpdateQuantity(item.productId, item.quantity + 1);
                            } catch (e: any) {
                              alert(e.message);
                            }
                          }}
                          className="flex h-5 w-5 items-center justify-center rounded text-xs font-black text-gray-400 hover:bg-gray-900 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      {/* Stock alerts inside cart */}
                      <span className="text-[10px] font-semibold text-gray-500">
                        {isOutOfStock ? (
                          <span className="text-red-400 font-bold">Out of stock</span>
                        ) : isLowStock ? (
                          <span className="text-amber-400 font-bold">Only {item.product.stock} left</span>
                        ) : null}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    <span className="text-xs font-bold text-white">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => onRemove(item.productId)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                      title="Remove product"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pricing Summary & Checkout Block */}
        {cartItemsWithDetails.length > 0 && (
          <div className="border-t border-gray-900 pt-4 space-y-4">
            <div className="space-y-1.5 text-xs text-gray-400 bg-gray-900/20 rounded-xl border border-gray-900 p-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (7%)</span>
                <span className="text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-white">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-900">
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Order Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Simulated Checkout Form */}
            <form onSubmit={handleCheckoutSubmit} className="space-y-3 bg-gray-900/30 rounded-xl border border-gray-900 p-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider mb-2">
                <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
                Simulated Payment Details
              </h3>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Cardholder Name"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full rounded-lg border border-gray-850 bg-gray-950 px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-lg border border-gray-850 bg-gray-950 px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Toggle to trigger payment failures */}
              <div className="flex items-center justify-between rounded-lg border border-red-500/10 bg-red-500/5 px-2.5 py-2">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                  <span className="text-[10px] font-semibold text-red-400">Simulate Payment Failure</span>
                </div>
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="h-3.5 w-3.5 accent-red-600 rounded cursor-pointer"
                />
              </div>

              <div className="text-[10px] text-gray-500 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Orders deduct funds from your account balance.</span>
              </div>

              {/* Checkout CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting Order...' : `Proceed to Checkout • $${total.toFixed(2)}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
