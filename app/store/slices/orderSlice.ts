import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Order, OrderStatus } from '../../types';

interface OrderState {
  orders: Order[];
}

const loadInitialState = (): OrderState => {
  if (typeof window === 'undefined') return { orders: [] };
  try {
    const storedOrders = localStorage.getItem('ec_orders');
    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    return { orders };
  } catch (e) {
    return { orders: [] };
  }
};

const initialState: OrderState = loadInitialState();

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: OrderStatus; errorMessage?: string; transactionId?: string }>) => {
      const { orderId, status, errorMessage, transactionId } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        if (order.paymentDetails) {
          if (errorMessage !== undefined) {
            order.paymentDetails.errorMessage = errorMessage;
          }
          if (transactionId !== undefined) {
            order.paymentDetails.transactionId = transactionId;
          }
        }
      }
    }
  }
});

export const { addOrder, updateOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;
