import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../types';

interface CartState {
  carts: Record<string, CartItem[]>;
}

const loadInitialState = (): CartState => {
  if (typeof window === 'undefined') return { carts: {} };
  try {
    const storedCarts = localStorage.getItem('ec_carts');
    const carts = storedCarts ? JSON.parse(storedCarts) : {};
    return { carts };
  } catch (e) {
    return { carts: {} };
  }
};

const initialState: CartState = loadInitialState();

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ userId: string; productId: string; quantity: number }>) => {
      const { userId, productId, quantity } = action.payload;
      if (!state.carts[userId]) {
        state.carts[userId] = [];
      }
      const existing = state.carts[userId].find(item => item.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.carts[userId].push({ productId, quantity });
      }
    },
    updateCartQuantity: (state, action: PayloadAction<{ userId: string; productId: string; quantity: number }>) => {
      const { userId, productId, quantity } = action.payload;
      if (!state.carts[userId]) return;

      if (quantity <= 0) {
        state.carts[userId] = state.carts[userId].filter(item => item.productId !== productId);
      } else {
        const existing = state.carts[userId].find(item => item.productId === productId);
        if (existing) {
          existing.quantity = quantity;
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<{ userId: string; productId: string }>) => {
      const { userId, productId } = action.payload;
      if (!state.carts[userId]) return;
      state.carts[userId] = state.carts[userId].filter(item => item.productId !== productId);
    },
    clearCart: (state, action: PayloadAction<string>) => {
      state.carts[action.payload] = [];
    }
  }
});

export const { addToCart, updateCartQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
