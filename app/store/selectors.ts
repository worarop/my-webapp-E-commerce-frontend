import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { selectCurrentUser as selectAuthUser } from './slices/authSliceNew';

// Base selectors (primitive - ไม่ต้อง memoize)
// ใช้ currentUser จาก authSliceNew (RTK Query based)
export const selectCurrentUser = (state: RootState) => selectAuthUser(state as any);
export const selectProducts = (state: RootState) => state.catalog.products;
export const selectCarts = (state: RootState) => state.cart.carts;
export const selectAllOrders = (state: RootState) => state.order.orders;
export const selectPaymentQueue = (state: RootState) => state.worker.paymentQueue;
export const selectLogs = (state: RootState) => state.worker.logs;
export const selectIsWorkerRunning = (state: RootState) => state.worker.isWorkerRunning;
export const selectCurrentUserId = (state: RootState) => selectAuthUser(state as any)?.id;

// Memoized derived selectors (สร้าง array/object ใหม่ → ต้อง memoize)
export const selectCurrentUserCart = createSelector(
  [selectCarts, selectCurrentUserId],
  (carts, userId) => {
    if (!userId) return [];
    return carts[userId] ?? [];
  }
);

export const selectCurrentUserOrders = createSelector(
  [selectAllOrders, selectCurrentUserId],
  (orders, userId) => {
    if (!userId) return [];
    return orders
      .filter(o => o.userId === userId)
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
);
