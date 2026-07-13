import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  selectProducts,
  selectAllOrders,
  selectPaymentQueue,
  selectLogs,
  selectIsWorkerRunning,
  selectCurrentUserCart,
  selectCurrentUserOrders,
} from '../store/selectors';
import { selectCurrentUser } from '../store/slices/authSliceNew';
import { 
  addProduct as addProductAction, 
  updateProduct as updateProductAction, 
  deleteProduct as deleteProductAction, 
  adjustStock 
} from '../store/slices/catalogSlice';
import { 
  addToCart as addToCartAction, 
  updateCartQuantity as updateCartQuantityAction, 
  removeFromCart as removeFromCartAction, 
  clearCart as clearCartAction 
} from '../store/slices/cartSlice';
import { 
  addOrder, 
  updateOrderStatus as updateOrderStatusAction 
} from '../store/slices/orderSlice';
import { 
  queuePaymentJob, 
  addLog, 
  clearLogs as clearLogsAction 
} from '../store/slices/workerSlice';
import { workerService } from '../services/worker';
import type { Order, PaymentJob, Product, OrderStatus, WorkerLog } from '../types';

export function useStore() {
  const dispatch = useDispatch<AppDispatch>();

  // ใช้ memoized selectors ทั้งหมด เพื่อป้องกัน re-render ไม่จำเป็น
  const products = useSelector(selectProducts);
  // currentUser มาจาก new authSliceNew (RTK Query based)
  const currentUser = useSelector((state: RootState) => selectCurrentUser(state as any));
  const logs = useSelector(selectLogs);
  const allOrders = useSelector(selectAllOrders);
  const paymentQueue = useSelector(selectPaymentQueue);
  const isWorkerRunning = useSelector(selectIsWorkerRunning);
  const cart = useSelector(selectCurrentUserCart);
  const orders = useSelector(selectCurrentUserOrders);

  return {
    products,
    currentUser,
    logs,
    allOrders,
    paymentQueue,
    isWorkerRunning,
    cart,
    orders,

    // Catalog Service
    getProductById: (id: string) => products.find(p => p.id === id),
    
    addProduct: (product: Omit<Product, 'id' | 'rating'>) => {
      dispatch(addProductAction(product));
      dispatch(addLog({
        type: 'success',
        service: 'catalog',
        message: `Product SKU added: ${product.name}`
      }));
    },

    updateProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => {
      dispatch(updateProductAction({ id, updates }));
      const prod = products.find(p => p.id === id);
      dispatch(addLog({
        type: 'info',
        service: 'catalog',
        message: `Product SKU updated: ${prod?.name || id}`
      }));
    },

    deleteProduct: (id: string) => {
      const prod = products.find(p => p.id === id);
      dispatch(deleteProductAction(id));
      dispatch(addLog({
        type: 'warning',
        service: 'catalog',
        message: `Product SKU deleted: ${prod?.name || id}`
      }));
    },

    adjustStock: (id: string, change: number) => {
      dispatch(adjustStock({ id, change }));
    },

    replenishStock: (id: string, qty: number) => {
      dispatch(addLog({
        type: 'info',
        service: 'worker',
        message: `[Worker] Stock replenishment triggered for ${id}. Adding ${qty} items.`
      }));
      dispatch(adjustStock({ id, change: qty }));
    },

    // Cart Service
    addToCart: (productId: string, quantity: number = 1) => {
      const userId = currentUser?.id || 'guest';
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }
      
      const existing = cart.find(item => item.productId === productId);
      const desiredQty = existing ? existing.quantity + quantity : quantity;
      
      if (desiredQty > product.stock) {
        dispatch(addLog({
          type: 'warning',
          service: 'cart',
          message: `Failed to add to cart: Requested ${desiredQty} of ${product.name}, only ${product.stock} in stock`
        }));
        throw new Error(`Insufficient stock. Only ${product.stock} units available.`);
      }

      dispatch(addToCartAction({ userId, productId, quantity }));
      dispatch(addLog({
        type: 'info',
        service: 'cart',
        message: `Added ${quantity}x ${product.name} to cart`
      }));
    },

    updateCartQuantity: (productId: string, quantity: number) => {
      const userId = currentUser?.id || 'guest';
      const product = products.find(p => p.id === productId);
      if (!product) return;

      if (quantity <= 0) {
        dispatch(removeFromCartAction({ userId, productId }));
        dispatch(addLog({
          type: 'info',
          service: 'cart',
          message: `Removed ${product.name} from cart`
        }));
        return;
      }

      if (quantity > product.stock) {
        dispatch(addLog({
          type: 'warning',
          service: 'cart',
          message: `Failed to update cart: Requested ${quantity} of ${product.name}, only ${product.stock} in stock`
        }));
        throw new Error(`Insufficient stock. Only ${product.stock} units available.`);
      }

      dispatch(updateCartQuantityAction({ userId, productId, quantity }));
      dispatch(addLog({
        type: 'info',
        service: 'cart',
        message: `Updated ${product.name} quantity in cart to ${quantity}`
      }));
    },

    removeFromCart: (productId: string) => {
      const userId = currentUser?.id || 'guest';
      const product = products.find(p => p.id === productId);
      dispatch(removeFromCartAction({ userId, productId }));
      dispatch(addLog({
        type: 'info',
        service: 'cart',
        message: `Removed ${product?.name || productId} from cart`
      }));
    },

    clearCart: () => {
      const userId = currentUser?.id || 'guest';
      dispatch(clearCartAction(userId));
      dispatch(addLog({
        type: 'info',
        service: 'cart',
        message: `Cleared cart for user ${currentUser?.name || 'guest'}`
      }));
    },

    // Auth Service — Login/Register/Logout จัดการโดย useAuth hook (RTK Query)
    // depositBalance ยังใช้ได้จาก store
    depositBalance: (amount: number) => {
      if (!currentUser) return;
      dispatch(addLog({
        type: 'success',
        service: 'auth',
        message: `Deposited $${amount.toFixed(2)} to ${currentUser.name}.`
      }));
    },

    // Order Service
    createOrder: (items: { productId: string; quantity: number }[], paymentInfo: any) => {
      if (!currentUser) throw new Error('Please login first');

      const orderItems: Order['items'] = [];
      let totalAmount = 0;

      // 1. Stock validation & building items
      for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        orderItems.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.image
        });
        totalAmount += product.price * item.quantity;
      }

      // 2. Reserve Stock temporarily
      for (const item of items) {
        dispatch(adjustStock({ id: item.productId, change: -item.quantity }));
      }

      // 3. Create Order object
      const orderId = `ord-${Date.now()}`;
      const tax = totalAmount * 0.07;
      const shipping = totalAmount > 150 ? 0 : 15.00;
      const grandTotal = totalAmount + tax + shipping;

      const newOrder: Order = {
        id: orderId,
        userId: currentUser.id,
        items: orderItems,
        totalAmount: Number(grandTotal.toFixed(2)),
        status: 'pending_payment',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentDetails: {
          cardHolder: paymentInfo.cardHolder,
          cardNumberMasked: `**** **** **** ${paymentInfo.cardNumber.slice(-4) || '1234'}`
        }
      };

      dispatch(addOrder(newOrder));
      dispatch(addLog({
        type: 'success',
        service: 'order',
        message: `Order ${orderId} created (Pending Payment). Stock reserved.`
      }));

      // 4. Clear Cart
      dispatch(clearCartAction(currentUser.id));

      // 5. Queue Payment Gateway Job
      const job: PaymentJob = {
        id: `job-${Date.now()}`,
        orderId,
        amount: newOrder.totalAmount,
        cardNumber: paymentInfo.cardNumber,
        cardHolder: paymentInfo.cardHolder,
        shouldFail: paymentInfo.simulateFailure,
        status: 'queued',
        createdAt: new Date().toISOString()
      };

      dispatch(queuePaymentJob(job));
      dispatch(addLog({
        type: 'info',
        service: 'payment',
        message: `Queued payment processing job ${job.id} for Order ${orderId}`
      }));

      // Transition order status to payment_processing
      dispatch(updateOrderStatusAction({
        orderId,
        status: 'payment_processing'
      }));

      return newOrder;
    },

    updateOrderStatus: (orderId: string, status: OrderStatus) => {
      dispatch(updateOrderStatusAction({ orderId, status }));
      dispatch(addLog({
        type: 'info',
        service: 'order',
        message: `Order ${orderId} status manually updated to ${status}`
      }));
    },

    // Worker Controls
    stopWorker: () => workerService.stop(),
    resumeWorker: () => workerService.resume(),
    clearLogs: () => {
      dispatch(clearLogsAction());
      dispatch(addLog({
        type: 'info',
        service: 'worker',
        message: 'System logs cleared.'
      }));
    },
    addLog: (type: WorkerLog['type'], service: WorkerLog['service'], message: string) => {
      dispatch(addLog({ type, service, message }));
    }
  };
}
