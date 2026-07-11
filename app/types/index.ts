export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating: {
    rate: number;
    count: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  balance: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'shipping'
  | 'completed';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paymentDetails?: {
    cardHolder: string;
    cardNumberMasked: string;
    transactionId?: string;
    errorMessage?: string;
  };
}

export interface PaymentJob {
  id: string;
  orderId: string;
  amount: number;
  cardNumber: string;
  cardHolder: string;
  shouldFail: boolean;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface WorkerLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  service: 'catalog' | 'cart' | 'auth' | 'order' | 'payment' | 'worker';
  message: string;
}
