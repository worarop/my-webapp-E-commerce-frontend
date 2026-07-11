import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../services/authApi';
import authReducer from './slices/authSliceNew';
import catalogReducer from './slices/catalogSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import workerReducer from './slices/workerSlice';

export const store = configureStore({
  reducer: {
    // 🔐 Auth API (RTK Query) — ต้องมี reducerPath ตรงกัน
    [authApi.reducerPath]: authApi.reducer,
    // 🔐 Auth State (access token + user)
    auth: authReducer,
    // 📦 Other feature slices
    catalog: catalogReducer,
    cart: cartReducer,
    order: orderReducer,
    worker: workerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      // RTK Query middleware สำหรับ caching, invalidation, polling
      authApi.middleware
    ),
});

// Sync catalog/cart/order/worker state to LocalStorage (ไม่ sync auth — ใช้ sessionStorage + cookie แทน)
store.subscribe(() => {
  const state = store.getState();
  try {
    localStorage.setItem('ec_products', JSON.stringify(state.catalog.products));
    localStorage.setItem('ec_carts', JSON.stringify(state.cart.carts));
    localStorage.setItem('ec_orders', JSON.stringify(state.order.orders));
    localStorage.setItem('ec_payment_queue', JSON.stringify(state.worker.paymentQueue));
    localStorage.setItem('ec_logs', JSON.stringify(state.worker.logs));
  } catch (e) {
    console.error('Failed to sync Redux store state to LocalStorage', e);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
