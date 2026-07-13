import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../types';
import { authApi } from '../../services/authApi';

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
  },
  extraReducers: (builder) => {
    // Merge guest cart items into the user's cart on login or register success
    const mergeCart = (state: CartState, action: any) => {
      const userId = action.payload?.user?.id;
      if (!userId) return;
      
      const guestCart = state.carts['guest'] || [];
      if (guestCart.length === 0) return;

      if (!state.carts[userId]) {
        state.carts[userId] = [];
      }

      for (const guestItem of guestCart) {
        const existing = state.carts[userId].find(item => item.productId === guestItem.productId);
        if (existing) {
          existing.quantity += guestItem.quantity;
        } else {
          state.carts[userId].push({ ...guestItem });
        }
      }
      
      // Clear the guest cart after merge
      state.carts['guest'] = [];
    };

    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, mergeCart)
      .addMatcher(authApi.endpoints.register.matchFulfilled, mergeCart);
  }
});

export const { addToCart, updateCartQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
